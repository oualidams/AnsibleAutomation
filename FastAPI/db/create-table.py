from models import Base
from configuration.config import engine

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Run the script
import asyncio
asyncio.run(create_tables())