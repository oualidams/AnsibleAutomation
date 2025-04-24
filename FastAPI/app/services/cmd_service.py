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

@router.put("/updateConfig/{config_id}")
async def update_config(config_id: int):
    updated_config = f"Config{config_id} updated successfully"
    print(updated_config)
    return {"message": updated_config}

@router.delete("/deleteConfig/{config_id}")
async def delete_config(config_id: int):
    deleted_config = f"Config{config_id} deleted successfully"
    print(deleted_config)
    return {"message": deleted_config}

@router.get("/getConfigByName/{config_name}")
async def get_config_by_name(config_name: str):
    config = f"Config with name {config_name}"
    print(config)
    return {"config": config}
