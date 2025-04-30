from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class LogCreate(BaseModel):
    template_id: int
    server_name: str
    log_content: str
    status: str

class LogOut(LogCreate):
    id: int
    timestamp: datetime
    template_id: Optional[int]

    class Config:
        orm_mode = True