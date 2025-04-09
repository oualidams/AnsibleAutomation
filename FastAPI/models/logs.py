from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Log(Base):
    __tablename__ = "logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    playbook_id = Column(Integer, ForeignKey("playbooks.id"))
    server_name = Column(String)
    log_content = Column(Text)
    timestamp = Column(String)
    status = Column(String)

    playbook = relationship("Playbook", back_populates="logs")