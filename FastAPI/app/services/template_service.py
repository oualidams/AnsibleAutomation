from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from models.template_configuration import TemplateConfiguration
from configuration.config import get_db
from models.template import Template
from typing import List
from models.cmd import Configuration
from schemas.template_schema import TemplateCreate, TemplateOut

router = APIRouter()

@router.post("/create", response_model=TemplateOut)
def create_template(template_data: TemplateCreate, db: Session = Depends(get_db)):
    # Create the Template
    template = Template(
        name=template_data.name,
        description=template_data.description
    )
    db.add(template)
    db.commit()
    db.refresh(template)

    # If configurations are provided, associate them with the template
    if template_data.configurations:
        for config_data in template_data.configurations:
            # Get the Configuration by ID
            config = db.query(Configuration).filter(Configuration.id == config_data.id).first()
            if config:
                # Create the TemplateConfiguration instance
                template_configuration = TemplateConfiguration(
                    template_id=template.id,
                    configuration_id=config.id,
                    position=config_data.position
                )
                # Add the template configuration to the database
                db.add(template_configuration)
        db.commit()  # Commit the changes to the TemplateConfiguration table

    db.refresh(template)  # Refresh the template to get the updated data
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