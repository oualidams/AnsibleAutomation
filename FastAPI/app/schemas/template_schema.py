# schemas/template_schema.py
from typing import List
from pydantic import BaseModel

class ConfigurationBase(BaseModel):
    id: int
    name: str
    description: str
    module: str
    configuration: str

    class Config:
        orm_mode = True

class ConfigurationOrder(BaseModel):
    position: int
    configuration: ConfigurationBase

class TemplateCreate(BaseModel):
    name: str
    description: str
    configurations: List[ConfigurationOrder]

class TemplateOut(BaseModel):
    id: int
    name: str
    description: str
    configurations: List[ConfigurationOrder]  # You can enrich this with full config data too

    class Config:
        orm_mode = True
