# server.py
from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Server(Base):
    __tablename__ = "servers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    ip = Column(String, nullable=False)
    username = Column(String, nullable=False)
    password = Column(String, nullable=False)
    sshPort = Column(String, nullable=False)
    environment = Column(String, nullable=False)
    osTemplate = Column(String, nullable=False)
    projectTemplate = Column(String, nullable=False)
    securityTemplate = Column(String, nullable=False)
    customCommands = Column(String, nullable=True)
    enableFirewall = Column(Boolean, default=False)
    disableRootLogin = Column(Boolean, default=False)
    enableFail2ban = Column(Boolean, default=False)
    automaticUpdates = Column(Boolean, default=False)