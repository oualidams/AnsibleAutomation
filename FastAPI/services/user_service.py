# filepath: c:\Users\oamsaguine\Desktop\AnsibleAutomation\FastAPI\routers\user_router.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_users():
    return {"message": "User router is working"}