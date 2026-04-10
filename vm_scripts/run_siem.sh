#!/bin/bash

# Ensure script is run as root to read auth.log
if [ "$EUID" -ne 0 ]; then echo "[!] Please run with sudo."; exit; fi

echo "[*] Initializing SIEM Ingestor..."

cat << 'EOF' > ingestor.py
import requests
import socket
import os

# --- CONFIG ---
BASE_URL = "http://192.168.1.68:8000"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
LOG_URL = f"{BASE_URL}/api/logs/"
EMAIL = "hero@gmail.com"
PASSWORD = "hero123@"
LOG_FILE = "/var/log/auth.log"

def get_token():
    """Extracts token from the 'data' -> 'token' nested path."""
    try:
        payload = {"email": EMAIL, "password": PASSWORD}
        response = requests.post(LOGIN_URL, json=payload, timeout=5)
        if response.status_code == 200:
            return response.json().get("data", {}).get("token")
        else:
            print(f"[!] Login Failed: {response.text}")
            return None
    except Exception as e:
        print(f"[!] Connection Error during Auth: {e}")
        return None

def run_ingestion():
    token = get_token()
    if not token:
        return

    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    # Get Local IP
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        my_ip = s.getsockname()[0]
        s.close()
    except:
        my_ip = "127.0.0.1"

    if not os.path.exists(LOG_FILE):
        print(f"[-] {LOG_FILE} not found.")
        return

    with open(LOG_FILE, 'r') as f:
        lines = f.readlines()[-15:] # Grab last 15 lines
        
    print(f"[*] Authenticated. Sending {len(lines)} logs...")
    success = 0
    for line in lines:
        if not line.strip(): continue
        payload = {
            "source_ip": my_ip,
            "log_type": "auth", # Matches your backend logic
            "raw_content": line.strip(),
            "level": "INFO"
        }
        try:
            r = requests.post(LOG_URL, json=payload, headers=headers, timeout=5)
            if r.status_code == 200:
                success += 1
            else:
                print(f"[!] Server Error ({r.status_code}): {r.text}")
        except Exception as e:
            print(f"[!] Network Error: {e}")
            break

    print(f"\n[+] Done! Successfully ingested {success}/{len(lines)} logs.")

if __name__ == "__main__":
    run_ingestion()
EOF

python3 ingestor.py
