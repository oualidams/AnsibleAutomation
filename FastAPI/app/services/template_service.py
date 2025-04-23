from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from configuration.config import get_db
from models.template import Template
from models.cmd import Configuration
from schemas.template_schema import TemplateCreate, TemplateOut

router = APIRouter()

@router.post("/create", response_model=TemplateOut)
def create_template(template_data: TemplateCreate, db: Session = Depends(get_db)):
    template = Template(
        name=template_data.name,
        description=template_data.description
    )
    db.add(template)
    db.commit()
    db.refresh(template)

    if template_data.configuration_ids:
        configs = db.query(Configuration).filter(Configuration.id.in_(template_data.configuration_ids)).all()
        for config in configs:
            config.template_id = template.id
        db.commit()

    db.refresh(template)
    return template

@router.get("/getTemplates")
async def get_templates():
    templates = ["Template1", "Template2", "Template3"]
    print(templates)
    return {"templates": templates}

@router.get("/getTemplate/{template_id}")
async def get_template(template_id: int):
    template = f"Template{template_id}"
    print(template)
    return {"template": template}

@router.put("/updateTemplate/{template_id}")
async def update_template(template_id: int):
    updated_template = f"Template{template_id} updated successfully"
    print(updated_template)
    return {"message": updated_template}

@router.delete("/deleteTemplate/{template_id}")
async def delete_template(template_id: int):
    deleted_template = f"Template{template_id} deleted successfully"
    print(deleted_template)
    return {"message": deleted_template}

@router.get("/getTemplateByName/{template_name}")
async def get_template_by_name(template_name: str):
    template = f"Template with name {template_name}"
    print(template)
    return {"template": template}