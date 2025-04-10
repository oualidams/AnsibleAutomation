from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import asyncio
import json
import logging
from datetime import datetime

from ansible_manager import AnsibleManager

app = FastAPI(title="Server Management API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Ansible Manager
ansible_manager = AnsibleManager()

# WebSocket connections
active_connections: List[WebSocket] = []

# Models
class ServerConfig(BaseModel):
    name: str
    ip: str
    username: str
    password: str
    ssh_port: Optional[str] = "22"
    environment: str
    os_type: str
    os_version: Optional[str] = ""
    project_type: Optional[str] = ""
    custom_commands: Optional[str] = ""
    open_ports: Optional[str] = ""
    install_packages: Optional[str] = ""
    enable_firewall: Optional[bool] = True
    disable_root_login: Optional[bool] = True
    enable_fail2ban: Optional[bool] = True
    automatic_updates: Optional[bool] = True
    install_monitoring: Optional[bool] = True
    monitoring_email: Optional[str] = ""

class CommandRequest(BaseModel):
    command: str
    servers: List[str]

class HealthCheckRequest(BaseModel):
    checks: List[str]
    servers: List[str]

# WebSocket connection handler
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            action = message.get("action", "")
            
            if action == "initialize-server":
                server_config = message.get("server", {})
                
                # Send acknowledgment
                await websocket.send_json({
                    "type": "initialization-started",
                    "data": {
                        "server_name": server_config.get("name", ""),
                        "status": "running"
                    }
                })
                
                # Run server initialization in background
                asyncio.create_task(
                    initialize_server_task(websocket, server_config)
                )
                
            elif action == "execute-command":
                command = message.get("command", "")
                server_ids = message.get("servers", [])
                
                # Get server details
                servers = []
                for server_id in server_ids:
                    # In a real app, fetch from database
                    # For now, use mock data
                    servers.append({
                        "id": server_id,
                        "name": f"server-{server_id}",
                        "ip": "127.0.0.1"  # Mock IP
                    })
                
                # Send acknowledgment
                await websocket.send_json({
                    "type": "command-started",
                    "data": {
                        "command": command,
                        "servers": [s["name"] for s in servers],
                        "status": "running"
                    }
                })
                
                # Run command execution in background
                asyncio.create_task(
                    execute_command_task(websocket, command, servers)
                )
                
            elif action == "run-health-check":
                checks = message.get("checks", [])
                server_ids = message.get("servers", [])
                
                # Get server details
                servers = []
                for server_id in server_ids:
                    # In a real app, fetch from database
                    # For now, use mock data
                    servers.append({
                        "id": server_id,
                        "name": f"server-{server_id}",
                        "ip": "127.0.0.1"  # Mock IP
                    })
                
                # Send acknowledgment
                await websocket.send_json({
                    "type": "health-check-started",
                    "data": {
                        "checks": checks,
                        "servers": [s["name"] for s in servers],
                        "status": "running"
                    }
                })
                
                # Run health check in background
                asyncio.create_task(
                    run_health_check_task(websocket, checks, servers)
                )
                
            else:
                await websocket.send_json({
                    "type": "error",
                    "data": {
                        "message": f"Unknown action: {action}"
                    }
                })
                
    except WebSocketDisconnect:
        active_connections.remove(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        try:
            active_connections.remove(websocket)
        except ValueError:
            pass

# Background tasks
async def initialize_server_task(websocket: WebSocket, server_config: Dict[str, Any]):
    try:
        # Update client with progress
        await websocket.send_json({
            "type": "initialization-progress",
            "data": {
                "server_name": server_config.get("name", ""),
                "progress": 10,
                "message": "Establishing connection..."
            }
        })
        
        await asyncio.sleep(1)  # Simulate work
        
        # Update client with progress
        await websocket.send_json({
            "type": "initialization-progress",
            "data": {
                "server_name": server_config.get("name", ""),
                "progress": 30,
                "message": "Setting up SSH keys..."
            }
        })
        
        await asyncio.sleep(2)  # Simulate work
        
        # Update client with progress
        await websocket.send_json({
            "type": "initialization-progress",
            "data": {
                "server_name": server_config.get("name", ""),
                "progress": 50,
                "message": "Configuring security settings..."
            }
        })
        
        await asyncio.sleep(1.5)  # Simulate work
        
        # Update client with progress
        await websocket.send_json({
            "type": "initialization-progress",
            "data": {
                "server_name": server_config.get("name", ""),
                "progress": 70,
                "message": "Installing required packages..."
            }
        })
        
        await asyncio.sleep(2.5)  # Simulate work
        
        # Update client with progress
        await websocket.send_json({
            "type": "initialization-progress",
            "data": {
                "server_name": server_config.get("name", ""),
                "progress": 90,
                "message": "Finalizing configuration..."
            }
        })
        
        await asyncio.sleep(1)  # Simulate work
        
        # In a real app, call ansible_manager.initialize_server(server_config)
        # For now, simulate success
        
        # Send completion
        await websocket.send_json({
            "type": "initialization-complete",
            "data": {
                "server_name": server_config.get("name", ""),
                "success": True,
                "message": "Server initialization completed successfully"
            }
        })
        
    except Exception as e:
        logger.error(f"Error initializing server: {e}")
        await websocket.send_json({
            "type": "initialization-complete",
            "data": {
                "server_name": server_config.get("name", ""),
                "success": False,
                "message": f"Error initializing server: {str(e)}"
            }
        })

async def execute_command_task(websocket: WebSocket, command: str, servers: List[Dict[str, Any]]):
    try:
        # Update client with progress for each server
        for server in servers:
            await websocket.send_json({
                "type": "command-progress",
                "data": {
                    "server_id": server["id"],
                    "server_name": server["name"],
                    "status": "running",
                    "output": f"Connecting to {server['name']}...\n"
                }
            })
        
        await asyncio.sleep(1)  # Simulate work
        
        # Update client with command execution
        for server in servers:
            await websocket.send_json({
                "type": "command-progress",
                "data": {
                    "server_id": server["id"],
                    "server_name": server["name"],
                    "status": "running",
                    "output": f"Connecting to {server['name']}...\nExecuting: {command}\n\n"
                }
            })
        
        # In a real app, call ansible_manager.execute_command(command, servers)
        # For now, simulate results
        await asyncio.sleep(2)  # Simulate work
        
        # Send completion for each server
        for server in servers:
            # Simulate success or failure
            success = server["id"] != "srv-004"  # Fail for server 4
            
            output = f"Connecting to {server['name']}...\nExecuting: {command}\n\n"
            if success:
                output += "Command executed successfully.\nOutput:\n"
                if "df" in command:
                    output += "Filesystem      Size  Used Avail Use% Mounted on\n"
                    output += "udev            7.8G     0  7.8G   0% /dev\n"
                    output += "tmpfs           1.6G  2.1M  1.6G   1% /run\n"
                    output += "/dev/sda1        98G   48G   45G  52% /\n"
                elif "free" in command:
                    output += "              total        used        free      shared  buff/cache   available\n"
                    output += "Mem:          16096        4738        8740         754        2617       10302\n"
                    output += "Swap:          4095           0        4095\n"
                else:
                    output += f"Command completed on {server['name']}\n"
            else:
                output += f"Error: Connection to {server['name']} failed\n"
            
            await websocket.send_json({
                "type": "command-complete",
                "data": {
                    "server_id": server["id"],
                    "server_name": server["name"],
                    "status": "success" if success else "error",
                    "output": output
                }
            })
        
    except Exception as e:
        logger.error(f"Error executing command: {e}")
        for server in servers:
            await websocket.send_json({
                "type": "command-complete",
                "data": {
                    "server_id": server["id"],
                    "server_name": server["name"],
                    "status": "error",
                    "output": f"Error executing command: {str(e)}"
                }
            })

async def run_health_check_task(websocket: WebSocket, checks: List[str], servers: List[Dict[str, Any]]):
    try:
        # Update client with progress
        await websocket.send_json({
            "type": "health-check-progress",
            "data": {
                "progress": 10,
                "message": "Starting health checks..."
            }
        })
        
        # In a real app, call ansible_manager.run_health_check(checks, servers)
        # For now, simulate results
        
        total_checks = len(checks) * len(servers)
        completed = 0
        
        # Process each server
        for server in servers:
            # Process each check
            server_results = {}
            
            for check in checks:
                await asyncio.sleep(0.5)  # Simulate work
                
                # Simulate check result
                status = "success"
                message = f"Check completed successfully on {server['name']}"
                
                # Randomly fail some checks
                if server["id"] == "srv-004" or (server["id"] == "srv-002" and check == "disk"):
                    status = "error"
                    message = f"Check failed on {server['name']}: Insufficient disk space"
                elif server["id"] == "srv-006" and check == "memory":
                    status = "warning"
                    message = f"Check warning on {server['name']}: Memory usage is high (85%)"
                
                server_results[check] = {
                    "status": status,
                    "message": message
                }
                
                # Update progress
                completed += 1
                progress = int((completed / total_checks) * 100)
                
                await websocket.send_json({
                    "type": "health-check-progress",
                    "data": {
                        "progress": progress,
                        "message": f"Running {check} check on {server['name']}..."
                    }
                })
            
            # Send server results
            await websocket.send_json({
                "type": "health-check-server-complete",
                "data": {
                    "server_id": server["id"],
                    "server_name": server["name"],
                    "results": server_results
                }
            })
        
        # Send completion
        await websocket.send_json({
            "type": "health-check-complete",
            "data": {
                "success": True,
                "message": "Health checks completed"
            }
        })
        
    except Exception as e:
        logger.error(f"Error running health checks: {e}")
        await websocket.send_json({
            "type": "health-check-complete",
            "data": {
                "success": False,
                "message": f"Error running health checks: {str(e)}"
            }
        })

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Server Management API"}
