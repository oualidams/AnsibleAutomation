from fastapi import APIRouter
from models.server import Server


router = APIRouter()

@router.post("/create")
async def create_server():
    new_server = "Server created successfully"
    print(new_server)
    return {"message": new_server}

@router.get("/getServers")
async def get_servers():
    servers = ["Server1", "Server2", "Server3"]
    print(servers)
    return {"servers": servers}

@router.get("/getServer/{server_id}")
async def get_server(server_id: int):
    server = f"Server{server_id}"
    print(server)
    return {"server": server}

@router.put("/updateServer/{server_id}")
async def update_server(server_id: int):
    updated_server = f"Server{server_id} updated successfully"
    print(updated_server)
    return {"message": updated_server}

@router.delete("/deleteServer/{server_id}")
async def delete_server(server_id: int):
    deleted_server = f"Server{server_id} deleted successfully"
    print(deleted_server)
    return {"message": deleted_server}

@router.get("/getServerByName/{server_name}")
async def get_server_by_name(server_name: str):
    server = f"Server with name {server_name}"
    print(server)
    return {"server": server}