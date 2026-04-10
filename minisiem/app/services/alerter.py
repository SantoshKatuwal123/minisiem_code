from sqlalchemy.orm import Session

from .. import schemas
from .. import models

class Alerter:
    def create_alert(self, db: Session, rule_name: str, message: str, severity: str, source_ip: str):
        print(f"!!! ALERT TRIGGERED: {rule_name} - {message} !!!") # Console validation
        
        alert = models.Alert(
            rule_name=rule_name,
            message=message,
            severity=severity,
            source_ip=source_ip
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)
        return alert

alerter = Alerter()
