from fastapi import APIRouter, HTTPException, Request, Depends
from sqlalchemy.orm import Session
from configuration.config import get_db
from models.cmd import Configuration
from schemas.cmd_schema import CmdCreate, CmdOut


router = APIRouter()

@router.post("/create", response_model=CmdOut)
async def create_config(cmd: CmdCreate, request: Request, db: Session = Depends(get_db)):
    print(await request.json())
    db_configuration = Configuration(**cmd.dict())
    db.add(db_configuration)
    db.commit()
    db.refresh(db_configuration)
    return db_configuration

@router.get("/getConfigs", response_model=list[CmdOut])
async def get_configs(db: Session = Depends(get_db)):
    return db.query(Configuration).all()

@router.get("/getConfigById/{id}")
def get_config_by_id(id: int, db: Session = Depends(get_db)):
    config = db.query(Configuration).filter(Configuration.id == id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    return {"id": config.id, "name": config.name}

@router.put("/updateConfig/{config_id}", response_model=CmdOut)
def update_config(config_id: int, updated_cmd: CmdCreate, db: Session = Depends(get_db)):
    db_config = db.query(Configuration).filter(Configuration.id == config_id).first()
    if not db_config:
        raise HTTPException(status_code=404, detail="Configuration not found")

    db_config.name = updated_cmd.name
    db_config.description = updated_cmd.description
    db_config.module = updated_cmd.module
    db_config.configuration = updated_cmd.configuration

    db.commit()
    db.refresh(db_config)
    return db_config

@router.delete("/delete/{config_id}")
def delete_config(config_id: int, db: Session = Depends(get_db)):
    db_config = db.query(Configuration).filter(Configuration.id == config_id).first()
    if not db_config:
        raise HTTPException(status_code=404, detail="Configuration not found")

    db.delete(db_config)
    db.commit()
    return {"message": "Configuration deleted successfully"}

@router.get("/getConfigByName/{config_name}")
async def get_config_by_name(config_name: str):
    config = f"Config with name {config_name}"
    print(config)
    return {"config": config}
