from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
import json

from app.schemas_main import LogCreate, LogResponse, LogListResponse
from .. import database, models
from ..services.normalizer import normalizer
from ..services.engine import correlation_engine
from app.utils.security import get_current_user

router = APIRouter(
    prefix="/api/logs",
    tags=["logs"],
    dependencies=[Depends(get_current_user)]
)

def process_log(log_id: int):
    db = database.SessionLocal()
    try:
        log = db.query(models.Log).filter(models.Log.id == log_id).first()
        if log:
            correlation_engine.analyze(log, db)
    finally:
        db.close()

@router.post("/", response_model=LogResponse)
def ingest_log(log: LogCreate, background_tasks: BackgroundTasks, db: Session = Depends(database.get_db)):
    # 1. Normalize the raw log
    normalized = normalizer.normalize(log.log_type, log.raw_content)
    
    # 2. Create the DB record
    db_log = models.Log(
        source_ip=log.source_ip,
        log_type=log.log_type,
        raw_content=log.raw_content,
        level=log.level,
        normalized_data=normalized
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    
    # --- CRITICAL FIX START ---
    # Convert normalized_data from string to dict so it matches LogResponse schema
    if isinstance(db_log.normalized_data, str):
        try:
            db_log.normalized_data = json.loads(db_log.normalized_data)
        except json.JSONDecodeError:
            db_log.normalized_data = {"error": "failed to parse", "raw": db_log.normalized_data}
    # --- CRITICAL FIX END ---
    
    background_tasks.add_task(process_log, db_log.id)
    
    return db_log

@router.get("/", response_model=LogListResponse)
def get_logs(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    try:
        total_count = db.query(models.Log).count()
        logs = db.query(models.Log).order_by(models.Log.timestamp.desc()).offset(skip).limit(limit).all()

        for log in logs:
            if isinstance(log.normalized_data, str):
                try:
                    log.normalized_data = json.loads(log.normalized_data)
                except json.JSONDecodeError:
                    log.normalized_data = {}

        return {"success": True, "total": total_count, "items": logs}
    except Exception as e:
        return {"success": False, "total": 0, "items": [], "error": str(e)}