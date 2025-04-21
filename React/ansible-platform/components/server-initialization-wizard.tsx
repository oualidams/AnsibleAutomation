"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  Server,
  Shield,
  Database,
  Code,
  Settings,
} from "lucide-react";
import { useWebSocket } from "@/contexts/websocket-context";

// Project types for initialization
const PROJECT_TYPES = {
  web: {
    name: "Web Application",
    icon: <Code className="h-5 w-5" />,
    description:
      "Configure server for hosting web applications with Nginx/Apache, PHP, Node.js, etc.",
    packages: ["nginx", "nodejs", "certbot", "fail2ban"],
    ports: [80, 443, 3000, 8080],
  },
  database: {
    name: "Database Server",
    icon: <Database className="h-5 w-5" />,
    description:
      "Configure server for database hosting with PostgreSQL, MySQL, MongoDB, etc.",
    packages: ["postgresql", "mysql-server", "redis-server"],
    ports: [5432, 3306, 6379],
  },
  devops: {
    name: "DevOps Tools",
    icon: <Settings className="h-5 w-5" />,
    description:
      "Configure server with CI/CD tools, monitoring, and container orchestration.",
    packages: ["docker", "docker-compose", "prometheus", "grafana"],
    ports: [9090, 9100, 3000, 9091],
  },
  custom: {
    name: "Custom Configuration",
    icon: <Server className="h-5 w-5" />,
    description: "Start with a basic secure server and customize as needed.",
    packages: ["fail2ban", "ufw"],
    ports: [],
  },
};

