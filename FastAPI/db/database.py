# db.py 

from databases import Database
from config import DATABASE_URL  

database = Database(DATABASE_URL)

async def get_db():
    async with database.transaction():
        yield database
