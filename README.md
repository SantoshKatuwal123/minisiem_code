# Mini SIEM

A lightweight Security Information and Event Management (SIEM) system built for small IT environments, labs and learning. It collects logs, normalizes them, runs correlation rules to raise alerts, and shows everything in a web dashboard. It also includes a log simulator, a local AI assistant (via Ollama), and a script for shipping real Linux `auth.log` entries from a VM.

## Features

- **Log ingestion**: REST API that accepts raw logs and stores them in SQLite
- **Normalization**: parses raw SSH (`linux_auth`) and Apache/Nginx (`apache_access`) lines into structured JSON
- **Correlation engine**: rule-based detection that creates alerts automatically
- **Dashboard**: Next.js admin UI with KPIs, charts, alerts, logs, and pagination
- **Authentication**: user registration and login with Argon2 password hashing and JWT bearer tokens
- **Attack simulation**: start and stop simulated traffic (brute force, SQL injection, port scan, malware callback) from the UI or API
- **AI assistant**: chat page backed by a local [Ollama](https://ollama.com) model, scoped to Mini SIEM topics
- **VM ingestor**: ships the latest lines of `/var/log/auth.log` from a Linux host or VM to the SIEM

## Detection Rules

| Rule | Trigger | Severity |
|------|---------|----------|
| Privileged Access Detected | `sudo` in the log, or a successful login as `root` | HIGH |
| Brute Force Attack | 5 or more failed SSH logins from the same IP within 1 minute | CRITICAL |
| SQL Injection Attempt | `UNION SELECT` or `OR 1=1` in an `apache_access` or `nginx` request | CRITICAL |

## Architecture

```
 Log sources                    Backend (FastAPI)                       Frontend
┌──────────────┐   POST     ┌────────────────────────────┐   REST    ┌─────────────────┐
│ simulator.py │ ─────────► │ /api/logs                  │           │  Next.js admin  │
│ vm ingestor  │            │   ├─ Normalizer            │ ◄──────── │  (localhost:3000)│
│ UI simulation│            │   └─ Correlation engine    │           │  Dashboard      │
└──────────────┘            │        └─ Alerter          │           │  Alerts / Logs  │
                            │ /api/alerts  /api/stats    │           │  Simulation     │
                            │ /api/auth    /api/simulation│          │  AI Chat ──────────► Ollama
                            │ SQLite (minisiem.db)       │           └─────────────────┘
                            └────────────────────────────┘
```

## Project Structure

```
minisiem_code/
├── app/                    # FastAPI backend
│   ├── main.py             # App entry point, CORS, router registration
│   ├── database.py         # SQLAlchemy engine and session (SQLite)
│   ├── models.py           # Log and Alert models
│   ├── schemas_main.py     # Pydantic schemas for logs and alerts
│   ├── model/user.py       # User model
│   ├── schemas/user.py     # User schemas
│   ├── routers/            # auth, logs, alerts, stats, simulation, chat
│   ├── services/           # normalizer, engine (rules), alerter
│   └── utils/security.py   # Password hashing and JWT helpers
├── static/                 # Original plain HTML/JS dashboard (served at "/")
├── minisiem_admin/         # Next.js frontend
├── vm_scripts/             # Scripts for a Linux VM/host (ingestor, setup, network)
├── simulator.py            # Standalone traffic generator
├── clearn.py               # Clears logs and alerts from the DB (keeps users)
├── requirements.txt
└── setup_docs.txt
```

> The repository also contains a `minisiem/` folder, which is an older copy of the backend. The top-level `app/` is the version to use.

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+ and npm
- (Optional) [Ollama](https://ollama.com) for the AI chat feature

### 1. Backend

```bash
git clone https://github.com/SantoshKatuwal123/minisiem_code.git
cd minisiem_code

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate          # Linux / macOS
venv\Scripts\activate             # Windows

# Install dependencies
pip install -r requirements.txt
pip install "passlib[argon2]" python-jose pytz
```

`requirements.txt` does not currently list `passlib[argon2]`, `python-jose`, or `pytz`, but the code imports them, so install them as shown above.

Start the server:

```bash
fastapi dev
# or
uvicorn app.main:app --reload
```

The backend runs at `http://localhost:8000`. Interactive API docs are at `http://localhost:8000/docs`. The SQLite database (`minisiem.db`) and tables are created automatically on first run.

### 2. Frontend

```bash
cd minisiem_admin
npm install
```

Create `minisiem_admin/.env.local` and point it at the backend API:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Then run:

```bash
npm run dev
```

Open `http://localhost:3000`, register an account, and log in.

### 3. Generate some data

You can use any of these:

- **From the UI**: open the **Simulation** page and start a scenario
- **Standalone script**: `python simulator.py` (see the authentication note below)
- **From a Linux VM**: see [VM Log Ingestion](#vm-log-ingestion)

Scenarios supported by the simulation API: `mixed`, `bruteforce`, `sql`, `portscan`, `malware`.

## Authentication

All `/api/*` endpoints except `/api/auth/register` and `/api/auth/login` require a JWT:

```
Authorization: Bearer <token>
```

1. `POST /api/auth/register` with `fullname`, `email`, `password` (4-16 characters, with a letter, a number, and one of `@$!%*?&`)
2. `POST /api/auth/login` with `email`, `password`. The token is returned at `data.token`.

The root-level `simulator.py` posts to `/api/logs/` without a token, so it will receive `401` responses unless you add an `Authorization` header to its requests. The Simulation page in the UI does not have this problem.

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create a user |
| POST | `/api/auth/login` | Log in and get a JWT |
| POST | `/api/logs/` | Ingest a log (normalized and analyzed in the background) |
| GET | `/api/logs/` | List logs (`skip`, `limit`) |
| GET | `/api/alerts/` | List alerts (`skip`, `limit`) |
| GET | `/api/stats/` | Dashboard KPIs and chart data |
| POST | `/api/simulation/start` | Start simulation (`scenario`, `interval`, `brute_force_attempts`, `auto_stop`) |
| POST | `/api/simulation/stop` | Stop simulation |
| GET | `/api/simulation/status` | Simulation status |
| GET | `/api/chat?p=<prompt>&m=<model>` | Stream a reply from a local Ollama model |

Example log payload:

```json
{
  "source_ip": "10.0.0.50",
  "log_type": "linux_auth",
  "raw_content": "Failed password for invalid user root from 10.0.0.50 port 22 ssh2",
  "level": "WARNING"
}
```

Supported `log_type` values for normalization are `linux_auth` and `apache_access`. Anything else is stored with an `unknown_raw_log` event.

## VM Log Ingestion

The `vm_scripts/` folder lets a Linux VM (for example Metasploitable or Ubuntu) send its auth log to your SIEM host.

```bash
cd vm_scripts
bash setup.sh          # installs pip and requests
bash set_network.sh    # asks for the SIEM host IP and updates the scripts
sudo bash run_siem.sh  # sends the last 15 lines of /var/log/auth.log
```

Before running, edit the `EMAIL` and `PASSWORD` values in `ingestor.py` / `run_siem.sh` to match an account you registered. Make sure the backend is reachable from the VM, for example by starting it with `uvicorn app.main:app --host 0.0.0.0 --port 8000`.

Note that the ingestor sends `log_type: "auth"`, while the normalizer and rules expect `linux_auth`. Change it to `linux_auth` if you want failed-login detection to work on these logs.

## AI Assistant (Optional)

1. Install and start [Ollama](https://ollama.com) (it listens on `localhost:11434`)
2. Pull a model, for example `ollama pull llama3`
3. Open the **Chat** page in the dashboard and pick a model

The assistant is prompted to answer only questions about Mini SIEM and small-environment security monitoring.

## Resetting Data

To wipe all logs and alerts while keeping user accounts:

```bash
python clearn.py
```

## Tech Stack

**Backend:** FastAPI, SQLAlchemy, SQLite, Pydantic, Passlib (Argon2), python-jose (JWT)
**Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, TanStack Query
**Other:** Ollama for the AI chat, Python `requests` for ingestion scripts

## Security Notes

This is a learning and lab project. Before exposing it anywhere beyond a trusted network:

- Move `SECRET_KEY` in `app/utils/security.py` into an environment variable
- Remove hardcoded credentials from the VM scripts
- Restrict the CORS origins in `app/main.py` to your real frontend URL
- Consider whether `minisiem.db` and `__pycache__` should be committed (add them to `.gitignore`)

## Limitations

- Detection rules are simple signatures and thresholds, not a full SIEM rule language
- Only SSH auth and Apache/Nginx access formats are normalized
- SQLite is used for storage, so it is not suited to high log volume
- The stats endpoint loads all logs into memory on each call

## Author

Santosh Katuwal
