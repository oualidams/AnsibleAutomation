"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Loader2,
  Server,
  Plus,
  Shield,
  CheckCircle2,
  XCircle,
  HardDrive,
  Database,
  Globe,
  Code,
  FileCode,
} from "lucide-react"
import { useWebSocket } from "@/contexts/websocket-context"

// OS Templates
const OS_TEMPLATES = [
  {
    id: "ubuntu-20-04",
    name: "Ubuntu 20.04 LTS",
    description: "Ubuntu 20.04 LTS (Focal Fossa)",
    icon: <HardDrive className="h-4 w-4" />,
  },
  {
    id: "ubuntu-22-04",
    name: "Ubuntu 22.04 LTS",
    description: "Ubuntu 22.04 LTS (Jammy Jellyfish)",
    icon: <HardDrive className="h-4 w-4" />,
  },
  {
    id: "debian-11",
    name: "Debian 11",
    description: "Debian 11 (Bullseye)",
    icon: <HardDrive className="h-4 w-4" />,
  },
  {
    id: "centos-7",
    name: "CentOS 7",
    description: "CentOS 7",
    icon: <HardDrive className="h-4 w-4" />,
  },
  {
    id: "rocky-8",
    name: "Rocky Linux 8",
    description: "Rocky Linux 8",
    icon: <HardDrive className="h-4 w-4" />,
  },
]

// Project Templates
const PROJECT_TEMPLATES = [
  {
    id: "lamp",
    name: "LAMP Stack",
    description: "Linux, Apache, MySQL, PHP",
    icon: <Globe className="h-4 w-4" />,
    packages: ["apache2", "mysql-server", "php", "php-mysql", "libapache2-mod-php"],
    ports: ["80", "443", "3306"],
  },
  {
    id: "mean",
    name: "MEAN Stack",
    description: "MongoDB, Express, Angular, Node.js",
    icon: <Code className="h-4 w-4" />,
    packages: ["nodejs", "npm", "mongodb"],
    ports: ["80", "443", "27017", "3000"],
  },
  {
    id: "django",
    name: "Django",
    description: "Python Django web framework",
    icon: <FileCode className="h-4 w-4" />,
    packages: ["python3", "python3-pip", "python3-venv", "nginx"],
    ports: ["80", "443", "8000"],
  },
  {
    id: "wordpress",
    name: "WordPress",
    description: "WordPress CMS with LAMP stack",
    icon: <Globe className="h-4 w-4" />,
    packages: [
      "apache2",
      "mysql-server",
      "php",
      "php-mysql",
      "libapache2-mod-php",
      "php-curl",
      "php-gd",
      "php-mbstring",
      "php-xml",
      "php-xmlrpc",
      "php-soap",
      "php-intl",
      "php-zip",
    ],
    ports: ["80", "443", "3306"],
  },
  {
    id: "database",
    name: "Database Server",
    description: "MySQL or PostgreSQL database server",
    icon: <Database className="h-4 w-4" />,
    packages: ["mysql-server", "postgresql"],
    ports: ["3306", "5432"],
  },
]

// Security Templates
const SECURITY_TEMPLATES = [
  {
    id: "basic",
    name: "Basic Security",
    description: "Essential security settings for any server",
    icon: <Shield className="h-4 w-4" />,
    features: ["firewall", "ssh-hardening", "automatic-updates"],
  },
  {
    id: "advanced",
    name: "Advanced Security",
    description: "Comprehensive security for production servers",
    icon: <Shield className="h-4 w-4" />,
    features: ["firewall", "ssh-hardening", "automatic-updates", "fail2ban", "rootkit-scanner", "intrusion-detection"],
  },
]

