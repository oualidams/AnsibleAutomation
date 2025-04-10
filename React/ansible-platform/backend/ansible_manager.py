import os
import json
import tempfile
import subprocess
import asyncio
import logging
from typing import List, Dict, Any, Optional
import ansible_runner

logger = logging.getLogger(__name__)

class AnsibleManager:
    """
    Manages Ansible operations for the server management platform.
    This class abstracts away the complexity of Ansible from the rest of the application.
    """
    
    def __init__(self, playbook_dir: str = "ansible/playbooks", inventory_dir: str = "ansible/inventory"):
        self.playbook_dir = playbook_dir
        self.inventory_dir = inventory_dir
        
        # Ensure directories exist
        os.makedirs(playbook_dir, exist_ok=True)
        os.makedirs(inventory_dir, exist_ok=True)
        
    async def initialize_server(self, server_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Initialize a new server with the specified configuration.
        This includes:
        1. Setting up SSH key authentication
        2. Applying basic security settings
        3. Installing required packages
        4. Configuring the server for its intended purpose
        """
        try:
            # Create temporary inventory file for this server
            with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.ini') as f:
                inventory_path = f.name
                f.write(f"[target]\n{server_config['ip']} ansible_user={server_config['username']} ansible_ssh_pass={server_config['password']} ansible_ssh_port={server_config.get('ssh_port', 22)}\n")
            
            # Create extra vars for Ansible
            extra_vars = {
                "server_name": server_config["name"],
                "environment": server_config["environment"],
                "os_type": server_config["os_type"],
                "os_version": server_config.get("os_version", ""),
                "project_type": server_config.get("project_type", ""),
                "open_ports": server_config.get("open_ports", "").split(",") if server_config.get("open_ports") else [],
                "install_packages": server_config.get("install_packages", "").split(",") if server_config.get("install_packages") else [],
                "enable_firewall": server_config.get("enable_firewall", True),
                "disable_root_login": server_config.get("disable_root_login", True),
                "enable_fail2ban": server_config.get("enable_fail2ban", True),
                "automatic_updates": server_config.get("automatic_updates", True),
                "install_monitoring": server_config.get("install_monitoring", True),
                "monitoring_email": server_config.get("monitoring_email", ""),
                "custom_commands": server_config.get("custom_commands", "")
            }
            
            # Run the server initialization playbook
            result = await self._run_playbook(
                playbook="initialize_server.yml",
                inventory=inventory_path,
                extra_vars=extra_vars
            )
            
            # Clean up temporary inventory file
            os.unlink(inventory_path)
            
            return {
                "success": result["success"],
                "message": "Server initialization completed" if result["success"] else "Server initialization failed",
                "details": result["details"]
            }
            
        except Exception as e:
            logger.error(f"Error initializing server: {e}")
            return {
                "success": False,
                "message": f"Error initializing server: {str(e)}",
                "details": {}
            }
    
    async def execute_command(self, command: str, servers: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
        """
        Execute a command on multiple servers and return the results.
        """
        results = {}
        
        try:
            # Create temporary inventory file for these servers
            with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.ini') as f:
                inventory_path = f.name
                f.write("[targets]\n")
                for server in servers:
                    f.write(f"{server['name']} ansible_host={server['ip']}\n")
            
            # Create a temporary playbook file
            with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.yml') as f:
                playbook_path = f.name
                playbook_content = f"""---
- name: Execute command on servers
  hosts: targets
  gather_facts: no
  tasks:
    - name: Run command
      shell: {command}
      register: command_result
      ignore_errors: yes

    - name: Save results
      set_fact:
        command_output: "{{ command_result.stdout }}"
        command_error: "{{ command_result.stderr }}"
        command_rc: "{{ command_result.rc }}"
"""
                f.write(playbook_content)
            
            # Run the command playbook
            result = await self._run_playbook(
                playbook=playbook_path,
                inventory=inventory_path,
                use_path=True
            )
            
            # Process results
            if result["success"]:
                for host, host_data in result["details"].get("host_data", {}).items():
                    if "command_output" in host_data.get("facts", {}):
                        output = host_data["facts"]["command_output"]
                        error = host_data["facts"]["command_error"]
                        rc = host_data["facts"]["command_rc"]
                        
                        status = "success" if rc == 0 else "error"
                        
                        results[host] = {
                            "status": status,
                            "output": output + ("\n" + error if error else ""),
                            "rc": rc
                        }
            
            # Clean up temporary files
            os.unlink(inventory_path)
            os.unlink(playbook_path)
            
            return results
            
        except Exception as e:
            logger.error(f"Error executing command: {e}")
            return {server["name"]: {"status": "error", "output": f"Error: {str(e)}", "rc": -1} for server in servers}
    
    async def run_health_check(self, checks: List[str], servers: List[Dict[str, Any]]) -> Dict[str, Dict[str, Dict[str, Any]]]:
        """
        Run health checks on multiple servers and return the results.
        """
        results = {}
        
        try:
            # Create temporary inventory file for these servers
            with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.ini') as f:
                inventory_path = f.name
                f.write("[targets]\n")
                for server in servers:
                    f.write(f"{server['name']} ansible_host={server['ip']}\n")
            
            # Run the health check playbook
            result = await self._run_playbook(
                playbook="health_check.yml",
                inventory=inventory_path,
                extra_vars={"checks": checks}
            )
            
            # Process results
            if result["success"]:
                for host, host_data in result["details"].get("host_data", {}).items():
                    if "health_check_results" in host_data.get("facts", {}):
                        check_results = host_data["facts"]["health_check_results"]
                        results[host] = check_results
            
            # Clean up temporary inventory file
            os.unlink(inventory_path)
            
            return results
            
        except Exception as e:
            logger.error(f"Error running health checks: {e}")
            return {server["name"]: {check: {"status": "error", "message": f"Error: {str(e)}"} for check in checks} for server in servers}
    
    async def _run_playbook(self, playbook: str, inventory: str, extra_vars: Dict[str, Any] = None, use_path: bool = False) -> Dict[str, Any]:
        """
        Run an Ansible playbook and return the results.
        """
        try:
            # Determine playbook path
            playbook_path = playbook if use_path else os.path.join(self.playbook_dir, playbook)
            
            # Create a temporary directory for Ansible Runner
            with tempfile.TemporaryDirectory() as temp_dir:
                # Run the playbook
                runner = ansible_runner.run(
                    private_data_dir=temp_dir,
                    playbook=playbook_path,
                    inventory=inventory,
                    extravars=extra_vars,
                    quiet=True
                )
                
                # Process results
                success = runner.status == "successful"
                host_data = {}
                
                # Extract host data
                for host in runner.host_events:
                    host_data[host] = {
                        "status": "success" if success else "error",
                        "facts": runner.get_fact_cache(host) or {}
                    }
                
                return {
                    "success": success,
                    "details": {
                        "status": runner.status,
                        "rc": runner.rc,
                        "host_data": host_data
                    }
                }
                
        except Exception as e:
            logger.error(f"Error running playbook: {e}")
            return {
                "success": False,
                "details": {
                    "status": "error",
                    "message": str(e),
                    "host_data": {}
                }
            }
