from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models import user
from configuration.config import SessionLocal


app = FastAPI()

async def get_db():
    async with SessionLocal() as session:
        yield session

origins = [
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)



@app.post("/users/")
async def create_user(name: str, email: str, db: AsyncSession = Depends(get_db)):
    new_user = user(name=name, email=email)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@app.get("/users/")
async def read_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(user))
    users = result.scalars().all()
    return users

@app.get("/")
async def root():
    return {"message": "Hello Your Are In The Dashboard"}

@app.post("/{id}")
async def post_message(id: int, message: str):
    return {"id": id, "message": message}

@app.put("/update/{id}")
async def update_message(id: int, message: str):
    return {"id": id, "updated_message": message}

@app.delete("/delete/{id}")
async def delete_message(id: int):
    return {"id": id, "status": "deleted"}

@app.get("/mock-data")
async def get_mock_data():
    return [
        {"id": 1, "name": "Item 1"},
        {"id": 2, "name": "Item 2"},
        {"id": 3, "name": "Item 3"},
    ]

@app.get("/search")
async def search_items(query: str):
    return {"query": query, "results": ["Result 1", "Result 2"]}