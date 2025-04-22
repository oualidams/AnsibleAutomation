# schemas/user_schema.py
from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str
    email: str
    role: str

class UserOut(UserCreate):
    id: int

    class Config:
        orm_mode = True
