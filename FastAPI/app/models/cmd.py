#configuration.py
from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from configuration.database import Base  # Use your centralized Base from `database.py`

class Configuration(Base):

    __tablename__ = "configurations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    module = Column(String)
    configuration = Column(String)

    template_id = Column(Integer, ForeignKey("templates.id"))
    template = relationship("Template", back_populates="configurations")