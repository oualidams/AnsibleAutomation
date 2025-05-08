import asyncio
import paramiko
import re
import subprocess
from fastapi import APIRouter, WebSocket, WebSocketDisconnect


router = APIRouter()

async def ssh_terminal(websocket: WebSocket, server_ip: str, username: str, password: str):
    """
    Handles an SSH connection to a server and streams terminal input/output via WebSocket.

    Args:
        websocket (WebSocket): The WebSocket connection with the client.
        server_ip (str): The IP address of the server to connect to.
        username (str): The SSH username.
        password (str): The SSH password.
    """
    ssh_client = None
    try:
        # Accept WebSocket connection
        await websocket.accept()

        # Establish SSH connection
        ssh_client = paramiko.SSHClient()
        ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh_client.connect(server_ip, username=username, password=password)

        # Open an interactive shell
        channel = ssh_client.invoke_shell()

        # Function to read from SSH and send to WebSocket
        async def read_from_ssh():
            while True:
                if channel.recv_ready():
                    raw_output = channel.recv(1024).decode("utf-8")
                    clean_output = strip_ansi_escape_codes(raw_output)  # Clean the output
                    await websocket.send_text(clean_output)
                await asyncio.sleep(0.1)  # Prevent busy-waiting

        # Function to read from WebSocket and send to SSH
        async def read_from_websocket():
            while True:
                data = await websocket.receive_text()

                if data.startswith("__COMPLETE__:"):
                    partial = data.replace("__COMPLETE__:", "").strip()

                    try:
                        suggestions = subprocess.check_output(
                            f"bash -c 'compgen -cdfa {partial}'",
                            shell=True,
                            text=True
                        )
                        suggestions_list = suggestions.strip().split("\n")
                        await websocket.send_text("__SUGGESTIONS__:" + "\n".join(suggestions_list))
                    except subprocess.CalledProcessError as e:
                        await websocket.send_text("__SUGGESTIONS__:")  # empty suggestions
                    continue  # ⚠️ prevent falling through

                # Send real user input to SSH
                channel.send(data)



        # Run both functions concurrently
        await asyncio.gather(read_from_ssh(), read_from_websocket())

    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        # Close SSH connection
        if ssh_client:
            ssh_client.close()

@router.websocket("/ws/terminal")
async def terminal_endpoint(websocket: WebSocket, server_ip: str, username: str, password: str):
    """
    WebSocket endpoint for terminal access.
    """
    await ssh_terminal(websocket, server_ip, username, password)

def strip_ansi_escape_codes(text: str) -> str:
    """
    Removes ANSI escape codes from the given text.
    """
    ansi_escape = re.compile(r'(?:\x1B[@-_]|[\x80-\x9F][@-_])(?:[0-?]*[ -/]*[@-~])|\x1B[PX^_].*?\x1B\\|\x1B\][^\a]*(?:\a|\x1B\\)|\x1B[\[\]()#;?]*(?:(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><~])')
    return ansi_escape.sub('', text)