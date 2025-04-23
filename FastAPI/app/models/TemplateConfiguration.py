# models/template_configuration.py
from sqlalchemy import Column, Integer, ForeignKey
from configuration.database import Base
from sqlalchemy.orm import relationship

class TemplateConfiguration(Base):
    __tablename__ = "template_configurations"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("templates.id"))
    configuration_id = Column(Integer, ForeignKey("configurations.id"))
    position = Column(Integer)

    configuration = relationship("Configuration")
