# services/server_service.py
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from configuration.config import get_db
from models.server import Server
from schemas.server_schema import ServerCreate, ServerOut
from pathlib import Path
import yaml

router = APIRouter()

@router.post("/create", response_model=ServerOut)
async def create_server(server: ServerCreate, request: Request, db: Session = Depends(get_db)):
    print(await request.json())
    db_server = Server(**server.dict())
    db.add(db_server)
    db.commit()
    db.refresh(db_server)
    
    # Update inventory.yml
    inventory_path = Path("/home/oualidams/Desktop/AnsibleAutomation/Ansible/inventory.yml")
    if inventory_path.exists():
        with inventory_path.open("r") as file:
            inventory_data = yaml.safe_load(file)

        # Ensure the environment exists in the inventory
        environment = server.environment.lower()
        if environment not in inventory_data["Servers"]:
            inventory_data["Servers"][environment] = []

        # Ensure the environment is a list
        if not isinstance(inventory_data["Servers"][environment], list):
            inventory_data["Servers"][environment] = []

        # Add the server to the environment
        inventory_data["Servers"][environment].append({
            "name": server.name,
            "ip": server.ip_address,
        })

        # Write the updated inventory back to the file
        with inventory_path.open("w") as file:
            yaml.safe_dump(inventory_data, file)

    return db_server

@router.get("/getServers", response_model=list[ServerOut])
async def get_servers(db: Session = Depends(get_db)):
    return db.query(Server).all()

@router.get("/getServer/{server_id}", response_model=ServerOut)
async def get_server(server_id: int, db: Session = Depends(get_db)):
    server = db.query(Server).filter(Server.id == server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    return server

@router.put("/updateServer/{server_id}", response_model=ServerOut)
async def update_server(server_id: int, server_update: ServerCreate, db: Session = Depends(get_db)):
    server = db.query(Server).filter(Server.id == server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    for key, value in server_update.dict().items():
        setattr(server, key, value)
    db.commit()
    db.refresh(server)
    return server

@router.delete("/deleteServer/{server_id}")
async def delete_server(server_id: int, db: Session = Depends(get_db)):
    server = db.query(Server).filter(Server.id == server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    db.delete(server)
    db.commit()
    return {"message": "Server deleted successfully"}

@router.get("/getServerByName/{server_name}", response_model=ServerOut)
async def get_server_by_name(server_name: str, db: Session = Depends(get_db)):
    server = db.query(Server).filter(Server.name == server_name).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    return server
