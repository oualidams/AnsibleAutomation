from fastapi import APIRouter
from models.server import Server


router = APIRouter()

@router.post("/create")
async def create_server():
    new_server = "Server created successfully"
    print(new_server)
    return {"message": new_server}