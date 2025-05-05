from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from configuration.database import Base

class TemplateConfiguration(Base):
    __tablename__ = "template_configurations"
    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("templates.id"))
    configuration_id = Column(Integer, ForeignKey("configurations.id"))
    position = Column(Integer)

    template = relationship("Template", back_populates="configurations")
    configuration = relationship("Configuration", back_populates="templates")

