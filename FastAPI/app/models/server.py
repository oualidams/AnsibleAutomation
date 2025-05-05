# models/server.py
from sqlalchemy import Column, Integer, String, Boolean
from configuration.database import Base  # Use your centralized Base from `database.py`

class Server(Base):
    __tablename__ = "servers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    ip_address = Column(String, nullable=False)
    username = Column(String, nullable=False)
    password = Column(String, nullable=False)
    ssh_port = Column(String, nullable=False)
    environment = Column(String, nullable=False)
    os = Column(String, nullable=False)
    project = Column(String, nullable=False)
    status = Column(Boolean, default=False)
