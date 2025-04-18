from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from configuration.config import SessionLocal
from services import user_service, server_service, template_service, log_service, config_service

app = FastAPI()

# CORS configuration
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

# Include routers from other services
app.include_router(user_service.router, prefix="/users", tags=["Users"])
app.include_router(server_service.router, prefix="/servers", tags=["Servers"])
app.include_router(template_service.router, prefix="/templates", tags=["Templates"])
app.include_router(log_service.router, prefix="/logs", tags=["Logs"])
app.include_router(config_service.router, prefix="/configurations", tags=["Configurations"])

@app.get("/")
async def root():
    return {"message": "Hello, you are in the dashboard"}