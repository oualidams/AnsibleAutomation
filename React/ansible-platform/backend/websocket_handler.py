import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, List, Set, Any, Optional
from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from database import get_db, Server, Playbook, Execution, User

logger = logging.getLogger(__name__)

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

# WebSocket endpoint
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    
    try:
        while True:
            # Receive and parse message
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
            except json.JSONDecodeError:
                await manager.send_personal_message(
                    {"type": "error", "message": "Invalid JSON"},
                    websocket
                )
                continue
                
            # Process message based on action
            action = message.get("action")
            
            if action == "subscribe":
                topic = message.get("topic")
                if topic:
                    await manager.subscribe(websocket, topic)
                    
            elif action == "unsubscribe":
                topic = message.get("topic")
                if topic:
                    await manager.unsubscribe(websocket, topic)
                    
            elif action == "get-servers":
                # Get servers from database
                db = next(get_db())
                try:
                    servers = db.query(Server).all()
                    server_list = [
                        {
                            "id": server.id,
                            "name": server.name,
                            "ip": server.ip,
                            "environment": server.environment,
                            "status": server.status
                        }
                        for server in servers
                    ]
                    await manager.send_personal_message(
                        {"type": "server-list", "data": server_list},
                        websocket
                    )
                finally:
                    db.close()
                    
            elif action == "execute-playbook":
                playbook_id = message.get("playbookId")
                target_servers = message.get("targetServers", [])
                extra_vars = message.get("extraVars", {})
                
                if not playbook_id or not target_servers:
                    await manager.send_personal_message(
                        {"type": "error", "message": "Missing required parameters"},
                        websocket
                    )
                    continue
                    
                # Start execution in database
                db = next(get_db())
                try:
                    playbook = db.query(Playbook).filter(Playbook.id == playbook_id).first()
                    if not playbook:
                        await manager.send_personal_message(
                            {"type": "error", "message": "Playbook not found"},
                            websocket
                        )
                        continue
                        
                    # Create execution record
                    execution = Execution(
                        playbook_id=playbook.id,
                        user_id=1,  # In a real app, get from authenticated user
                        target=",".join(str(s) for s in target_servers),
                        status="running",
                        start_time=datetime.now()
                    )
                    db.add(execution)
                    db.commit()
                    db.refresh(execution)
                    
                    # Send confirmation
                    await manager.send_personal_message(
                        {
                            "type": "execution-started", 
                            "data": {
                                "executionId": str(execution.id),
                                "status": "running",
                                "startTime": execution.start_time.isoformat()
                            }
                        },
                        websocket
                    )
                    
                    # Start execution in background
                    asyncio.create_task(
                        run_ansible_playbook(
                            playbook.path,
                            target_servers,
                            extra_vars,
                            execution.id,
                            db
                        )
                    )
                except Exception as e:
                    logger.error(f"Error starting execution: {e}")
                    await manager.send_personal_message(
                        {"type": "error", "message": str(e)},
                        websocket
                    )
                finally:
                    db.close()
                    
            elif action == "get-execution":
                execution_id = message.get("executionId")
                if not execution_id:
                    await manager.send_personal_message(
                        {"type": "error", "message": "Missing execution ID"},
                        websocket
                    )
                    continue
                    
                # Get execution from database
                db = next(get_db())
                try:
                    execution = db.query(Execution).filter(Execution.id == execution_id).first()
                    if not execution:
                        await manager.send_personal_message(
                            {"type": "error", "message": "Execution not found"},
                            websocket
                        )
                        continue
                        
                    playbook = db.query(Playbook).filter(Playbook.id == execution.playbook_id).first()
                    
                    # Get target servers
                    target_servers = execution.target.split(",")
                    servers = []
                    for server_id in target_servers:
                        server = db.query(Server).filter(Server.id == server_id).first()
                        if server:
                            servers.append({
                                "name": server.name,
                                "status": "running" if execution.status == "running" else "success",
                                "tasks": {
                                    "total": playbook.tasks if playbook else 0,
                                    "completed": 0,
                                    "failed": 0
                                }
                            })
                    
                    # Calculate duration
                    duration = ""
                    if execution.start_time:
                        if execution.end_time:
                            delta = execution.end_time - execution.start_time
                        else:
                            delta = datetime.now() - execution.start_time
                        
                        seconds = delta.total_seconds()
                        if seconds < 60:
                            duration = f"{int(seconds)}s"
                        else:
                            minutes = int(seconds // 60)
                            seconds = int(seconds % 60)
                            duration = f"{minutes}m {seconds}s"
                    
                    # Send execution info
                    await manager.send_personal_message(
                        {
                            "topic": f"execution-{execution_id}",
                            "type": "execution_info",
                            "data": {
                                "id": str(execution.id),
                                "playbook": playbook.name if playbook else "Unknown",
                                "status": execution.status,
                                "progress": 0,
                                "startTime": execution.start_time.isoformat(),
                                "duration": duration,
                                "servers": servers
                            }
                        },
                        websocket
                    )
                finally:
                    db.close()
            
            else:
                await manager.send_personal_message(
                    {"type": "error", "message": f"Unknown action: {action}"},
                    websocket
                )
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

# Mock function to simulate Ansible playbook execution
async def run_ansible_playbook(
    playbook_path: str,
    target_servers: List[str],
    extra_vars: Dict[str, Any],
    execution_id: int,
    db: Session
):
    """Simulate running an Ansible playbook with real-time updates"""
    topic = f"execution-{execution_id}"
    
    try:
        # Get playbook and servers
        playbook = db.query(Playbook).filter(Playbook.id == playbook_path).first()
        servers = []
        for server_id in target_servers:
            server = db.query(Server).filter(Server.id == server_id).first()
            if server:
                servers.append(server)
        
        # Send initial log
        await manager.broadcast_to_topic(
            topic,
            {
                "type": "log",
                "data": {
                    "timestamp": datetime.now().isoformat(),
                    "level": "INFO",
                    "message": "Playbook execution started"
                }
            }
        )
        
        await asyncio.sleep(1)
        
        # Send connecting message
        await manager.broadcast_to_topic(
            topic,
            {
                "type": "log",
                "data": {
                    "timestamp": datetime.now().isoformat(),
                    "level": "INFO",
                    "message": "Connecting to servers..."
                }
            }
        )
        
        # Connect to each server
        for i, server in enumerate(servers):
            await asyncio.sleep(0.5)
            await manager.broadcast_to_topic(
                topic,
                {
                    "type": "log",
                    "data": {
                        "timestamp": datetime.now().isoformat(),
                        "level": "INFO",
                        "message": f"Connected to {server.name}"
                    }
                }
            )
            
            # Update progress
            progress = int((i + 1) / len(servers) * 20)  # 20% for connection phase
            await manager.broadcast_to_topic(
                topic,
                {
                    "type": "server_update",
                    "data": {
                        "name": server.name,
                        "status": "running",
                        "progress": progress
                    }
                }
            )
        
        # Simulate tasks for each server
        task_count = playbook.tasks if playbook else 5
        for task_num in range(1, task_count + 1):
            # Send task start message
            await asyncio.sleep(1)
            await manager.broadcast_to_topic(
                topic,
                {
                    "type": "log",
                    "data": {
                        "timestamp": datetime.now().isoformat(),
                        "level": "INFO",
                        "message": f"TASK [{task_num}]: Running task {task_num}"
                    }
                }
            )
            
            # Run task on each server
            for server in servers:
                await asyncio.sleep(0.5 + (task_num % 3) * 0.5)  # Vary task duration
                
                # Randomly fail some tasks (for demo purposes)
                success = True
                if task_num == 3 and server.name == servers[-1].name:
                    success = False
                
                # Send task result
                level = "INFO" if success else "ERROR"
                message = f"{server.name}: ok={task_num} changed=1" if success else f"{server.name}: Failed to execute task {task_num}"
                
                await manager.broadcast_to_topic(
                    topic,
                    {
                        "type": "log",
                        "data": {
                            "timestamp": datetime.now().isoformat(),
                            "level": level,
                            "message": message
                        }
                    }
                )
                
                # Update server status
                server_status = {
                    "name": server.name,
                    "tasks": {
                        "total": task_count,
                        "completed": task_num if success else task_num - 1,
                        "failed": 0 if success else 1
                    }
                }
                
                if not success:
                    server_status["status"] = "failed"
                elif task_num == task_count:
                    server_status["status"] = "success"
                else:
                    server_status["status"] = "running"
                
                # Calculate overall progress (20% for connection + 80% for tasks)
                progress = 20 + int((task_num / task_count) * 80)
                server_status["progress"] = progress
                
                await manager.broadcast_to_topic(
                    topic,
                    {
                        "type": "server_update",
                        "data": server_status
                    }
                )
        
        # Determine final status
        any_failed = any(s.name == servers[-1].name for s in servers)  # Last server fails in our simulation
        final_status = "failed" if any_failed else "success"
        
        # Send completion message
        await asyncio.sleep(1)
        await manager.broadcast_to_topic(
            topic,
            {
                "type": "log",
                "data": {
                    "timestamp": datetime.now().isoformat(),
                    "level": "INFO",
                    "message": "Playbook execution completed"
                }
            }
        )
        
        # Send summary
        await manager.broadcast_to_topic(
            topic,
            {
                "type": "log",
                "data": {
                    "timestamp": datetime.now().isoformat(),
                    "level": "INFO",
                    "message": f"Summary: {len(servers)} servers, {len(servers) - (1 if any_failed else 0)} success, {1 if any_failed else 0} failed"
                }
            }
        )
        
        # Update execution record
        execution = db.query(Execution).filter(Execution.id == execution_id).first()
        if execution:
            execution.status = final_status
            execution.end_time = datetime.now()
            execution.duration = (execution.end_time - execution.start_time).total_seconds()
            db.commit()
        
        # Send completion event
        await manager.broadcast_to_topic(
            topic,
            {
                "type": "execution_complete",
                "data": {
                    "status": final_status,
                    "duration": f"{int(execution.duration // 60)}m {int(execution.duration % 60)}s" if execution else "0s"
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Error in playbook execution: {e}")
        
        # Send error message
        await manager.broadcast_to_topic(
            topic,
            {
                "type": "log",
                "data": {
                    "timestamp": datetime.now().isoformat(),
                    "level": "ERROR",
                    "message": f"Execution error: {str(e)}"
                }
            }
        )
        
        # Update execution record
        execution = db.query(Execution).filter(Execution.id == execution_id).first()
        if execution:
            execution.status = "failed"
            execution.end_time = datetime.now()
            execution.duration = (execution.end_time - execution.start_time).total_seconds()
            db.commit()
        
        # Send completion event
        await manager.broadcast_to_topic(
            topic,
            {
                "type": "execution_complete",
                "data": {
                    "status": "failed",
                    "duration": f"{int(execution.duration // 60)}m {int(execution.duration % 60)}s" if execution else "0s"
                }
            }
        )

# Background task to send periodic updates for dashboard metrics
async def send_dashboard_updates():
    """Send periodic updates for dashboard metrics"""
    while True:
        try:
            # Generate server metrics data
            current_time = datetime.now().strftime("%H:%M")
            
            # CPU data
            cpu_value = 40 + (datetime.now().minute % 20)  # Vary between 40-60%
            cpu_data = {
                "time": current_time,
                "value": cpu_value
            }
            
            # Memory data
            memory_value = 60 + (datetime.now().minute % 15)  # Vary between 60-75%
            memory_data = {
                "time": current_time,
                "value": memory_value
            }
            
            # Disk data
            disk_value = 30 + (datetime.now().minute % 5)  # Vary between 30-35%
            disk_data = {
                "time": current_time,
                "value": disk_value
            }
            
            # Send metrics updates
            await manager.broadcast_to_topic(
                "server-metrics",
                {
                    "type": "metrics-update",
                    "data": {
                        "cpu": [cpu_data],
                        "memory": [memory_data],
                        "disk": [disk_data]
                    }
                }
            )
            
            # Send server status updates
            total_servers = 12
            healthy_servers = 10
            issues = 2
            
            await manager.broadcast_to_topic(
                "server-status",
                {
                    "type": "status-update",
                    "data": {
                        "totalServers": total_servers,
                        "newServers": 4,
                        "totalPlaybooks": 24,
                        "executedToday": 6,
                        "issues": issues,
                        "healthy": healthy_servers,
                        "healthyPercentage": int((healthy_servers / total_servers) * 100)
                    }
                }
            )
            
            # Generate random activity
            activities = [
                {
                    "id": datetime.now().timestamp(),
                    "user": "System",
                    "action": "Executed playbook",
                    "target": "health-check.yml",
                    "time": "just now",
                    "status": "success"
                }
            ]
            
            await manager.broadcast_to_topic(
                "recent-activity",
                {
                    "type": "activity-update",
                    "data": activities[0]
                }
            )
            
        except Exception as e:
            logger.error(f"Error sending dashboard updates: {e}")
        
        # Wait before sending next update
        await asyncio.sleep(10)  # Update every 10 seconds

# Start background tasks
def start_background_tasks():
    asyncio.create_task(send_dashboard_updates())

# Update main.py to include WebSocket endpoint
# Add to main.py:
# from websocket_handler import websocket_endpoint, start_background_tasks
# 
# @app.on_event("startup")
# def startup_event():
#     start_background_tasks()
# 
# @app.websocket("/ws")
# async def websocket_route(websocket: WebSocket):
#     await websocket_endpoint(websocket)

