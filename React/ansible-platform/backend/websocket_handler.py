import asyncio
import json
import logging
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional, Set
from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from database import get_db, Server, Playbook, Execution, User

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Active WebSocket connections
active_connections: List[WebSocket] = []

# Execution history storage
# In a real app, this would be stored in a database
execution_history = []

# Store active connections
class ConnectionManager:
    def __init__(self):
        # All active connections
        self.active_connections: List[WebSocket] = []
        # Map of topics to connections
        self.topic_subscribers: Dict[str, Set[WebSocket]] = {}
        # Map of connections to their subscribed topics
        self.connection_topics: Dict[WebSocket, Set[str]] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        self.connection_topics[websocket] = set()

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            
            # Remove from all subscribed topics
            for topic in self.connection_topics.get(websocket, set()):
                if topic in self.topic_subscribers:
                    self.topic_subscribers[topic].discard(websocket)
                    
            # Remove connection from mapping
            if websocket in self.connection_topics:
                del self.connection_topics[websocket]

    async def subscribe(self, websocket: WebSocket, topic: str):
        if topic not in self.topic_subscribers:
            self.topic_subscribers[topic] = set()
        self.topic_subscribers[topic].add(websocket)
        self.connection_topics.setdefault(websocket, set()).add(topic)
        
        # Send confirmation
        await self.send_personal_message(
            {"type": "subscription", "topic": topic, "status": "subscribed"},
            websocket
        )

    async def unsubscribe(self, websocket: WebSocket, topic: str):
        if topic in self.topic_subscribers:
            self.topic_subscribers[topic].discard(websocket)
        if websocket in self.connection_topics:
            self.connection_topics[websocket].discard(topic)
            
        # Send confirmation
        await self.send_personal_message(
            {"type": "subscription", "topic": topic, "status": "unsubscribed"},
            websocket
        )

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending message: {e}")
            self.disconnect(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting message: {e}")
                self.disconnect(connection)

    async def broadcast_to_topic(self, topic: str, message: dict):
        if topic not in self.topic_subscribers:
            return
            
        # Add topic to message
        message["topic"] = topic
        
        for connection in self.topic_subscribers[topic].copy():
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to topic {topic}: {e}")
                self.disconnect(connection)

# Create manager instance
manager = ConnectionManager()

async def websocket_endpoint(websocket: WebSocket):
    """Handle WebSocket connections and messages"""
    await websocket.accept()
    active_connections.append(websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            action = message.get("action", "")
            
            if action == "execute-command":
                # Handle command execution
                command = message.get("command", "")
                server_ids = message.get("servers", [])
                
                # Create execution record
                execution_id = str(uuid.uuid4())
                execution_record = {
                    "id": execution_id,
                    "type": "command",
                    "name": f"Command: {command[:30]}{'...' if len(command) > 30 else ''}",
                    "command": command,
                    "servers": [],
                    "user": "admin",  # In a real app, get from auth
                    "timestamp": datetime.now().isoformat(),
                    "status": "running",
                }
                
                # Add to history
                execution_history.append(execution_record)
                
                # Start execution in background
                asyncio.create_task(
                    execute_command(websocket, execution_id, command, server_ids)
                )
                
            elif action == "execute-commands":
                # Handle parallel command execution
                commands = message.get("commands", [])
                server_ids = message.get("servers", [])
                
                if not commands or not server_ids:
                    await websocket.send_json({
                        "type": "error",
                        "data": {
                            "message": "No commands or servers specified"
                        }
                    })
                    continue
                
                # Create execution record for each command
                execution_records = []
                for cmd in commands:
                    execution_id = str(uuid.uuid4())
                    execution_record = {
                        "id": execution_id,
                        "type": "command",
                        "name": cmd.get("name") or f"Command: {cmd['command'][:30]}{'...' if len(cmd['command']) > 30 else ''}",
                        "command": cmd["command"],
                        "servers": [],
                        "user": "admin",  # In a real app, get from auth
                        "timestamp": datetime.now().isoformat(),
                        "status": "running",
                    }
                    execution_records.append(execution_record)
                    execution_history.append(execution_record)
                
                # Start parallel execution in background
                asyncio.create_task(
                    execute_commands_parallel(websocket, execution_records, server_ids)
                )
                
            elif action == "run-health-check":
                # Handle health check
                checks = message.get("checks", [])
                server_ids = message.get("servers", [])
                
                # Create execution record
                execution_id = str(uuid.uuid4())
                execution_record = {
                    "id": execution_id,
                    "type": "health-check",
                    "name": "Health Check",
                    "checks": checks,
                    "servers": [],
                    "user": "admin",  # In a real app, get from auth
                    "timestamp": datetime.now().isoformat(),
                    "status": "running",
                }
                
                # Add to history
                execution_history.append(execution_record)
                
                # Start health check in background
                asyncio.create_task(
                    run_health_check(websocket, execution_id, checks, server_ids)
                )
                
            elif action == "initialize-server":
                # Handle server initialization
                server_config = message.get("server", {})
                
                # Create execution record
                execution_id = str(uuid.uuid4())
                execution_record = {
                    "id": execution_id,
                    "type": "initialization",
                    "name": f"Initialize: {server_config.get('name', 'New Server')}",
                    "template": server_config.get("osTemplate", "Unknown"),
                    "servers": [
                        {
                            "id": str(uuid.uuid4()),  # Generate ID for new server
                            "name": server_config.get("name", "New Server"),
                            "status": "running",
                            "duration": "0s",
                        }
                    ],
                    "user": "admin",  # In a real app, get from auth
                    "timestamp": datetime.now().isoformat(),
                    "status": "running",
                }
                
                # Add to history
                execution_history.append(execution_record)
                
                # Start initialization in background
                asyncio.create_task(
                    initialize_server(websocket, execution_id, server_config)
                )
                
            elif action == "initialize-servers":
                # Handle parallel server initialization
                servers_config = message.get("servers", [])
                
                # Create execution record
                execution_id = str(uuid.uuid4())
                execution_record = {
                    "id": execution_id,
                    "type": "initialization",
                    "name": f"Initialize: {len(servers_config)} Servers",
                    "template": message.get("osTemplate", "Unknown"),
                    "servers": [
                        {
                            "id": str(uuid.uuid4()),  # Generate ID for new server
                            "name": server.get("name", f"New Server {i+1}"),
                            "status": "running",
                            "duration": "0s",
                        }
                        for i, server in enumerate(servers_config)
                    ],
                    "user": "admin",  # In a real app, get from auth
                    "timestamp": datetime.now().isoformat(),
                    "status": "running",
                }
                
                # Add to history
                execution_history.append(execution_record)
                
                # Start initialization in background
                asyncio.create_task(
                    initialize_servers_parallel(websocket, execution_id, servers_config)
                )
                
            elif action == "get-execution-history":
                # Return execution history
                await websocket.send_json({
                    "type": "execution-history",
                    "data": {
                        "executions": execution_history
                    }
                })
                
            elif action == "get-server-executions":
                # Return executions for a specific server
                server_id = message.get("serverId")
                if not server_id:
                    await websocket.send_json({
                        "type": "error",
                        "data": {
                            "message": "No server ID specified"
                        }
                    })
                    continue
                
                # Filter executions for this server
                server_executions = []
                for execution in execution_history:
                    for server in execution.get("servers", []):
                        if server.get("id") == server_id:
                            server_executions.append({
                                "executionId": execution["id"],
                                "type": execution["type"],
                                "name": execution["name"],
                                "command": execution.get("command"),
                                "checks": execution.get("checks"),
                                "status": server["status"],
                                "startTime": execution["timestamp"],
                                "duration": server["duration"],
                            })
                
                await websocket.send_json({
                    "type": "server-executions",
                    "data": {
                        "serverId": server_id,
                        "executions": server_executions
                    }
                })
                
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

async def execute_command(websocket: WebSocket, execution_id: str, command: str, server_ids: List[str]):
    """Execute a command on multiple servers"""
    try:
        # Get execution record
        execution = next((e for e in execution_history if e["id"] == execution_id), None)
        if not execution:
            return
        
        # Get server details (in a real app, fetch from database)
        servers = []
        for server_id in server_ids:
            # Mock server data
            servers.append({
                "id": server_id,
                "name": f"server-{server_id}",
                "ip": "127.0.0.1"
            })
            
            # Add server to execution record
            execution["servers"].append({
                "id": server_id,
                "name": f"server-{server_id}",
                "status": "running",
                "duration": "0s"
            })
        
        # Send initial status
        await websocket.send_json({
            "type": "command-started",
            "data": {
                "executionId": execution_id,
                "command": command,
                "servers": [s["name"] for s in servers]
            }
        })
        
        # Execute command on each server
        for server in servers:
            start_time = datetime.now()
            
            # Update client with progress
            await websocket.send_json({
                "type": "command-progress",
                "data": {
                    "executionId": execution_id,
                    "serverId": server["id"],
                    "serverName": server["name"],
                    "status": "running",
                    "output": f"Connecting to {server['name']}...\nExecuting: {command}\n\n"
                }
            })
            
            # Simulate command execution (in a real app, use SSH)
            await asyncio.sleep(1 + (hash(server["id"]) % 5))  # Random delay
            
            # Determine success or failure (randomly)
            success = hash(server["id"] + command) % 10 != 0  # 10% chance of failure
            
            # Generate mock output
            output = f"Connecting to {server['name']}...\nExecuting: {command}\n\n"
            if success:
                output += f"Command executed successfully on {server['name']}.\n"
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
                output += f"Error: Command failed on {server['name']}\n"
            
            # Calculate duration
            end_time = datetime.now()
            duration_seconds = (end_time - start_time).total_seconds()
            duration = f"{int(duration_seconds)}s"
            
            # Update execution record
            for s in execution["servers"]:
                if s["id"] == server["id"]:
                    s["status"] = "success" if success else "failed"
                    s["duration"] = duration
            
            # Send completion for this server
            await websocket.send_json({
                "type": "command-complete",
                "data": {
                    "executionId": execution_id,
                    "serverId": server["id"],
                    "serverName": server["name"],
                    "status": "success" if success else "failed",
                    "output": output,
                    "duration": duration
                }
            })
        
        # Update overall execution status
        statuses = [s["status"] for s in execution["servers"]]
        if all(status == "success" for status in statuses):
            execution["status"] = "success"
        elif all(status == "failed" for status in statuses):
            execution["status"] = "failed"
        else:
            execution["status"] = "partial"
        
        # Send overall completion
        await websocket.send_json({
            "type": "execution-complete",
            "data": {
                "executionId": execution_id,
                "status": execution["status"]
            }
        })
        
    except Exception as e:
        logger.error(f"Error executing command: {e}")
        
        # Update execution record with error
        if execution:
            execution["status"] = "failed"
            for s in execution["servers"]:
                if s["status"] == "running":
                    s["status"] = "failed"
        
        # Send error to client
        await websocket.send_json({
            "type": "execution-error",
            "data": {
                "executionId": execution_id,
                "message": f"Error executing command: {str(e)}"
            }
        })

async def execute_commands_parallel(websocket: WebSocket, execution_records: List[Dict], server_ids: List[str]):
    """Execute multiple commands on multiple servers in parallel"""
    try:
        # Get server details (in a real app, fetch from database)
        servers = []
        for server_id in server_ids:
            # Mock server data
            servers.append({
                "id": server_id,
                "name": f"server-{server_id}",
                "ip": "127.0.0.1"
            })
            
            # Add server to each execution record
            for execution in execution_records:
                execution["servers"].append({
                    "id": server_id,
                    "name": f"server-{server_id}",
                    "status": "running",
                    "duration": "0s"
                })
        
        # Send initial status for each command
        for execution in execution_records:
            await websocket.send_json({
                "type": "command-started",
                "data": {
                    "executionId": execution["id"],
                    "command": execution["command"],
                    "servers": [s["name"] for s in servers]
                }
            })
        
        # Execute all commands on all servers in parallel
        tasks = []
        for execution in execution_records:
            for server in servers:
                task = asyncio.create_task(
                    execute_single_command(
                        websocket, 
                        execution["id"], 
                        execution["command"], 
                        server
                    )
                )
                tasks.append(task)
        
        # Wait for all tasks to complete
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results and update execution records
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"Error in parallel execution: {result}")
                continue
            
            execution_id, server_id, status, duration = result
            
            # Update execution record
            execution = next((e for e in execution_records if e["id"] == execution_id), None)
            if execution:
                for s in execution["servers"]:
                    if s["id"] == server_id:
                        s["status"] = status
                        s["duration"] = duration
        
        # Update overall status for each execution
        for execution in execution_records:
            statuses = [s["status"] for s in execution["servers"]]
            if all(status == "success" for status in statuses):
                execution["status"] = "success"
            elif all(status == "failed" for status in statuses):
                execution["status"] = "failed"
            else:
                execution["status"] = "partial"
            
            # Send overall completion
            await websocket.send_json({
                "type": "execution-complete",
                "data": {
                    "executionId": execution["id"],
                    "status": execution["status"]
                }
            })
        
    except Exception as e:
        logger.error(f"Error in parallel execution: {e}")
        
        # Update all execution records with error
        for execution in execution_records:
            execution["status"] = "failed"
            for s in execution["servers"]:
                if s["status"] == "running":
                    s["status"] = "failed"
        
        # Send error to client
        await websocket.send_json({
            "type": "execution-error",
            "data": {
                "message": f"Error in parallel execution: {str(e)}"
            }
        })

async def execute_single_command(websocket: WebSocket, execution_id: str, command: str, server: Dict):
    """Execute a single command on a single server"""
    try:
        start_time = datetime.now()
        
        # Update client with progress
        await websocket.send_json({
            "type": "command-progress",
            "data": {
                "executionId": execution_id,
                "serverId": server["id"],
                "serverName": server["name"],
                "status": "running",
                "output": f"Connecting to {server['name']}...\nExecuting: {command}\n\n"
            }
        })
        
        # Simulate command execution (in a real app, use SSH)
        await asyncio.sleep(1 + (hash(server["id"] + command) % 5))  # Random delay
        
        # Determine success or failure (randomly)
        success = hash(server["id"] + command) % 10 != 0  # 10% chance of failure
        
        # Generate mock output
        output = f"Connecting to {server['name']}...\nExecuting: {command}\n\n"
        if success:
            output += f"Command executed successfully on {server['name']}.\n"
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
            output += f"Error: Command failed on {server['name']}\n"
        
        # Calculate duration
        end_time = datetime.now()
        duration_seconds = (end_time - start_time).total_seconds()
        duration = f"{int(duration_seconds)}s"
        
        # Send completion for this server
        await websocket.send_json({
            "type": "command-complete",
            "data": {
                "executionId": execution_id,
                "serverId": server["id"],
                "serverName": server["name"],
                "status": "success" if success else "failed",
                "output": output,
                "duration": duration
            }
        })
        
        # Return result
        return (execution_id, server["id"], "success" if success else "failed", duration)
        
    except Exception as e:
        logger.error(f"Error executing command on server {server['name']}: {e}")
        
        # Send error to client
        await websocket.send_json({
            "type": "command-error",
            "data": {
                "executionId": execution_id,
                "serverId": server["id"],
                "serverName": server["name"],
                "message": f"Error: {str(e)}"
            }
        })
        
        # Return failure
        return (execution_id, server["id"], "failed", "0s")

async def run_health_check(websocket: WebSocket, execution_id: str, checks: List[str], server_ids: List[str]):
    """Run health checks on multiple servers"""
    try:
        # Get execution record
        execution = next((e for e in execution_history if e["id"] == execution_id), None)
        if not execution:
            return
        
        # Get server details (in a real app, fetch from database)
        servers = []
        for server_id in server_ids:
            # Mock server data
            servers.append({
                "id": server_id,
                "name": f"server-{server_id}",
                "ip": "127.0.0.1"
            })
            
            # Add server to execution record
            execution["servers"].append({
                "id": server_id,
                "name": f"server-{server_id}",
                "status": "running",
                "duration": "0s"
            })
        
        # Send initial status
        await websocket.send_json({  "0s"
            })
        
        # Send initial status
        await websocket.send_json({
            "type": "health-check-started",
            "data": {
                "executionId": execution_id,
                "checks": checks,
                "servers": [s["name"] for s in servers]
            }
        })
        
        # Process each server
        for server in servers:
            start_time = datetime.now()
            
            # Update client with progress
            await websocket.send_json({
                "type": "health-check-progress",
                "data": {
                    "executionId": execution_id,
                    "serverId": server["id"],
                    "serverName": server["name"],
                    "progress": 10,
                    "message": f"Starting health checks on {server['name']}..."
                }
            })
            
            # Process each check
            server_results = {}
            overall_status = "success"
            
            for i, check in enumerate(checks):
                # Update progress
                progress = 10 + int((i / len(checks)) * 80)
                await websocket.send_json({
                    "type": "health-check-progress",
                    "data": {
                        "executionId": execution_id,
                        "serverId": server["id"],
                        "serverName": server["name"],
                        "progress": progress,
                        "message": f"Running {check} check on {server['name']}..."
                    }
                })
                
                # Simulate check execution (in a real app, use Ansible)
                await asyncio.sleep(0.5 + (hash(server["id"] + check) % 3))  # Random delay
                
                # Determine check result (randomly)
                rand = hash(server["id"] + check) % 10
                if rand < 7:  # 70% success
                    status = "success"
                    message = f"{check.capitalize()} check passed on {server['name']}"
                elif rand < 9:  # 20% warning
                    status = "warning"
                    overall_status = "warning" if overall_status == "success" else overall_status
                    message = f"{check.capitalize()} check warning on {server['name']}"
                else:  # 10% error
                    status = "error"
                    overall_status = "failed"
                    message = f"{check.capitalize()} check failed on {server['name']}"
                
                # Add check result
                server_results[check] = {
                    "status": status,
                    "message": message
                }
            
            # Calculate duration
            end_time = datetime.now()
            duration_seconds = (end_time - start_time).total_seconds()
            duration = f"{int(duration_seconds // 60)}m {int(duration_seconds % 60)}s"
            
            # Update execution record
            for s in execution["servers"]:
                if s["id"] == server["id"]:
                    s["status"] = overall_status
                    s["duration"] = duration
            
            # Send completion for this server
            await websocket.send_json({
                "type": "health-check-server-complete",
                "data": {
                    "executionId": execution_id,
                    "serverId": server["id"],
                    "serverName": server["name"],
                    "status": overall_status,
                    "results": server_results,
                    "duration": duration
                }
            })
        
        # Update overall execution status
        statuses = [s["status"] for s in execution["servers"]]
        if all(status == "success" for status in statuses):
            execution["status"] = "success"
        elif any(status == "failed" for status in statuses):
            execution["status"] = "failed"
        else:
            execution["status"] = "warning"
        
        # Send overall completion
        await websocket.send_json({
            "type": "health-check-complete",
            "data": {
                "executionId": execution_id,
                "status": execution["status"]
            }
        })
        
    except Exception as e:
        logger.error(f"Error running health checks: {e}")
        
        # Update execution record with error
        if execution:
            execution["status"] = "failed"
            for s in execution["servers"]:
                if s["status"] == "running":
                    s["status"] = "failed"
        
        # Send error to client
        await websocket.send_json({
            "type": "health-check-error",
            "data": {
                "executionId": execution_id,
                "message": f"Error running health checks: {str(e)}"
            }
        })

async def initialize_server(websocket: WebSocket, execution_id: str, server_config: Dict):
    """Initialize a new server"""
    try:
        # Get execution record
        execution = next((e for e in execution_history if e["id"] == execution_id), None)
        if not execution:
            return
        
        # Get server from execution record
        server = execution["servers"][0]
        
        # Send initial status
        await websocket.send_json({
            "type": "initialization-started",
            "data": {
                "executionId": execution_id,
                "serverName": server["name"]
            }
        })
        
        # Simulate initialization steps
        start_time = datetime.now()
        
        # Step 1: Establish SSH connection
        await websocket.send_json({
            "type": "initialization-progress",
            "data": {
                "executionId": execution_id,
                "serverId": server["id"],
                "serverName": server["name"],
                "progress": 10,
                "message": "Establishing SSH connection..."
            }
        })
        await asyncio.sleep(1)
        
        # Step 2: Set up SSH keys
        await websocket.send_json({
            "type": "initialization-progress",
            "data": {
                "executionId": execution_id,
                "serverId": server["id"],
                "serverName": server["name"],
                "progress": 20,
                "message": "Setting up SSH keys..."
            }
        })
        await asyncio.sleep(1.5)
        
        # Step 3: Install base OS packages
        await websocket.send_json({
            "type": "initialization-progress",
            "data": {
                "executionId": execution_id,
                "serverId": server["id"],
                "serverName": server["name"],
                "progress": 40,
                "message": f"Installing {server_config.get('osTemplate', 'base')} packages..."
            }
        })
        await asyncio.sleep(2)
        
        # Step 4: Configure project template
        await websocket.send_json({
            "type": "initialization-progress",
            "data": {
                "executionId": execution_id,
                "serverId": server["id"],
                "serverName": server["name"],
                "progress": 60,
                "message": f"Configuring {server_config.get('projectTemplate', 'project')} environment..."
            }
        })
        await asyncio.sleep(2.5)
        
        # Step 5: Apply security settings
        await websocket.send_json({
            "type": "initialization-progress",
            "data": {
                "executionId": execution_id,
                "serverId": server["id"],
                "serverName": server["name"],
                "progress": 80,
                "message": "Applying security settings..."
            }
        })
        await asyncio.sleep(1.5)
        
        # Step 6: Finalize configuration
        await websocket.send_json({
            "type": "initialization-progress",
            "data": {
                "executionId": execution_id,
                "serverId": server["id"],
                "serverName": server["name"],
                "progress": 95,
                "message": "Finalizing configuration..."
            }
        })
        await asyncio.sleep(1)
        
        # Calculate duration
        end_time = datetime.now()
        duration_seconds = (end_time - start_time).total_seconds()
        duration = f"{int(duration_seconds // 60)}m {int(duration_seconds % 60)}s"
        
        # Update execution record
        server["status"] = "success"
        server["duration"] = duration
        execution["status"] = "success"
        
        # Send completion
        await websocket.send_json({
            "type": "initialization-complete",
            "data": {
                "executionId": execution_id,
                "serverId": server["id"],
                "serverName": server["name"],
                "status": "success",
                "duration": duration
            }
        })
        
    except Exception as e:
        logger.error(f"Error initializing server: {e}")
        
        # Update execution record with error
        if execution:
            execution["status"] = "failed"
            for s in execution["servers"]:
                s["status"] = "failed"
        
        # Send error to client
        await websocket.send_json({
            "type": "initialization-error",
            "data": {
                "executionId": execution_id,
                "message": f"Error initializing server: {str(e)}"
            }
        })

async def initialize_servers_parallel(websocket: WebSocket, execution_id: str, servers_config: List[Dict]):
    """Initialize multiple servers in parallel"""
    try:
        # Get execution record
        execution = next((e for e in execution_history if e["id"] == execution_id), None)
        if not execution:
            return
        
        # Send initial status
        await websocket.send_json({
            "type": "initialization-started",
            "data": {
                "executionId": execution_id,
                "serverCount": len(servers_config)
            }
        })
        
        # Initialize all servers in parallel
        tasks = []
        for i, server_config in enumerate(servers_config):
            server = execution["servers"][i]
            task = asyncio.create_task(
                initialize_single_server(
                    websocket,
                    execution_id,
                    server["id"],
                    server["name"],
                    server_config
                )
            )
            tasks.append(task)
        
        # Wait for all tasks to complete
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results and update execution record
        success_count = 0
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"Error in parallel initialization: {result}")
                execution["servers"][i]["status"] = "failed"
                continue
            
            server_id, status, duration = result
            
            # Update execution record
            for s in execution["servers"]:
                if s["id"] == server_id:
                    s["status"] = status
                    s["duration"] = duration
                    if status == "success":
                        success_count += 1
        
        # Update overall status
        if success_count == len(servers_config):
            execution["status"] = "success"
        elif success_count == 0:
            execution["status"] = "failed"
        else:
            execution["status"] = "partial"
        
        # Send overall completion
        await websocket.send_json({
            "type": "initialization-complete",
            "data": {
                "executionId": execution_id,
                "status": execution["status"],
                "successCount": success_count,
                "totalCount": len(servers_config)
            }
        })
        
    except Exception as e:
        logger.error(f"Error in parallel initialization: {e}")
        
        # Update execution record with error
        if execution:
            execution["status"] = "failed"
            for s in execution["servers"]:
                if s["status"] == "running":
                    s["status"] = "failed"
        
        # Send error to client
        await websocket.send_json({
            "type": "initialization-error",
            "data": {
                "executionId": execution_id,
                "message": f"Error in parallel initialization: {str(e)}"
            }
        })

