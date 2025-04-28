from sqlalchemy import Column, DateTime, Integer, String, Text, ForeignKey, JSON, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from configuration.database import Base
from models.template import Template

class Log(Base):
    __tablename__ = "logs"
    
    id = Column(Integer, primary_key=True)
    template_id = Column(Integer, ForeignKey('templates.id'))
    server_name = Column(String)
    log_content = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())  # Execution timestamp
    status = Column(String)

    template = relationship("Template", back_populates="logs")
