from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.logs import Log
from schemas.log_schema import LogCreate, LogOut
from configuration.config import get_db

router = APIRouter()

@router.post("/create", response_model=LogOut)
def create_log(log_data: LogCreate, db: Session = Depends(get_db)):
    log = Log(
        template_id=log_data.template_id,
        server_name=log_data.server_name,
        log_content=log_data.log_content,
        status=log_data.status
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

@router.get("/getLogs", response_model=list[LogOut])
def get_logs(db: Session = Depends(get_db)):
    return db.query(Log).all()