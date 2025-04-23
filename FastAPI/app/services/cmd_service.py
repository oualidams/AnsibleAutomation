from fastapi import APIRouter, Request, Depends
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

@router.get("/getConfigs")
async def get_configs():
    configs = ["Config1", "Config2", "Config3"]
    print(configs)
    return {"configs": configs}

@router.get("/getConfig/{config_id}")
async def get_config(config_id: int):
    config = f"Config{config_id}"
    print(config)
    return {"config": config}

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
