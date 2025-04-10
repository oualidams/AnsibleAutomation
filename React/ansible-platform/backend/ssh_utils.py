import os
import subprocess
import paramiko
import logging
from typing import Tuple, Optional

logger = logging.getLogger(__name__)

def generate_ssh_key_pair(server_name: str, key_dir: str = "/etc/ansible/keys") -> Tuple[bool, str, Optional[str]]:
    """
    Generate an SSH key pair for a server
    
    Args:
        server_name: Name of the server (used for key filename)
        key_dir: Directory to store the keys
        
    Returns:
        Tuple of (success, message, key_path)
    """
    try:
        # Create key directory if it doesn't exist
        os.makedirs(key_dir, exist_ok=True)
        
        # Generate key file paths
        private_key_path = os.path.join(key_dir, server_name)
        public_key_path = f"{private_key_path}.pub"
        
        # Check if key already exists
        if os.path.exists(private_key_path):
            return True, f"SSH key already exists at {private_key_path}", private_key_path
        
        # Generate SSH key pair
        subprocess.run([
            "ssh-keygen", 
            "-t", "rsa", 
            "-b", "4096", 
            "-f", private_key_path,
            "-N", ""  # Empty passphrase
        ], check=True)
        
        return True, f"SSH key pair generated successfully at {private_key_path}", private_key_path
        
    except Exception as e:
        logger.error(f"Error generating SSH key pair: {e}")
        return False, f"Error generating SSH key pair: {str(e)}", None

def transfer_ssh_key(
    server_ip: str, 
    username: str, 
    password: str, 
    public_key_path: str
) -> Tuple[bool, str]:
    """
    Transfer the public SSH key to a remote server
    
    Args:
        server_ip: IP address of the server
        username: SSH username
        password: SSH password
        public_key_path: Path to the public key file
        
    Returns:
        Tuple of (success, message)
    """
    try:
        # Read public key
        with open(public_key_path, "r") as f:
            public_key = f.read().strip()
        
        # Connect to server
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(server_ip, username=username, password=password)
        
        # Create .ssh directory if it doesn't exist
        client.exec_command("mkdir -p ~/.ssh")
        
        # Add public key to authorized_keys
        client.exec_command(f'echo "{public_key}" >> ~/.ssh/authorized_keys')
        
        # Set proper permissions
        client.exec_command("chmod 700 ~/.ssh")
        client.exec_command("chmod 600 ~/.ssh/authorized_keys")
        
        client.close()
        
        return True, "SSH key transferred successfully"
        
    except Exception as e:
        logger.error(f"Error transferring SSH key: {e}")
        return False, f"Error transferring SSH key: {str(e)}"

def setup_server_with_ssh(
    server_name: str,
    server_ip: str,
    username: str,
    password: str,
    key_dir: str = "/etc/ansible/keys"
) -> Tuple[bool, str, Optional[str]]:
    """
    Generate SSH key and transfer it to the server
    
    Args:
        server_name: Name of the server
        server_ip: IP address of the server
        username: SSH username
        password: SSH password
        key_dir: Directory to store the keys
        
    Returns:
        Tuple of (success, message, key_path)
    """
    # Generate SSH key pair
    success, message, key_path = generate_ssh_key_pair(server_name, key_dir)
    if not success:
        return False, message, None
    
    # Transfer public key to server
    public_key_path = f"{key_path}.pub"
    success, message = transfer_ssh_key(server_ip, username, password, public_key_path)
    if not success:
        return False, message, None
    
    return True, "Server setup with SSH key authentication successfully", key_path
