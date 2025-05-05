from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from configuration.database import Base

class Configuration(Base):
    __tablename__ = "configurations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    module = Column(String)
    configuration = Column(String)

    templates = relationship("TemplateConfiguration", back_populates="configuration", cascade="all, delete-orphan")