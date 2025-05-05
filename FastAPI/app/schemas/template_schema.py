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

class ConfigurationOrderOut(BaseModel):
    position: int
    configuration: ConfigurationBase

    class Config:
        orm_mode = True

class ConfigurationOrderCreate(BaseModel):
    id: int
    position: int

class TemplateCreate(BaseModel):
    name: str
    description: str
    configurations: List[ConfigurationOrderCreate]  # <- En entrée, juste id + position

class TemplateOut(BaseModel):
    id: int
    name: str
    description: str
    configurations: List[ConfigurationOrderOut]  # <- En sortie, info complète

    class Config:
        orm_mode = True