export function ServerInitialization() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isInitializing, setIsInitializing] = useState(false)
  const [initProgress, setInitProgress] = useState(0)
  const [initStatus, setInitStatus] = useState<"idle" | "running" | "success" | "error">("idle")
  const [initLogs, setInitLogs] = useState<string[]>([])
  const [multipleServers, setMultipleServers] = useState(false)
  const [serverCount, setServerCount] = useState(1)

  // Form state
  const [serverData, setServerData] = useState({
    name: "",
    ip: "",
    username: "",
    password: "",
    sshPort: "22",
    environment: "production",
    osTemplate: "ubuntu-22-04",
    projectTemplate: "lamp",
    securityTemplate: "basic",
    customCommands: "",
    enableFirewall: true,
    disableRootLogin: true,
    enableFail2ban: true,
    automaticUpdates: true,
  })

  // Multiple servers state
  const [servers, setServers] = useState([
    {
      id: "1",
      name: "",
      ip: "",
      username: "",
      password: "",
      sshPort: "22",
    },
  ])

  const { toast } = useToast()
  const { sendMessage, lastMessage, mockMode } = useWebSocket()

  // Handle form input change
  const handleInputChange = (field: string, value: string | boolean) => {
    setServerData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle multiple servers input change
  const handleServerInputChange = (id: string, field: string, value: string) => {
    setServers((prev) => prev.map((server) => (server.id === id ? { ...server, [field]: value } : server)))
  }

  // Add server to multiple servers list
  const addServer = () => {
    setServers((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: "",
        ip: "",
        username: "",
        password: "",
        sshPort: "22",
      },
    ])
    setServerCount((prev) => prev + 1)
  }

  // Remove server from multiple servers list
  const removeServer = (id: string) => {
    if (servers.length > 1) {
      setServers((prev) => prev.filter((server) => server.id !== id))
      setServerCount((prev) => prev - 1)
    }
  }

  // Handle next step
  const handleNextStep = () => {
    // Validate current step
    if (currentStep === 1) {
      if (multipleServers) {
        // Validate multiple servers
        const isValid = servers.every((server) => server.name && server.ip && server.username && server.password)
        if (!isValid) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Please fill in all required fields for all servers.",
          })
          return
        }
      } else {
        // Validate single server
        if (!serverData.name || !serverData.ip || !serverData.username || !serverData.password) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Please fill in all required fields.",
          })
          return
        }
      }
    }

    setCurrentStep((prev) => prev + 1)
  }

  // Handle previous step
  const handlePreviousStep = () => {
    setCurrentStep((prev) => prev - 1)
  }

  // Handle server initialization
  const handleInitializeServers = async () => {
    setIsInitializing(true)
    setInitProgress(0)
    setInitStatus("running")
    setInitLogs([])

    try {
      if (multipleServers) {
        // Initialize multiple servers in parallel
        const serversToInitialize = servers.map((server) => ({
          ...server,
          environment: serverData.environment,
          osTemplate: serverData.osTemplate,
          projectTemplate: serverData.projectTemplate,
          securityTemplate: serverData.securityTemplate,
          customCommands: serverData.customCommands,
          enableFirewall: serverData.enableFirewall,
          disableRootLogin: serverData.disableRootLogin,
          enableFail2ban: serverData.enableFail2ban,
          automaticUpdates: serverData.automaticUpdates,
        }))

        if (mockMode) {
          // Simulate initialization in mock mode
          for (let progress = 0; progress <= 100; progress += 5) {
            await new Promise((resolve) => setTimeout(resolve, 500))
            setInitProgress(progress)

            // Add logs at specific progress points
            if (progress === 5) {
              setInitLogs((prev) => [...prev, "Starting server initialization..."])
            } else if (progress === 20) {
              setInitLogs((prev) => [...prev, "Establishing SSH connections to all servers..."])
              for (const server of serversToInitialize) {
                await new Promise((resolve) => setTimeout(resolve, 300))
                setInitLogs((prev) => [...prev, `Connected to ${server.name} (${server.ip})`])
              }
            } else if (progress === 40) {
              setInitLogs((prev) => [...prev, "Setting up base OS configurations..."])
            } else if (progress === 60) {
              setInitLogs((prev) => [
                ...prev,
                `Installing ${PROJECT_TEMPLATES.find((t) => t.id === serverData.projectTemplate)?.name} packages...`,
              ])
            } else if (progress === 80) {
              setInitLogs((prev) => [
                ...prev,
                `Applying ${SECURITY_TEMPLATES.find((t) => t.id === serverData.securityTemplate)?.name} settings...`,
              ])
            } else if (progress === 95) {
              setInitLogs((prev) => [...prev, "Finalizing configurations..."])
            } else if (progress === 100) {
              setInitLogs((prev) => [...prev, `Successfully initialized ${serversToInitialize.length} servers!`])
            }
          }

          setInitStatus("success")
        } else {
          // In a real app, send initialization request to backend
          // For now, simulate success
          setTimeout(() => {
            setInitProgress(100)
            setInitStatus("success")
            setInitLogs((prev) => [...prev, `Successfully initialized ${serversToInitialize.length} servers!`])
          }, 5000)
        }
      } else {
        // Initialize single server
        if (mockMode) {
          // Simulate initialization in mock mode
          for (let progress = 0; progress <= 100; progress += 5) {
            await new Promise((resolve) => setTimeout(resolve, 500))
            setInitProgress(progress)

            // Add logs at specific progress points
            if (progress === 5) {
              setInitLogs((prev) => [...prev, `Starting initialization of ${serverData.name} (${serverData.ip})...`])
            } else if (progress === 20) {
              setInitLogs((prev) => [
                ...prev,
                `Establishing SSH connection to ${serverData.name}...`,
                `Connected successfully. Setting up SSH keys...`,
              ])
            } else if (progress === 40) {
              setInitLogs((prev) => [
                ...prev,
                `Installing ${OS_TEMPLATES.find((t) => t.id === serverData.osTemplate)?.name} base packages...`,
              ])
            } else if (progress === 60) {
              setInitLogs((prev) => [
                ...prev,
                `Installing ${PROJECT_TEMPLATES.find((t) => t.id === serverData.projectTemplate)?.name} packages...`,
              ])
            } else if (progress === 80) {
              setInitLogs((prev) => [
                ...prev,
                `Applying ${SECURITY_TEMPLATES.find((t) => t.id === serverData.securityTemplate)?.name} settings...`,
              ])
            } else if (progress === 95) {
              setInitLogs((prev) => [...prev, "Finalizing configurations..."])
            } else if (progress === 100) {
              setInitLogs((prev) => [...prev, `Successfully initialized ${serverData.name}!`])
            }
          }

          setInitStatus("success")
        } else {
          // In a real app, send initialization request to backend
          // For now, simulate success
          setTimeout(() => {
            setInitProgress(100)
            setInitStatus("success")
            setInitLogs((prev) => [...prev, `Successfully initialized ${serverData.name}!`])
          }, 5000)
        }
      }
    } catch (error) {
      console.error("Initialization error:", error)
      setInitStatus("error")
      setInitLogs((prev) => [...prev, `Error: ${error.message}`])
    } finally {
      setIsInitializing(false)
    }
  }

  // Reset the form
  const resetForm = () => {
    setCurrentStep(1)
    setIsInitializing(false)
    setInitProgress(0)
    setInitStatus("idle")
    setInitLogs([])
    setMultipleServers(false)
    setServerCount(1)
    setServerData({
      name: "",
      ip: "",
      username: "",
      password: "",
      sshPort: "22",
      environment: "production",
      osTemplate: "ubuntu-22-04",
      projectTemplate: "lamp",
      securityTemplate: "basic",
      customCommands: "",
      enableFirewall: true,
      disableRootLogin: true,
      enableFail2ban: true,
      automaticUpdates: true,
    })
    setServers([
      {
        id: "1",
        name: "",
        ip: "",
        username: "",
        password: "",
        sshPort: "22",
      },
    ])
  }

  return (
    <div>
      <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Initialize New Server
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Initialize New Server</DialogTitle>
            <DialogDescription>Set up a new server with your preferred configuration</DialogDescription>
          </DialogHeader>

          {/* Step 1: Server Details */}
          {currentStep === 1 && (
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="multiple-servers"
                  checked={multipleServers}
                  onCheckedChange={(checked) => setMultipleServers(checked === true)}
                />
                <Label htmlFor="multiple-servers">Initialize multiple servers in parallel</Label>
              </div>

              {multipleServers ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Server Details</h3>
                    <Button variant="outline" size="sm" onClick={addServer} className="h-7 text-xs">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Server
                    </Button>
                  </div>

                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                      {servers.map((server, index) => (
                        <div key={server.id} className="p-3 border rounded-md space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium">Server #{index + 1}</h4>
                            {servers.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeServer(server.id)}
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor={`server-name-${server.id}`}>Server Name</Label>
                              <Input
                                id={`server-name-${server.id}`}
                                value={server.name}
                                onChange={(e) => handleServerInputChange(server.id, "name", e.target.value)}
                                placeholder="web-server-1"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`server-ip-${server.id}`}>IP Address</Label>
                              <Input
                                id={`server-ip-${server.id}`}
                                value={server.ip}
                                onChange={(e) => handleServerInputChange(server.id, "ip", e.target.value)}
                                placeholder="192.168.1.100"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`server-username-${server.id}`}>Username</Label>
                              <Input
                                id={`server-username-${server.id}`}
                                value={server.username}
                                onChange={(e) => handleServerInputChange(server.id, "username", e.target.value)}
                                placeholder="root"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`server-password-${server.id}`}>Password</Label>
                              <Input
                                id={`server-password-${server.id}`}
                                type="password"
                                value={server.password}
                                onChange={(e) => handleServerInputChange(server.id, "password", e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`server-ssh-port-${server.id}`}>SSH Port</Label>
                              <Input
                                id={`server-ssh-port-${server.id}`}
                                value={server.sshPort}
                                onChange={(e) => handleServerInputChange(server.id, "sshPort", e.target.value)}
                                placeholder="22"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="server-name">Server Name</Label>
                    <Input
                      id="server-name"
                      value={serverData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="web-server-1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="server-ip">IP Address</Label>
                    <Input
                      id="server-ip"
                      value={serverData.ip}
                      onChange={(e) => handleInputChange("ip", e.target.value)}
                      placeholder="192.168.1.100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="server-username">Username</Label>
                    <Input
                      id="server-username"
                      value={serverData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      placeholder="root"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="server-password">Password</Label>
                    <Input
                      id="server-password"
                      type="password"
                      value={serverData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="server-ssh-port">SSH Port</Label>
                    <Input
                      id="server-ssh-port"
                      value={serverData.sshPort}
                      onChange={(e) => handleInputChange("sshPort", e.target.value)}
                      placeholder="22"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="server-environment">Environment</Label>
                    <Select
                      value={serverData.environment}
                      onValueChange={(value) => handleInputChange("environment", value)}
                    >
                      <SelectTrigger id="server-environment">
                        <SelectValue placeholder="Select environment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="production">Production</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="testing">Testing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Templates */}
          {currentStep === 2 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Environment</Label>
                <Select
                  value={serverData.environment}
                  onValueChange={(value) => handleInputChange("environment", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Operating System</Label>
                <div className="grid grid-cols-2 gap-2">
                  {OS_TEMPLATES.map((template) => (
                    <div
                      key={template.id}
                      className={`flex items-start p-3 border rounded-md cursor-pointer transition-colors ${
                        serverData.osTemplate === template.id
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => handleInputChange("osTemplate", template.id)}
                    >
                      <div className="mr-2 mt-0.5">{template.icon}</div>
                      <div>
                        <div className="font-medium text-sm">{template.name}</div>
                        <div className="text-xs text-muted-foreground">{template.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Project Template</Label>
                <div className="grid grid-cols-2 gap-2">
                  {PROJECT_TEMPLATES.map((template) => (
                    <div
                      key={template.id}
                      className={`flex items-start p-3 border rounded-md cursor-pointer transition-colors ${
                        serverData.projectTemplate === template.id
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => handleInputChange("projectTemplate", template.id)}
                    >
                      <div className="mr-2 mt-0.5">{template.icon}</div>
                      <div>
                        <div className="font-medium text-sm">{template.name}</div>
                        <div className="text-xs text-muted-foreground">{template.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Security Template</Label>
                <div className="grid grid-cols-2 gap-2">
                  {SECURITY_TEMPLATES.map((template) => (
                    <div
                      key={template.id}
                      className={`flex items-start p-3 border rounded-md cursor-pointer transition-colors ${
                        serverData.securityTemplate === template.id
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => handleInputChange("securityTemplate", template.id)}
                    >
                      <div className="mr-2 mt-0.5">{template.icon}</div>
                      <div>
                        <div className="font-medium text-sm">{template.name}</div>
                        <div className="text-xs text-muted-foreground">{template.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Advanced Configuration */}
          {currentStep === 3 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="custom-commands">Custom Commands (Optional)</Label>
                <Textarea
                  id="custom-commands"
                  value={serverData.customCommands}
                  onChange={(e) => handleInputChange("customCommands", e.target.value)}
                  placeholder="Enter custom commands to run after initialization"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  These commands will be executed after the server is initialized
                </p>
              </div>

              <div className="space-y-2">
                <Label>Security Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enable-firewall"
                      checked={serverData.enableFirewall}
                      onCheckedChange={(checked) => handleInputChange("enableFirewall", checked === true)}
                    />
                    <Label htmlFor="enable-firewall">Enable Firewall</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="disable-root-login"
                      checked={serverData.disableRootLogin}
                      onCheckedChange={(checked) => handleInputChange("disableRootLogin", checked === true)}
                    />
                    <Label htmlFor="disable-root-login">Disable Root SSH Login</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enable-fail2ban"
                      checked={serverData.enableFail2ban}
                      onCheckedChange={(checked) => handleInputChange("enableFail2ban", checked === true)}
                    />
                    <Label htmlFor="enable-fail2ban">Install Fail2ban</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="automatic-updates"
                      checked={serverData.automaticUpdates}
                      onCheckedChange={(checked) => handleInputChange("automaticUpdates", checked === true)}
                    />
                    <Label htmlFor="automatic-updates">Enable Automatic Updates</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Summary</Label>
                <div className="border rounded-md p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Servers:</span>{" "}
                      {multipleServers ? `${serverCount} servers` : serverData.name}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Environment:</span> {serverData.environment}
                    </div>
                    <div>
                      <span className="text-muted-foreground">OS Template:</span>{" "}
                      {OS_TEMPLATES.find((t) => t.id === serverData.osTemplate)?.name}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Project Template:</span>{" "}
                      {PROJECT_TEMPLATES.find((t) => t.id === serverData.projectTemplate)?.name}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Security Template:</span>{" "}
                      {SECURITY_TEMPLATES.find((t) => t.id === serverData.securityTemplate)?.name}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Initialization Progress */}
          {currentStep === 4 && (
            <div className="space-y-4 py-4">
              {initStatus === "idle" ? (
                <div className="text-center py-4">
                  <Button onClick={handleInitializeServers} disabled={isInitializing}>
                    {isInitializing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Initializing...
                      </>
                    ) : (
                      <>
                        <Server className="h-4 w-4 mr-2" />
                        Start Initialization
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Click the button above to start the initialization process
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress: {initProgress}%</span>
                      <span>
                        {initStatus === "running" ? (
                          <span className="flex items-center">
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Running
                          </span>
                        ) : initStatus === "success" ? (
                          <span className="flex items-center text-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Complete
                          </span>
                        ) : (
                          <span className="flex items-center text-red-500">
                            <XCircle className="h-3 w-3 mr-1" />
                            Failed
                          </span>
                        )}
                      </span>
                    </div>
                    <Progress value={initProgress} className="h-2" />
                  </div>

                  <div className="border rounded-md">
                    <div className="bg-muted/50 p-2 border-b flex items-center justify-between">
                      <span className="font-medium text-sm">Initialization Logs</span>
                      <Badge variant="outline" className="text-xs">
                        {multipleServers
                          ? `${serverCount} servers`
                          : OS_TEMPLATES.find((t) => t.id === serverData.osTemplate)?.name}
                      </Badge>
                    </div>
                    <ScrollArea className="h-64">
                      <div className="p-2 font-mono text-xs space-y-1">
                        {initLogs.length === 0 ? (
                          <div className="text-muted-foreground">Waiting for logs...</div>
                        ) : (
                          initLogs.map((log, index) => (
                            <div key={index} className="whitespace-pre-wrap break-all">
                              {log}
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  {initStatus === "success" && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-green-800">Initialization Complete</h4>
                        <p className="text-sm text-green-700">
                          {multipleServers
                            ? `All ${serverCount} servers have been successfully initialized.`
                            : `Server ${serverData.name} has been successfully initialized.`}
                        </p>
                      </div>
                    </div>
                  )}

                  {initStatus === "error" && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start">
                      <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-red-800">Initialization Failed</h4>
                        <p className="text-sm text-red-700">
                          An error occurred during the initialization process. Please check the logs for details.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex items-center justify-between">
            {currentStep > 1 && currentStep < 4 && (
              <Button variant="outline" onClick={handlePreviousStep}>
                Back
              </Button>
            )}
            {currentStep === 1 && <div />}

            {currentStep < 3 && (
              <Button onClick={handleNextStep}>
                Next
                <span className="sr-only">to step {currentStep + 1}</span>
              </Button>
            )}
            {currentStep === 3 && (
              <Button onClick={handleNextStep}>
                Review & Initialize
                <span className="sr-only">servers</span>
              </Button>
            )}
            {currentStep === 4 && (
              <div className="flex gap-2">
                {initStatus === "success" || initStatus === "error" ? (
                  <>
                    <Button variant="outline" onClick={resetForm}>
                      Initialize Another Server
                    </Button>
                    <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                )}
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