interface ServerInitializationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServerInitializationWizard({
  open,
  onOpenChange,
}: ServerInitializationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  // Server basic info
  const [serverName, setServerName] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [sshPort, setSshPort] = useState("");
  const [project, setProject] = useState("");
  const [environment, setEnvironment] = useState("production");
  const [osType, setOs] = useState("");
  //const [osVersion, setOsVersion] = useState("")

  // Project configuration
  //const [projectType, setProjectType] = useState<keyof typeof PROJECT_TYPES | "">("")
  //const [customCommands, setCustomCommands] = useState("")
  //const [openPorts, setOpenPorts] = useState("")
  //const [installPackages, setInstallPackages] = useState("")

  // Security options
  //const [enableFirewall, setEnableFirewall] = useState(true)
  //const [disableRootLogin, setDisableRootLogin] = useState(true)
  //const [enableFail2Ban, setEnableFail2Ban] = useState(true)
  //const [automaticUpdates, setAutomaticUpdates] = useState(true)

  // Monitoring options
  //const [installMonitoring, setInstallMonitoring] = useState(true)
  //const [monitoringEmail, setMonitoringEmail] = useState("")

  const { toast } = useToast();
  const { sendMessage, lastMessage, mockMode } = useWebSocket();
  const [backendMessage, setBackendMessage] = useState(""); // State to store the backend message

  const handleFinalSubmit = async () => {
    if (!serverName || !ipAddress || !osType) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields.",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Send server creation request to the backend
      const response = await fetch("http://localhost:8000/servers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: serverName,
          ip_address: ipAddress,
          environment: environment,
          os: osType,
          username: username,
          password: password,
          ssh_port: sshPort,
          project: project,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create server");
      }

      const data = await response.json();
      setBackendMessage(data); // Store the backend message
      toast({
        title: "Server Created",
        description: data,
      });

      setIsLoading(false);
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding server:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add server. Please try again.",
      });
      setIsLoading(false);
    }
  };

  // Handle form submission for server details
  const handleServerDetailsSubmit = (e: any) => {
    e.preventDefault();

    if (!serverName || !ipAddress || !username || !password || !osType || !sshPort || !environment || !project) { 
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields.",
      });
      return;
    }

    setIsLoading(true);

    // In a real app, we would validate the connection here
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep(2);
    }, 1500);
  };

  // Handle project configuration submission
  const handleProjectConfigSubmit = (e: any) => {
    e.preventDefault();

    if (!project) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select a project type.",
      });
      return;
    }

    setIsLoading(true);

    // In a real app, we would validate the configuration here
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep(3);
    }, 1000);
  };

  /* Handle final submission
  const handleFinalSubmit = async () => {
    setIsLoading(true)

    try {
      // Create server configuration object
      const serverConfig = {
        // Basic info
        name: serverName,
        ip: ipAddress,
        username: username,
        password: password,
        ssh_port: sshPort,
        environment: environment,
        os_type: osType,
        os_version: osVersion,

        // Project configuration
        project_type: projectType,
        custom_commands: customCommands,
        open_ports: openPorts || PROJECT_TYPES[projectType]?.ports.join(","),
        install_packages: installPackages || PROJECT_TYPES[projectType]?.packages.join(","),

        // Security options
        enable_firewall: enableFirewall,
        disable_root_login: disableRootLogin,
        enable_fail2ban: enableFail2Ban,
        automatic_updates: automaticUpdates,

        // Monitoring options
        install_monitoring: installMonitoring,
        monitoring_email: monitoringEmail,
      }

      if (mockMode) {
        // Simulate server initialization in mock mode
        setTimeout(() => {
          toast({
            title: "Server Initialization Started",
            description: `Server ${serverName} initialization has begun. This may take several minutes.`,
          })

          // Close the dialog
          setIsLoading(false)
          resetForm()
          onOpenChange(false)

          // Show progress toast
          setTimeout(() => {
            toast({
              title: "Server Initialized",
              description: `Server ${serverName} has been successfully initialized and configured.`,
            })
          }, 5000)
        }, 2000)
      } else {
        // Send server initialization request via WebSocket
        sendMessage({
          action: "initialize-server",
          server: serverConfig,
        })

        // In a real app, we would wait for a response from the server
        // For now, we'll just simulate success
        setTimeout(() => {
          toast({
            title: "Server Initialization Started",
            description: `Server ${serverName} initialization has begun. This may take several minutes.`,
          })

          setIsLoading(false)
          resetForm()
          onOpenChange(false)
        }, 2000)
      }
    } catch (error) {
      console.error("Error initializing server:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to initialize server. Please try again.",
      })
      setIsLoading(false)
    }
  }*/

  // Reset form state
  const resetForm = () => {
    setServerName("");
    setIpAddress("");
    setUsername("root");
    setPassword("");
    setSshPort("22");
    setEnvironment("production");
    setOs("");
    setProject("");
    /*setOsVersion("")
    setCustomCommands("")
    setOpenPorts("")
    setInstallPackages("")
    setEnableFirewall(true)
    setDisableRootLogin(true)
    setEnableFail2Ban(true)
    setAutomaticUpdates(true)
    setInstallMonitoring(true)
    setMonitoringEmail("")
    setCurrentStep(1);
    setActiveTab("basic");*/
  };

  // Handle dialog close
  const handleOpenChange = (open: any) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Initialize New Server</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleServerDetailsSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="server-name">Server Name</Label>
              <Input
                id="server-name"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                placeholder="web-server-01"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ip-address">IP Address</Label>
              <Input
                id="ip-address"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="192.168.1.100"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">SSH Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="root"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">SSH Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="ssh-port">SSH Port</Label>
              <Input
                id="ssh-port"
                value={sshPort}
                onChange={(e) => setSshPort(e.target.value)}
                placeholder="22"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Input
                id="project"
                value={project}
                onChange={(e) => setProject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <Select value={environment} onValueChange={setEnvironment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="os-type">Operating System</Label>
              <Select value={osType} onValueChange={setOs} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select OS" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ubuntu">Ubuntu</SelectItem>
                  <SelectItem value="debian">Debian</SelectItem>
                  <SelectItem value="centos">CentOS</SelectItem>
                  <SelectItem value="rhel">RHEL</SelectItem>
                  <SelectItem value="amazon-linux">Amazon Linux</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleFinalSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing Server...
                </>
              ) : (
                "Initialize Server"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
