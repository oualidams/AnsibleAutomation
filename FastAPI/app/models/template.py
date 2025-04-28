from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from configuration.database import Base

class Template(Base):
    __tablename__ = 'templates'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)

    configurations = relationship("TemplateConfiguration", back_populates="template", cascade="all, delete-orphan")
    logs = relationship("Log", back_populates="template")


