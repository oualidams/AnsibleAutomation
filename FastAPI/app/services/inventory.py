from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pathlib import Path

app = FastAPI()
inventory_file = Path("inventory.ini")

class Server(BaseModel):
    name: str
    ip: str
    group: str = "default"

@app.post("/add-server/")
def add_server(server: Server):
    if not inventory_file.exists():
        inventory_file.write_text("")

    # Read current inventory
    content = inventory_file.read_text()
    lines = content.splitlines()

    group_header = f"[{server.group}]"
    server_entry = f"{server.name} ansible_host={server.ip}"

    new_lines = []
    added = False
    group_found = False

    for line in lines:
        if line.strip() == group_header:
            group_found = True
            new_lines.append(line)
            new_lines.append(server_entry)
            added = True
        else:
            new_lines.append(line)

    if not group_found:
        # Append new group at the end
        new_lines.append(f"\n{group_header}")
        new_lines.append(server_entry)
        added = True

    if added:
        inventory_file.write_text("\n".join(new_lines))
        return {"message": f"Server '{server.name}' added to group '{server.group}'."}
    else:
        raise HTTPException(status_code=500, detail="Failed to add server.")
