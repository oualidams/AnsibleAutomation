 #schemas/config_schema.py
from pydantic import BaseModel

class CmdCreate(BaseModel):
    name: str
    description: str
    module: str
    configuration: str

class CmdOut(CmdCreate):
    id: int

    class Config:
        orm_mode = True