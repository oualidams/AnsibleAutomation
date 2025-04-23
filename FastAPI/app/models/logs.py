from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from configuration.database import Base

class Log(Base):
    __tablename__ = "logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    #template_id = Column(Integer, ForeignKey("template.id"))
    #configurtaion_id = Column(Integer, ForeignKey("configuration.id"))
    server_name = Column(String)
    log_content = Column(Text)
    timestamp = Column(String)
    status = Column(String)
