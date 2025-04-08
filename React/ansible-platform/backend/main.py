from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import asyncio
import subprocess
import json
import os
import ansible_runner
from datetime import datetime, timedelta
import jwt
from sqlalchemy.orm import Session
import tempfile
import yaml

from database import get_db, Server, Playbook, Execution, User
from websocket_handler import websocket_endpoint, start_background_tasks
from ssh_utils import setup_server_with_ssh

app = FastAPI(title="Ansible Automation API")

# Enable CORS
app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],  # Adjust in production
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# Start background tasks on startup
@app.on_event("startup")
def startup_event():
    start_background_tasks()

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_route(websocket: WebSocket):
    await websocket_endpoint(websocket)

# Authentication
SECRET_KEY = "your-secret-key-here"  # Change this in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Models
class PlaybookRequest(BaseModel):
  playbook_id: int
  target_servers: List[str]
  extra_vars: Optional[Dict[str, Any]] = {}

class PlaybookResponse(BaseModel):
  execution_id: str
  status: str
  start_time: str

class PlaybookCreate(BaseModel):
  name: str
  description: Optional[str] = None
  content: str

class ServerCreate(BaseModel):
  name: str
  ip: str
  environment: str
  os: str
  cpu: str
  memory: str
  disk: str

class Token(BaseModel):
  access_token: str
  token_type: str

class SSHSetupRequest(BaseModel):
  server_name: str
  server_ip: str
  username: str
  password: str

# Authentication functions
def create_access_token(data: dict, expires_delta: timedelta = None):
  to_encode = data.copy()
  if expires_delta:
      expire = datetime.utcnow() + expires_delta
  else:
      expire = datetime.utcnow() + timedelta(minutes=15)
  to_encode.update({"exp": expire})
  encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
  return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
  credentials_exception = HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Could not validate credentials",
      headers={"WWW-Authenticate": "Bearer"},
  )
  try:
      payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
      username: str = payload.get("sub")
      if username is None:
          raise credentials_exception
  except jwt.PyJWTError:
      raise credentials_exception
  user = db.query(User).filter(User.username == username).first()
  if user is None:
      raise credentials_exception
  return user

# Routes
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
  user = db.query(User).filter(User.username == form_data.username).first()
  if not user or not user.verify_password(form_data.password):
      raise HTTPException(
          status_code=status.HTTP_401_UNAUTHORIZED,
          detail="Incorrect username or password",
          headers={"WWW-Authenticate": "Bearer"},
      )
  access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
  access_token = create_access_token(
      data={"sub": user.username}, expires_delta=access_token_expires
  )
  return {"access_token": access_token, "token_type": "bearer"}

