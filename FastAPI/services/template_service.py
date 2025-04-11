from fastapi import APIRouter

router = APIRouter()

@router.post("/create")
async def create_template():
    new_template = "Template created successfully"
    print(new_template)
    return {"message": new_template}