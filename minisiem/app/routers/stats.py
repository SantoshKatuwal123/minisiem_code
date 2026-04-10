# from fastapi import APIRouter, Depends
# from sqlalchemy.orm import Session
# from sqlalchemy import func
# from .. import models, database

# router = APIRouter(
#     prefix="/api/stats",
#     tags=["stats"]
# )

# @router.get("/summary")
# def get_stats(db: Session = Depends(database.get_db)):
#     total_logs = db.query(func.count(models.Log.id)).scalar()
#     total_alerts = db.query(func.count(models.Alert.id)).scalar()
    
#     # Logs by level
#     logs_by_level = db.query(models.Log.level, func.count(models.Log.id)).group_by(models.Log.level).all()
    
#     # Alerts by severity
#     alerts_by_severity = db.query(models.Alert.severity, func.count(models.Alert.id)).group_by(models.Alert.severity).all()

#     return {
#         "total_logs": total_logs,
#         "total_alerts": total_alerts,
#         "logs_by_level": dict(logs_by_level),
#         "alerts_by_severity": dict(alerts_by_severity)
#     }




from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from collections import defaultdict
import json

from app.utils.security import get_current_user
from .. import database, models

router = APIRouter(
    prefix="/api/stats",
    tags=["stats"],
    dependencies=[Depends(get_current_user)]
)


@router.get("/")
def get_stats(db: Session = Depends(database.get_db)):
    try:
        
  
        #  BASIC KPI STATS
  
        total_alerts = db.query(models.Alert).count()

        critical_alerts = db.query(models.Alert).filter(
            models.Alert.severity == "CRITICAL"
        ).count()

        unique_attackers = db.query(models.Alert.source_ip).distinct().count()

        total_logs = db.query(models.Log).count()

  
        #  FETCH LOGS ONCE (IMPORTANT)
  
        logs = db.query(models.Log).all()

        failed_logins = 0
        successful_logins = 0

        status_counts = {}
        endpoint_counts = {}
        login_activity_map = defaultdict(lambda: {"failed_login": 0, "successful_login": 0})

        for log in logs:
            data = log.normalized_data

            # Parse JSON if needed
            if isinstance(data, str):
                try:
                    data = json.loads(data)
                except:
                    data = {}

      
            #  LOGIN COUNTS
      
            event = data.get("event")

            if event == "failed_login":
                failed_logins += 1
            elif event == "successful_login":
                successful_logins += 1

      
            #  STATUS CODES
      
            status = data.get("status_code")
            if status:
                status_counts[status] = status_counts.get(status, 0) + 1

      
            #  ENDPOINTS
      
            endpoint = data.get("request")
            if endpoint:
                endpoint_counts[endpoint] = endpoint_counts.get(endpoint, 0) + 1

      
            #  LOGIN ACTIVITY OVER TIME
      
            if event in ["failed_login", "successful_login"]:
                if log.timestamp:
                    time_key = log.timestamp.strftime("%Y-%m-%d %H:%M")
                    login_activity_map[time_key][event] += 1

  
        #  FORMAT LOGIN ACTIVITY
  
        login_activity_data = []

        for time, events in login_activity_map.items():
            for event, count in events.items():
                if count > 0:
                    login_activity_data.append({
                        "time": time,
                        "event": event,
                        "count": count
                    })

  
        # STATUS CODE DATA
  
        status_code_data = [
            {"status": k, "count": v} for k, v in status_counts.items()
        ]

  
        # 📊 TOP ENDPOINTS
  
        top_endpoints = sorted(
            endpoint_counts.items(),
            key=lambda x: x[1],
            reverse=True
        )[:5]

        endpoints_data = [
            {"endpoint": k, "count": v} for k, v in top_endpoints
        ]

  
        # ALERTS BY TYPE
  
        alerts_by_type = db.query(
            models.Alert.rule_name,
            func.count(models.Alert.id)
        ).group_by(models.Alert.rule_name).all()

        alerts_by_type_data = [
            {"type": r[0], "count": r[1]} for r in alerts_by_type
        ]

  
        #  ALERTS OVER TIME (SQLite FIX)
  
        alerts_over_time = db.query(
            func.strftime('%Y-%m-%d %H:%M', models.Alert.timestamp),
            func.count(models.Alert.id)
        ).group_by(
            func.strftime('%Y-%m-%d %H:%M', models.Alert.timestamp)
        ).order_by(
            func.strftime('%Y-%m-%d %H:%M', models.Alert.timestamp)
        ).all()

        alerts_time_series = [
            {"time": r[0], "count": r[1]} for r in alerts_over_time
        ]

  
        #  TOP ATTACKERS
  
        top_attackers = db.query(
            models.Alert.source_ip,
            func.count(models.Alert.id)
        ).group_by(models.Alert.source_ip)\
         .order_by(func.count(models.Alert.id).desc())\
         .limit(5).all()

        top_attackers_data = [
            {"ip": r[0], "count": r[1]} for r in top_attackers
        ]


        #  RECENT ALERTS
  
        recent_alerts = db.query(models.Alert)\
            .order_by(models.Alert.timestamp.desc())\
            .limit(5).all()

        recent_alerts_data = [
            {
                "id": a.id,
                "rule": a.rule_name,
                "severity": a.severity,
                "ip": a.source_ip,
                "time": a.timestamp.isoformat() if a.timestamp else None
            } for a in recent_alerts
        ]

  
        #  FINAL RESPONSE
  
        return {
            "success": True,

            "kpis": {
                "total_alerts": total_alerts,
                "critical_alerts": critical_alerts,
                "unique_attackers": unique_attackers,
                "total_logs": total_logs,
                "failed_logins": failed_logins,
                "successful_logins": successful_logins
            },

            "alerts": {
                "by_type": alerts_by_type_data,
                "over_time": alerts_time_series,
                "top_attackers": top_attackers_data,
                "recent": recent_alerts_data
            },

            "logs": {
                "login_activity": login_activity_data,
                "status_codes": status_code_data,
                "top_endpoints": endpoints_data
            }
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }