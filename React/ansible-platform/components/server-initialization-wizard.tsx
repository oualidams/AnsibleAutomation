"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Server, Shield, Database, Code, Settings } from "lucide-react"
import { useWebSocket } from "@/contexts/websocket-context"

// Project types for initialization
const PROJECT_TYPES = {
  web: {
    name: "Web Application",
    icon: <Code className="h-5 w-5" />,
    description: "Configure server for hosting web applications with Nginx/Apache, PHP, Node.js, etc.",
    packages: ["nginx", "nodejs", "certbot", "fail2ban"],
    ports: [80, 443, 3000, 8080],
  },
  database: {
    name: "Database Server",
    icon: <Database className="h-5 w-5" />,
    description: "Configure server for database hosting with PostgreSQL, MySQL, MongoDB, etc.",
    packages: ["postgresql", "mysql-server", "redis-server"],
    ports: [5432, 3306, 6379],
  },
  devops: {
    name: "DevOps Tools",
    icon: <Settings className="h-5 w-5" />,
    description: "Configure server with CI/CD tools, monitoring, and container orchestration.",
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
}

export function ServerInitializationWizard({ open, onOpenChange }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")

  // Server basic info
  const [serverName, setServerName] = useState("")
  const [ipAddress, setIpAddress] = useState("")
  const [username, setUsername] = useState("root")
  const [password, setPassword] = useState("")
  const [sshPort, setSshPort] = useState("22")
  const [environment, setEnvironment] = useState("production")
  const [osType, setOsType] = useState("")
  const [osVersion, setOsVersion] = useState("")

  // Project configuration
  const [projectType, setProjectType] = useState("")
  const [customCommands, setCustomCommands] = useState("")
  const [openPorts, setOpenPorts] = useState("")
  const [installPackages, setInstallPackages] = useState("")

  // Security options
  const [enableFirewall, setEnableFirewall] = useState(true)
  const [disableRootLogin, setDisableRootLogin] = useState(true)
  const [enableFail2Ban, setEnableFail2Ban] = useState(true)
  const [automaticUpdates, setAutomaticUpdates] = useState(true)

  // Monitoring options
  const [installMonitoring, setInstallMonitoring] = useState(true)
  const [monitoringEmail, setMonitoringEmail] = useState("")

  const { toast } = useToast()
  const { sendMessage, lastMessage, mockMode } = useWebSocket()

  // Handle form submission for server details
  const handleServerDetailsSubmit = (e) => {
    e.preventDefault()

    if (!serverName || !ipAddress || !username || !password || !osType) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields.",
      })
      return
    }

    setIsLoading(true)

    // In a real app, we would validate the connection here
    setTimeout(() => {
      setIsLoading(false)
      setCurrentStep(2)
    }, 1500)
  }

  // Handle project configuration submission
  const handleProjectConfigSubmit = (e) => {
    e.preventDefault()

    if (!projectType) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select a project type.",
      })
      return
    }

    setIsLoading(true)

    // In a real app, we would validate the configuration here
    setTimeout(() => {
      setIsLoading(false)
      setCurrentStep(3)
    }, 1000)
  }

  // Handle final submission
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
  }

  // Reset form state
  const resetForm = () => {
    setServerName("")
    setIpAddress("")
    setUsername("root")
    setPassword("")
    setSshPort("22")
    setEnvironment("production")
    setOsType("")
    setOsVersion("")
    setProjectType("")
    setCustomCommands("")
    setOpenPorts("")
    setInstallPackages("")
    setEnableFirewall(true)
    setDisableRootLogin(true)
    setEnableFail2Ban(true)
    setAutomaticUpdates(true)
    setInstallMonitoring(true)
    setMonitoringEmail("")
    setCurrentStep(1)
    setActiveTab("basic")
  }

  // Handle dialog close
  const handleOpenChange = (open) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Initialize New Server</DialogTitle>
          <DialogDescription>
            {currentStep === 1 && "Enter server details to establish a connection."}
            {currentStep === 2 && "Configure the server for your specific project needs."}
            {currentStep === 3 && "Review and confirm server initialization settings."}
          </DialogDescription>
        </DialogHeader>

        {currentStep === 1 ? (
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

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ssh-port">SSH Port</Label>
                <Input id="ssh-port" value={sshPort} onChange={(e) => setSshPort(e.target.value)} placeholder="22" />
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
                <Select value={osType} onValueChange={setOsType} required>
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

            {osType && (
              <div className="space-y-2">
                <Label htmlFor="os-version">OS Version</Label>
                <Select value={osVersion} onValueChange={setOsVersion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select OS Version" />
                  </SelectTrigger>
                  <SelectContent>
                    {osType === "ubuntu" && (
                      <>
                        <SelectItem value="22.04">Ubuntu 22.04 LTS</SelectItem>
                        <SelectItem value="20.04">Ubuntu 20.04 LTS</SelectItem>
                        <SelectItem value="18.04">Ubuntu 18.04 LTS</SelectItem>
                      </>
                    )}
                    {osType === "debian" && (
                      <>
                        <SelectItem value="11">Debian 11 (Bullseye)</SelectItem>
                        <SelectItem value="10">Debian 10 (Buster)</SelectItem>
                      </>
                    )}
                    {osType === "centos" && (
                      <>
                        <SelectItem value="9">CentOS Stream 9</SelectItem>
                        <SelectItem value="8">CentOS Stream 8</SelectItem>
                        <SelectItem value="7">CentOS 7</SelectItem>
                      </>
                    )}
                    {osType === "rhel" && (
                      <>
                        <SelectItem value="9">RHEL 9</SelectItem>
                        <SelectItem value="8">RHEL 8</SelectItem>
                        <SelectItem value="7">RHEL 7</SelectItem>
                      </>
                    )}
                    {osType === "amazon-linux" && (
                      <>
                        <SelectItem value="2023">Amazon Linux 2023</SelectItem>
                        <SelectItem value="2">Amazon Linux 2</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Next"
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : currentStep === 2 ? (
          <form onSubmit={handleProjectConfigSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Project Type</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {Object.entries(PROJECT_TYPES).map(([key, project]) => (
                  <div
                    key={key}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      projectType === key ? "border-primary bg-primary/5" : "hover:border-primary/50"
                    }`}
                    onClick={() => setProjectType(key)}
                  >
                    <div className="flex items-center gap-2">
                      {project.icon}
                      <h3 className="font-medium">{project.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{project.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {projectType && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="basic">Basic Setup</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="open-ports">Open Ports</Label>
                    <Input
                      id="open-ports"
                      value={openPorts || PROJECT_TYPES[projectType]?.ports.join(", ")}
                      onChange={(e) => setOpenPorts(e.target.value)}
                      placeholder="80, 443, 22"
                    />
                    <p className="text-xs text-muted-foreground">
                      Comma-separated list of ports to open in the firewall
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="install-packages">Packages to Install</Label>
                    <Input
                      id="install-packages"
                      value={installPackages || PROJECT_TYPES[projectType]?.packages.join(", ")}
                      onChange={(e) => setInstallPackages(e.target.value)}
                      placeholder="nginx, nodejs, certbot"
                    />
                    <p className="text-xs text-muted-foreground">Comma-separated list of packages to install</p>
                  </div>
                </TabsContent>

                <TabsContent value="security" className="space-y-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enable-firewall"
                      checked={enableFirewall}
                      onCheckedChange={(checked) => setEnableFirewall(checked === true)}
                    />
                    <Label htmlFor="enable-firewall">Enable Firewall (UFW/Firewalld)</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="disable-root-login"
                      checked={disableRootLogin}
                      onCheckedChange={(checked) => setDisableRootLogin(checked === true)}
                    />
                    <Label htmlFor="disable-root-login">Disable Root SSH Login</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enable-fail2ban"
                      checked={enableFail2Ban}
                      onCheckedChange={(checked) => setEnableFail2Ban(checked === true)}
                    />
                    <Label htmlFor="enable-fail2ban">Install Fail2Ban</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="automatic-updates"
                      checked={automaticUpdates}
                      onCheckedChange={(checked) => setAutomaticUpdates(checked === true)}
                    />
                    <Label htmlFor="automatic-updates">Enable Automatic Security Updates</Label>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="install-monitoring"
                      checked={installMonitoring}
                      onCheckedChange={(checked) => setInstallMonitoring(checked === true)}
                    />
                    <Label htmlFor="install-monitoring">Install Monitoring Agent</Label>
                  </div>

                  {installMonitoring && (
                    <div className="space-y-2">
                      <Label htmlFor="monitoring-email">Alert Email</Label>
                      <Input
                        id="monitoring-email"
                        type="email"
                        value={monitoringEmail}
                        onChange={(e) => setMonitoringEmail(e.target.value)}
                        placeholder="alerts@example.com"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="custom-commands">Custom Commands</Label>
                    <Textarea
                      id="custom-commands"
                      value={customCommands}
                      onChange={(e) => setCustomCommands(e.target.value)}
                      placeholder="# Add any custom commands to run during initialization
mkdir -p /var/www/html
chown -R www-data:www-data /var/www/html"
                      className="font-mono text-sm h-32"
                    />
                    <p className="text-xs text-muted-foreground">
                      These commands will run at the end of initialization
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Next"
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <h3 className="font-medium text-lg">Server Information</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{serverName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IP Address:</span>
                  <span className="font-medium">{ipAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">OS:</span>
                  <span className="font-medium">
                    {osType} {osVersion}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Environment:</span>
                  <span className="font-medium">{environment}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-lg">Project Configuration</h3>
              <div className="rounded-md border p-3">
                <div className="flex items-center gap-2">
                  {PROJECT_TYPES[projectType]?.icon}
                  <span className="font-medium">{PROJECT_TYPES[projectType]?.name}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{PROJECT_TYPES[projectType]?.description}</p>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-1">Packages</h4>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      {(installPackages || PROJECT_TYPES[projectType]?.packages.join(",")).split(",").map((pkg) => (
                        <li key={pkg.trim()}>{pkg.trim()}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Open Ports</h4>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      {(openPorts || PROJECT_TYPES[projectType]?.ports.join(",")).split(",").map((port) => (
                        <li key={port.trim()}>Port {port.trim()}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-lg">Security Configuration</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Firewall: {enableFirewall ? "Enabled" : "Disabled"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Root SSH Login: {disableRootLogin ? "Disabled" : "Enabled"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Fail2Ban: {enableFail2Ban ? "Installed" : "Not Installed"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Auto Updates: {automaticUpdates ? "Enabled" : "Disabled"}</span>
                </div>
              </div>
            </div>

            {customCommands && (
              <div className="space-y-2">
                <h3 className="font-medium text-lg">Custom Commands</h3>
                <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto">{customCommands}</pre>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                Back
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
