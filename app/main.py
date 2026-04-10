from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .database import engine, Base
from .routers import logs, alerts, stats, auth, chat, simulation

from fastapi.middleware.cors import CORSMiddleware

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Mini SIEM")



origins = [
    "http://localhost:3000", 
   
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # allowed origins
    allow_credentials=True,      # allow cookies/auth headers
    allow_methods=["*"],         # allow GET, POST, etc.
    allow_headers=["*"],         # allow all headers
)

# Include routers
app.include_router(logs.router)
app.include_router(alerts.router)
app.include_router(stats.router)
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(simulation.router)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def read_index():
    return FileResponse('static/index.html')
