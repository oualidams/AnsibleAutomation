from fastapi import APIRouter
from models.logs import Log


router = APIRouter()

@router.post("/create")
async def create_log():
    new_log = "Log created successfully"
    print(new_log)
    return {"message": new_log}

@router.get("/getLogs")
async def get_logs():
    logs = ["Log1", "Log2", "Log3"]
    print(logs)
    return {"logs": logs}

@router.get("/getLog/{log_id}")
async def get_log(log_id: int):
    log = f"Log{log_id}"
    print(log)
    return {"log": log}

@router.put("/updateLog/{log_id}")
async def update_log(log_id: int):
    updated_log = f"Log{log_id} updated successfully"
    print(updated_log)
    return {"message": updated_log}

@router.delete("/deleteLog/{log_id}")
async def delete_log(log_id: int):
    deleted_log = f"Log{log_id} deleted successfully"
    print(deleted_log)
    return {"message": deleted_log}

@router.get("/getLogByName/{log_name}")
async def get_log_by_name(log_name: str):
    log = f"Log with name {log_name}"
    print(log)
    return {"log": log}

