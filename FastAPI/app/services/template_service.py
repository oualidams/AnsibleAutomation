from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from models.logs import Log
from models.template_configuration import TemplateConfiguration
from configuration.config import get_db
from models.template import Template
from typing import List
from models.cmd import Configuration
from schemas.template_schema import TemplateCreate, TemplateOut
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import List
import subprocess
import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload
from typing import List
import subprocess, logging, yaml, os, re

router = APIRouter()



def extract_bash_friendly_output(ansible_output: str) -> str:
    """
    Extracts and formats only the actual shell command outputs from Ansible output,
    hiding Ansible-specific lines. Suitable for users familiar with Linux/bash.
    """
    output_lines = ansible_output.splitlines()
    cleaned_output = []
    current_command = None
    in_command_output = False
    command_output = []

    for line in output_lines:
        line = line.strip()

        # Skip Ansible headers and status lines
        if (
            line.startswith("PLAY ") or
            line.startswith("TASK [") or
            line.startswith("PLAY RECAP") or
            line.startswith("included:") or
            line.startswith("skipping:") or
            line.startswith("fatal:") or
            line.startswith("ok:") or
            line.startswith("changed:") or
            line.startswith("unreachable:") or
            line.startswith("RUNNING HANDLER")
        ):
            continue

        # Detect the start of a shell command (optional: customize this for your playbooks)
        if line.startswith("+ "):  # Bash prints commands with '+ ' when using set -x
            if command_output:
                cleaned_output.append("Command Output:\n" + "\n".join(command_output))
                command_output = []
            current_command = line[2:]
            cleaned_output.append(f"$ {current_command}")
            in_command_output = True
            continue

        # Collect output lines
        if in_command_output:
            if line:
                command_output.append(line)
        else:
            # Sometimes output is not prefixed, just collect non-empty lines
            if line:
                command_output.append(line)

    # Append any remaining output
    if command_output:
        cleaned_output.append("Command Output:\n" + "\n".join(command_output))

    if not cleaned_output:
        cleaned_output.append("ℹ️ No command output captured.")

    return "\n\n".join(cleaned_output)


class ExecuteTemplateRequest(BaseModel):
    selected_servers: List[str]

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def parse_ansible_args(arg_str: str) -> dict:
    """
    Convertit une chaîne de type 'name=nginx state=present' en dict Python
    """
    args = {}
    for part in arg_str.split():
        if '=' in part:
            key, value = part.split('=', 1)
            args[key] = value
    return args


@router.post("/execute/{template_id}")
def execute_template(template_id: int, request: ExecuteTemplateRequest, db: Session = Depends(get_db)):
    selected_servers = request.selected_servers
    template = db.query(Template).options(joinedload(Template.configurations)).filter(Template.id == template_id).first()

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # Generate the playbook tasks
    tasks = []
    for config in template.configurations:
        tasks.append({
            "name": config.configuration.name,
            "shell": config.configuration.configuration
        })

    # Create the playbook structure
    playbook_content = [{
        "name": template.name,
        "hosts": selected_servers,
        #"become": True,
        "tasks": tasks
    }]

    # Define paths for the playbook and inventorygit 
    playbook_path = f"/home/oualidams/Desktop/AnsibleAutomation/Ansible/Playbooks/{template.name}.yml"
    inventory_path = "/home/oualidams/Desktop/AnsibleAutomation/Ansible/inventory.yml"

    # Generate the playbook file
    try:
        with open(playbook_path, "w") as playbook_file:
            yaml.dump(playbook_content, playbook_file, default_flow_style=False)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to write playbook file: {e}")

    # Execute the playbook
    try:
        command = ["ansible-playbook", playbook_path, "-i", inventory_path]
        process = subprocess.run(command, capture_output=True, text=True)

        # Print the raw terminal output for debugging
        print("=== Terminal Output ===")
        print(process.stdout)
        print(process.stderr)

        status = "success" if process.returncode == 0 else "failed"

        raw_output = process.stdout + "\n" + process.stderr
        log_content = extract_bash_friendly_output(raw_output)

    except Exception as e:
        status = "failed"
        log_content = str(e)


    # Log the execution result in the database
    log = Log(
        template_id=template_id,
        server_name=",".join(selected_servers),
        log_content=log_content,
        status=status
    )
    db.add(log)
    db.commit()

    if status == "failed":
        raise HTTPException(status_code=500, detail=f"Playbook execution failed: {log_content}")

    return {
        "message": "✅ Playbook executed successfully",
        "playbook_path": playbook_path,
        "summary": log_content
    }




@router.post("/create", response_model=TemplateOut)
def create_template(template_data: TemplateCreate, db: Session = Depends(get_db)):
    template = Template(
        name=template_data.name,
        description=template_data.description
    )
    db.add(template)
    db.commit()
    db.refresh(template)

    # Créer les associations TemplateConfiguration
    for config in template_data.configurations:
        template_config = TemplateConfiguration(
            template_id=template.id,
            configuration_id=config.id,
            position=config.position
        )
        db.add(template_config)
    db.commit()

    db.refresh(template)
    return template


@router.get("/getTemplates", response_model=List[TemplateOut])
def get_templates(db: Session = Depends(get_db)):
    templates = db.query(Template).options(joinedload(Template.configurations)).all()
    return templates

@router.get("/getTemplate/{template_id}", response_model=TemplateOut)
def get_template(template_id: int, db: Session = Depends(get_db)):
    template = db.query(Template).options(joinedload(Template.configurations)).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template

@router.put("/updateTemplate/{template_id}", response_model=TemplateOut)
def update_template(template_id: int, template_data: TemplateCreate, db: Session = Depends(get_db)):
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # Update basic fields
    template.name = template_data.name
    template.description = template_data.description

    # Remove old TemplateConfiguration links
    db.query(TemplateConfiguration).filter(TemplateConfiguration.template_id == template_id).delete()

    # Add new TemplateConfiguration links
    for config_data in template_data.configurations:
        config = db.query(Configuration).filter(Configuration.id == config_data.id).first()
        if config:
            template_configuration = TemplateConfiguration(
                template_id=template.id,
                configuration_id=config.id,
                position=config_data.position
            )
            db.add(template_configuration)

    db.commit()
    db.refresh(template)
    return template

@router.delete("/delete/{template_id}")
def delete_template(template_id: int, db: Session = Depends(get_db)):
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # Delete related TemplateConfiguration entries
    db.query(TemplateConfiguration).filter(TemplateConfiguration.template_id == template_id).delete()
    db.delete(template)
    db.commit()
    return {"message": "Template deleted successfully"}

# ...existing code...

@router.get("/getTemplateByName/{template_name}")
async def get_template_by_name(template_name: str):
    template = f"Template with name {template_name}"
    print(template)
    return {"template": template}