async def initialize_single_server(websocket: WebSocket, execution_id: str, server_id: str, server_name: str, server_config: Dict):
    """Initialize a single server"""
    try:
        start_time = datetime.now()
        
        # Step 1: Establish SSH connection
        await websocket.send_json({
            "type": "initialization-progress",
            "data": {
                "executionId": execution_id,
                "serverId": server_id,
                "serverName": server_name,
                "progress": 10,
                "message": "Establishing SSH connection..."
            }
        })
        await asyncio.sleep(1)
        
        # Step 2: Set up SSH keys
        await websocket.send_json({
            "type": "initialization-progress",
            "data": {
                "executionId": execution_id,
                "serverId": server_id,
                "serverName": server_name,
                "progress": 20,
                "message": "Setting up SSH keys..."
            }
        })
        await asyncio.sleep(1.5)
        
        # Step 3: Install base OS packages
        await websocket.send_json({
            "type": "initialization-progress",
            "data": {
                "executionId": execution_id,
                "serverId": server_id,
                "serverName": server_name,
                "progress": 40,
                "message": f"Installing {server_config.get('osTemplate', 'base')} packages..."
            }
        })
        await asyncio.sleep(2)
        
        # Step 4: Configure project template
        await websocket.send_json({
            "type": "initialization-progress",
            "data": {
                "executionId": execution_id,
                "serverId": server_id,
                "serverName": server_name,
                "progress": 60,
                "message": f"Configuring {server_config.get('projectTemplate', 'project')} environment..."
            }
        })
        await asyncio.sleep(2.5)
        
        # Step 5: Apply security settings
        await websocket.send_json({
            "type": "initialization-progress",
            "data": {
                "executionId": execution_id,
                "serverId": server_id,
                "serverName": server_name,
                "progress": 80,
                "message": "Applying security settings..."
            }
        })
        await asyncio.sleep(1.5)
        
        # Step 6: Finalize configuration
        await websocket.send_json({
            "type": "initialization-progress",
            "data": {
                "executionId": execution_id,
                "serverId": server_id,
                "serverName": server_name,
                "progress": 95,
                "message": "Finalizing configuration..."
            }
        })
        await asyncio.sleep(1)
        
        # Calculate duration
        end_time = datetime.now()
        duration_seconds = (end_time - start_time).total_seconds()
        duration = f"{int(duration_seconds // 60)}m {int(duration_seconds % 60)}s"
        
        # Send completion for this server
        await websocket.send_json({
            "type": "initialization-server-complete",
            "data": {
                "executionId": execution_id,
                "serverId": server_id,
                "serverName": server_name,
                "status": "success",
                "duration": duration
            }
        })
        
        # Return result
        return (server_id, "success", duration)
        
    except Exception as e:
        logger.error(f"Error initializing server {server_name}: {e}")
        
        # Send error to client
        await websocket.send_json({
            "type": "initialization-server-error",
            "data": {
                "executionId": execution_id,
                "serverId": server_id,
                "serverName": server_name,
                "message": f"Error: {str(e)}"
            }
        })
        
        # Return failure
        return (server_id, "failed", "0s")

# Start background tasks
def start_background_tasks():
    """Start background tasks when the application starts"""
    pass
