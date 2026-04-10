from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class LogBase(BaseModel):
    source_ip: str
    log_type: str
    raw_content: str
    level: str = "INFO"

class LogCreate(LogBase):
    pass

# class LogResponse(LogBase):
#     id: int
#     timestamp: datetime
#     normalized_data: Optional[str] = None

#     class Config:
#         orm_mode = True

class AlertBase(BaseModel):
    rule_name: str
    message: str
    severity: str
    source_ip: Optional[str] = None

class AlertCreate(AlertBase):
    pass

# class AlertResponse(AlertBase):
#     id: int
#     timestamp: datetime
#     status: str

#     class Config:
#         orm_mode = True




#updated alert response
class AlertResponse(BaseModel):
    id: int
    rule_name: str
    message: str
    severity: str
    timestamp: datetime
    source_ip: str

    class Config:
        orm_mode = True

class AlertListResponse(BaseModel):
    success: bool
    total: int
    items: List[AlertResponse]
    error: Optional[str] = None



#updatd log response

class LogResponse(BaseModel):
    id: int
    source_ip: str
    log_type: str
    raw_content: str
    level: str
    normalized_data: Optional[dict] = None
    timestamp: datetime

    class Config:
        orm_mode = True

class LogListResponse(BaseModel):
    success: bool
    total: int
    items: List[LogResponse]
    error: Optional[str] = None