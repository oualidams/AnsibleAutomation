from fastapi import APIRouter

router = APIRouter()

@router.post("/create")
async def create_template():
    new_template = "Template created successfully"
    print(new_template)
    return {"message": new_template}

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