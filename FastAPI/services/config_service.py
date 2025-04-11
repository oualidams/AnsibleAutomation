from fastapi import APIRouter
#from models.configuration import Config


router = APIRouter()

@router.post("/create")
async def create_config():
    new_config = "Configuration created successfully"
    print(new_config)
    return {"message": new_config}

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
