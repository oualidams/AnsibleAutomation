#configuration.py
from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Configuration(Base):
    __tablename__ = "configurations"
    id = Column(Integer, primary_key=True, index=True)
    playbook_id = Column(Integer, ForeignKey("playbooks.id"))
    server_name = Column(String)
    configuration = Column(JSON)

    playbook = relationship("Playbook", back_populates="configurations")