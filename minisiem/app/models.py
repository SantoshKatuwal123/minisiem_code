from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
from .database import Base


class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    source_ip = Column(String, index=True)
    log_type = Column(String)  # syslog, eventlog, apache, etc.
    raw_content = Column(Text)
    normalized_data = Column(Text) # JSON string
    level = Column(String) # INFO, WARN, ERROR

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    rule_name = Column(String)
    message = Column(String)
    severity = Column(String) # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String, default="NEW") # NEW, INVESTIGATING, RESOLVED
    source_ip = Column(String, nullable=True)
