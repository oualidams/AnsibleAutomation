# schemas/template_schema.py
from typing import List
from pydantic import BaseModel

class ConfigurationOrder(BaseModel):
    id: int
    position: int

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
