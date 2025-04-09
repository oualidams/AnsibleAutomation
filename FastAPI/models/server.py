# server.py
from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Server (Base):
    __tablename__ = "servers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    ip_address = Column(String, unique=True, index=True)
    port = Column(Integer)
    os = Column(String)
    os_version = Column(String)
    username = Column(String)
    password = Column(String)
    playbook = relationship("Playbook", back_populates="servers")