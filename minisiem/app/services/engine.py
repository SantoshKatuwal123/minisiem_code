import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .. import models
from .alerter import alerter

class CorrelationEngine:
    def analyze(self, current_log: models.Log, db: Session):
        # Decode normalized data
        if not current_log.normalized_data:
            return
            
        try:
            data = json.loads(current_log.normalized_data)
        except json.JSONDecodeError:
            return

        event_type = data.get("event")

        # RULE 1: Detect Root Access (Sudo usage)
        # This is a stateless rule (checks only current log)
        if "sudo" in current_log.raw_content or (event_type == "successful_login" and data.get("user") == "root"):
            alerter.create_alert(
                db=db,
                rule_name="Privileged Access Detected",
                message=f"Root/Sudo access detected from {current_log.source_ip}",
                severity="HIGH",
                source_ip=current_log.source_ip
            )

        # RULE 2: Brute Force Detection (Stateful)
        # Check for 5 failed logins in the last 1 minute from the same IP
        if event_type == "failed_login":
            source_ip = data.get("src_ip", current_log.source_ip)
            
            # Time window: 1 minute ago
            time_window = datetime.utcnow() - timedelta(minutes=1)
            
            # Count recent failed logins from this IP
            # Note: In a real production system, complex queries should be optimized or cached
            failed_count = db.query(models.Log).filter(
                models.Log.source_ip == source_ip,
                models.Log.timestamp >= time_window,
                models.Log.normalized_data.contains("failed_login") # Simple string check for JSON field
            ).count()

            if failed_count >= 5:
                 alerter.create_alert(
                    db=db,
                    rule_name="Brute Force Attack",
                    message=f"Multiple failed login attempts ({failed_count}) detected from {source_ip}",
                    severity="CRITICAL",
                    source_ip=source_ip
                )

        # RULE 3: Web Attack - SQL Injection (basic signature)
        if current_log.log_type == "apache_access" or current_log.log_type == "nginx":
             request_details = data.get("request", "")
             if "UNION SELECT" in request_details.upper() or "OR 1=1" in request_details:
                 alerter.create_alert(
                    db=db,
                    rule_name="SQL Injection Attempt",
                    message=f"Possible SQL Injection pattern found in request: {request_details}",
                    severity="CRITICAL",
                    source_ip=data.get("src_ip", current_log.source_ip)
                )

correlation_engine = CorrelationEngine()
