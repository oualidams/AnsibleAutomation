# services/user_service.py
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from configuration.config import get_db
from models.user import User
from schemas.user_schema import UserCreate, UserOut

router = APIRouter()

@router.post("/create", response_model=UserOut)
async def create_user(user: UserCreate, request: Request, db: Session = Depends(get_db)):
    print(await request.json())
    db_user = User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/getUsers", response_model=list[UserOut])
async def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()



@router.get("/getUsers")
async def get_users():
    users = ["User1", "User2", "User3"]
    return {"users": users}

@router.get("/getUser/{user_id}")
async def get_user(user_id: int):
    user = f"User{user_id}"
    return {"user": user}

@router.put("/updateUser/{user_id}")
async def update_user(user_id: int):
    updated_user = f"User{user_id} updated successfully"
    return {"message": updated_user}

@router.delete("/deleteUser/{user_id}")
async def delete_user(user_id: int):
    deleted_user = f"User{user_id} deleted successfully"
    return {"message": deleted_user}

@router.get("/getUserByName/{user_name}")
async def get_user_by_name(user_name: str):
    user = f"User with name {user_name}"
    return {"user": user}

@router.get("/getUserByEmail/{user_email}")
async def get_user_by_email(user_email: str):
    user = f"User with email {user_email}"
    return {"user": user}
