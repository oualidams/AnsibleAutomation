# schemas/server_schema.py
from pydantic import BaseModel

class ServerCreate(BaseModel):
    name: str
    ip_address: str
    username: str
    password: str
    ssh_port: str
    environment: str
    os: str
    project: str
    status: bool = False

class ServerOut(ServerCreate):
    id: int

    class Config:
        orm_mode = True
