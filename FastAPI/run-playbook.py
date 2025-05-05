import subprocess
from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
import os
import json

app = FastAPI()

class PlaybookRequest(BaseModel):
    playbook_id: str
    server: str


@app.post("/run-playbook/")
async def run_playbook(request: PlaybookRequest):
    # Define the path to your playbooks and inventory
    playbook_directory = "/path/to/your/playbooks"  # Adjust the playbook path
    inventory_file = "/path/to/your/inventory.ini"  # Adjust the inventory file path
    
    playbook_file = f"{playbook_directory}/{request.playbook_id}.yml"  # The selected playbook file
    
    # Check if the playbook exists
    if not os.path.exists(playbook_file):
        raise HTTPException(status_code=404, detail="Playbook not found")

    # Create an inventory file with the selected server
    inventory_content = f"[target_server]\n{request.server}\n"
    dynamic_inventory_file = "/tmp/dynamic_inventory.ini"
    with open(dynamic_inventory_file, "w") as f:
        f.write(inventory_content)
    
    # Build the ansible-playbook command with the dynamic inventory
    command = [
        "ansible-playbook", 
        "-i", dynamic_inventory_file, 
        playbook_file
    ]
    
    try:
        # Run the ansible-playbook command
        result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        
        # Capture the output of the playbook run
        output = result.stdout
        error_output = result.stderr

        if error_output:
            return {"status": "failed", "error": error_output}
        
        return {"status": "success", "output": output}
    
    except subprocess.CalledProcessError as e:
        return {"status": "failed", "error": e.stderr}


# You can run the FastAPI server using:
# uvicorn <filename>:app --reload
