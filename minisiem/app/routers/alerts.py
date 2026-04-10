# from fastapi import APIRouter, Depends
# from sqlalchemy.orm import Session
# from .. import models, schemas, database

# router = APIRouter(
#     prefix="/api/alerts",
#     tags=["alerts"]
# )

# @router.get("/", response_model=list[schemas.AlertResponse])
# def get_alerts(skip: int = 0, limit: int = 50, db: Session = Depends(database.get_db)):
#     alerts = db.query(models.Alert).order_by(models.Alert.timestamp.desc()).offset(skip).limit(limit).all()
#     return alerts


from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas_main import AlertCreate, AlertResponse, AlertListResponse
from .. import database, models
from app.utils.security import get_current_user

router = APIRouter(
    prefix="/api/alerts",
    tags=["alerts"],
    dependencies=[Depends(get_current_user)] # Require authentication for all log endpoints
)

@router.get("/", response_model=AlertListResponse)
def get_alerts(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(database.get_db)
):
    try:
        total_count = db.query(models.Alert).count()  # total alerts

        alerts = (
            db.query(models.Alert)
            .order_by(models.Alert.timestamp.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

        return {
            "success": True,
            "total": total_count,
            "items": alerts
        }

    except Exception as e:
        # You can log the error if needed
        return {
            "success": False,
            "total": 0,
            "items": [],
            "error": str(e)
        }