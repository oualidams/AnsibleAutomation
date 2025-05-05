from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional
from sqlalchemy import create_engine, Column, Integer, String, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from fastapi.middleware.cors import CORSMiddleware

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./inventory.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# FastAPI app
app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust for your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Models
class Group(Base):
    __tablename__ = "groups"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String)
    variables = Column(JSON)

class Server(Base):
    __tablename__ = "servers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    ip_address = Column(String)
    project = Column(String)
    environment = Column(String)
    groups = Column(JSON)  # List of group names
    variables = Column(JSON)

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic Models
class GroupBase(BaseModel):
    name: str
    description: Optional[str] = None
    variables: Optional[Dict] = {}

class GroupCreate(GroupBase):
    pass

class GroupUpdate(GroupBase):
    pass

class GroupResponse(GroupBase):
    id: int
    servers: int = 0

    class Config:
        from_attributes = True

class ServerBase(BaseModel):
    name: str
    ip_address: str
    project: str
    environment: str
    groups: List[str] = []
    variables: Optional[Dict] = {}

class ServerCreate(ServerBase):
    pass

class ServerUpdate(ServerBase):
    pass

class ServerResponse(ServerBase):
    id: int

    class Config:
        from_attributes = True

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Group CRUD Operations
@app.post("/groups/", response_model=GroupResponse)
async def create_group(group: GroupCreate, db: Session = Depends(get_db)):
    db_group = db.query(Group).filter(Group.name == group.name).first()
    if db_group:
        raise HTTPException(status_code=400, detail="Group already exists")
    
    db_group = Group(**group.dict())
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    
    # Calculate server count
    server_count = db.query(Server).filter(Server.groups.contains([group.name])).count()
    
    return GroupResponse.from_orm(db_group, servers=server_count)

@app.get("/groups/", response_model=List[GroupResponse])
async def get_groups(db: Session = Depends(get_db)):
    groups = db.query(Group).all()
    response = []
    for group in groups:
        server_count = db.query(Server).filter(Server.groups.contains([group.name])).count()
        group_response = GroupResponse.from_orm(group)
        group_response.servers = server_count
        response.append(group_response)
    return response

@app.get("/groups/{group_id}", response_model=GroupResponse)
async def get_group(group_id: int, db: Session = Depends(get_db)):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    server_count = db.query(Server).filter(Server.groups.contains([group.name])).count()
    group_response = GroupResponse.from_orm(group)
    group_response.servers = server_count
    return group_response

@app.put("/groups/{group_id}", response_model=GroupResponse)
async def update_group(group_id: int, group: GroupUpdate, db: Session = Depends(get_db)):
    db_group = db.query(Group).filter(Group.id == group_id).first()
    if not db_group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    for key, value in group.dict(exclude_unset=True).items():
        setattr(db_group, key, value)
    
    db.commit()
    db.refresh(db_group)
    
    server_count = db.query(Server).filter(Server.groups.contains([group.name])).count()
    group_response = GroupResponse.from_orm(db_group)
    group_response.servers = server_count
    return group_response

@app.delete("/groups/{group_id}")
async def delete_group(group_id: int, db: Session = Depends(get_db)):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Remove group from all servers
    servers = db.query(Server).filter(Server.groups.contains([group.name])).all()
    for server in servers:
        server.groups = [g for g in server.groups if g != group.name]
    
    db.delete(group)
    db.commit()
    return {"message": "Group deleted successfully"}

# Server CRUD Operations
@app.post("/servers/", response_model=ServerResponse)
async def create_server(server: ServerCreate, db: Session = Depends(get_db)):
    db_server = db.query(Server).filter(Server.name == server.name).first()
    if db_server:
        raise HTTPException(status_code=400, detail="Server already exists")
    
    # Validate groups exist
    for group_name in server.groups:
        if not db.query(Group).filter(Group.name == group_name).first():
            raise HTTPException(status_code=404, detail=f"Group {group_name} not found")
    
    db_server = Server(**server.dict())
    db.add(db_server)
    db.commit()
    db.refresh(db_server)
    return ServerResponse.from_orm(db_server)

@app.get("/servers/", response_model=List[ServerResponse])
async def get_servers(db: Session = Depends(get_db)):
    servers = db.query(Server).all()
    return [ServerResponse.from_orm(server) for server in servers]

@app.get("/servers/{server_id}", response_model=ServerResponse)
async def get_server(server_id: int, db: Session = Depends(get_db)):
    server = db.query(Server).filter(Server.id == server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    return ServerResponse.from_orm(server)

@app.put("/servers/{server_id}", response_model=ServerResponse)
async def update_server(server_id: int, server: ServerUpdate, db: Session = Depends(get_db)):
    db_server = db.query(Server).filter(Server.id == server_id).first()
    if not db_server:
        "Server not found")
    
    # Validate groups exist
    for group_name in server.groups:
        if not db.query(Group).filter(Group.name == group_name).first():
            raise HTTPException(status_code=404, detail=f"Group {group_name} not found")
    
    for key, value in server.dict(exclude_unset=True).items():
        setattr(db_server, key, value)
    
    db.commit()
    db.refresh(db_server)
    return ServerResponse.from_orm(db_server)

@app.delete("/servers/{server_id}")
async def delete_server(server_id: int, db: Session = Depends(get_db)):
    server = db.query(Server).filter(Server.id == server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    
    db.delete(server)
    db.commit()
    return {"message": "Server deleted successfully"}

# Generate Inventory File
@app.get("/inventory/")
async def generate_inventory(db: Session = Depends(get_db)):
    groups = db.query(Group).all()
    servers = db.query(Server).all()
    
    inventory_content = "# Ansible Inventory File\n\n"
    
    for group in groups:
        inventory_content += f"[{group.name}]\n"
        group_servers = [s for s in servers if group.name in s.groups]
        for server in group_servers:
            inventory_content += f"{server.name} ansible_host={server.variables.get('ansible_host', server.ip_address)}\n"
        inventory_content += "\n"
        
        if group.variables:
            inventory_content += f"[{group.name}:vars]\n"
            for key, value in group.variables.items():
                inventory_content += f"{key}={value}\n"
            inventory_content += "\n"
    
    return {"content": inventory_content}