from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from configuration.config import SessionLocal
from services import user_service, server_service, template_service, log_service, cmd_service
from configuration.database import Base, engine
from models.server import Server  # Import models to register
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.status import HTTP_422_UNPROCESSABLE_ENTITY
from fastapi import Request

Base.metadata.create_all(bind=engine)


app = FastAPI()

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    body = await request.body()
    print("🧠 Corps brut reçu (JSON):", body.decode())
    print("❌ Erreurs de validation :", exc.errors())

    return JSONResponse(
        status_code=HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )

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
app.include_router(cmd_service.router, prefix="/configurations", tags=["Configurations"])

@app.get("/")
async def root():
    return {"message": "Hello, you are in the dashboard"}