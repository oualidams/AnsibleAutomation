# server.py
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel
from typing import List, Optional

Base = declarative_base()

class Server(BaseModel):
    id: Optional[str]
    name: str
    ip: str
    username: str
    password: str
    sshPort: str
    environment: str
    osTemplate: str
    projectTemplate: str
    securityTemplate: str
    customCommands: Optional[str] = None
    enableFirewall: bool
    disableRootLogin: bool
    enableFail2ban: bool
    automaticUpdates: bool