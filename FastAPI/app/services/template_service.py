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

router = APIRouter()

class ExecuteTemplateRequest(BaseModel):
    selected_servers: List[str]

    logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.post("/execute/{template_id}")
def execute_template(template_id: int, request: ExecuteTemplateRequest, db: Session = Depends(get_db)):
    selected_servers = request.selected_servers
    template = db.query(Template).options(joinedload(Template.configurations)).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    playbook_path = f"/home/oualidams/Desktop/AnsibleAutomation/Ansible/{template.name}.yml"
    inventory_path = "/home/oualidams/Desktop/AnsibleAutomation/Ansible/inventory.yml"

    tasks = []
    for config in template.configurations:
        tasks.append({
            "name": config.configuration.name,
            "shell": config.configuration.configuration,
        })

    playbook_content = [{
        "name": template.name,
        "hosts": "all",
        "become": True,
        "tasks": tasks
    }]

    try:
        with open(playbook_path, "w") as playbook_file:
            import yaml
            yaml.dump(playbook_content, playbook_file, default_flow_style=False)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate playbook: {str(e)}")

    try:
        command = ["ansible-playbook", playbook_path, "-i", inventory_path]
        process = subprocess.run(command, capture_output=True, text=True)
        status = "success" if process.returncode == 0 else "failed"
        log_content = process.stdout if process.returncode == 0 else process.stderr
    except Exception as e:
        status = "failed"
        log_content = str(e)

    log = Log(
        template_id=template_id,
        server_name=",".join(selected_servers),
        log_content=log_content,
        status=status
    )
    db.add(log)
    db.commit()

    if status == "failed":
        raise HTTPException(status_code=500, detail=f"Ansible playbook execution failed: {log_content}")

    return {
        "message": "Playbook executed successfully",
        "playbook_path": playbook_path,
        "ansible_output": process.stdout
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