# Server endpoints
@app.get("/servers", response_model=List[dict])
async def get_servers(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
  servers = db.query(Server).all()
  return servers

@app.post("/servers", status_code=status.HTTP_201_CREATED)
async def create_server(
  server: ServerCreate, 
  current_user: User = Depends(get_current_user), 
  db: Session = Depends(get_db)
):
  db_server = Server(**server.dict())
  db.add(db_server)
  db.commit()
  db.refresh(db_server)
  return {"id": db_server.id, "message": "Server created successfully"}

@app.post("/servers/setup-ssh", status_code=status.HTTP_200_OK)
async def setup_server_ssh(
  request: SSHSetupRequest,
  current_user: User = Depends(get_current_user)
):
  success, message, key_path = setup_server_with_ssh(
      request.server_name,
      request.server_ip,
      request.username,
      request.password
  )
  
  if not success:
      raise HTTPException(status_code=400, detail=message)
  
  return {
      "success": True,
      "message": message,
      "key_path": key_path
  }

# Playbook endpoints
@app.get("/playbooks", response_model=List[dict])
async def get_playbooks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
  playbooks = db.query(Playbook).all()
  return playbooks

@app.post("/playbooks", status_code=status.HTTP_201_CREATED)
async def create_playbook(
  playbook: PlaybookCreate,
  current_user: User = Depends(get_current_user),
  db: Session = Depends(get_db)
):
  # Validate YAML content
  try:
      yaml.safe_load(playbook.content)
  except yaml.YAMLError:
      raise HTTPException(status_code=400, detail="Invalid YAML content")
  
  # Save playbook content to file
  playbook_dir = os.path.join(os.getcwd(), "playbooks")
  os.makedirs(playbook_dir, exist_ok=True)
  
  playbook_filename = f"{playbook.name.lower().replace(' ', '_')}.yml"
  playbook_path = os.path.join(playbook_dir, playbook_filename)
  
  with open(playbook_path, "w") as f:
      f.write(playbook.content)
  
  # Count tasks in playbook
  try:
      playbook_data = yaml.safe_load(playbook.content)
      task_count = sum(len(play.get('tasks', [])) for play in playbook_data)
  except:
      task_count = 0
  
  # Create playbook record
  db_playbook = Playbook(
      name=playbook.name,
      description=playbook.description,
      path=playbook_path,
      tasks=task_count
  )
  db.add(db_playbook)
  db.commit()
  db.refresh(db_playbook)
  
  return {"id": db_playbook.id, "message": "Playbook created successfully"}

@app.post("/playbooks/upload", status_code=status.HTTP_201_CREATED)
async def upload_playbook(
  name: str,
  description: Optional[str] = None,
  file: UploadFile = File(...),
  current_user: User = Depends(get_current_user),
  db: Session = Depends(get_db)
):
  # Read and validate file content
  content = await file.read()
  try:
      yaml.safe_load(content)
  except yaml.YAMLError:
      raise HTTPException(status_code=400, detail="Invalid YAML file")
  
  # Save playbook content to file
  playbook_dir = os.path.join(os.getcwd(), "playbooks")
  os.makedirs(playbook_dir, exist_ok=True)
  
  playbook_filename = f"{name.lower().replace(' ', '_')}.yml"
  playbook_path = os.path.join(playbook_dir, playbook_filename)
  
  with open(playbook_path, "wb") as f:
      f.write(content)
  
  # Count tasks in playbook
  try:
      playbook_data = yaml.safe_load(content)
      task_count = sum(len(play.get('tasks', [])) for play in playbook_data)
  except:
      task_count = 0
  
  # Create playbook record
  db_playbook = Playbook(
      name=name,
      description=description,
      path=playbook_path,
      tasks=task_count
  )
  db.add(db_playbook)
  db.commit()
  db.refresh(db_playbook)
  
  return {"id": db_playbook.id, "message": "Playbook uploaded successfully"}

@app.post("/playbooks/execute", response_model=PlaybookResponse)
async def execute_playbook(
  request: PlaybookRequest, 
  current_user: User = Depends(get_current_user),
  db: Session = Depends(get_db)
):
  # Retrieve playbook from database
  playbook = db.query(Playbook).filter(Playbook.id == request.playbook_id).first()
  if not playbook:
      raise HTTPException(status_code=404, detail="Playbook not found")
  
  # Create execution record
  execution = Execution(
      playbook_id=playbook.id,
      user_id=current_user.id,
      target=",".join(request.target_servers),
      status="running",
      start_time=datetime.now()
  )
  db.add(execution)
  db.commit()
  db.refresh(execution)
  
  # Run playbook asynchronously
  asyncio.create_task(run_ansible_playbook(
      playbook.path,
      request.target_servers,
      request.extra_vars,
      execution.id,
      db
  ))
  
  return {
      "execution_id": str(execution.id),
      "status": "running",
      "start_time": execution.start_time.isoformat()
  }

@app.get("/executions", response_model=List[dict])
async def get_executions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
  executions = db.query(Execution).all()
  return executions

@app.get("/executions/{execution_id}", response_model=dict)
async def get_execution(
  execution_id: int, 
  current_user: User = Depends(get_current_user),
  db: Session = Depends(get_db)
):
  execution = db.query(Execution).filter(Execution.id == execution_id).first()
  if not execution:
      raise HTTPException(status_code=404, detail="Execution not found")
  return execution

# Root endpoint
@app.get("/")
async def root():
  return {"message": "Ansible Automation API"}
