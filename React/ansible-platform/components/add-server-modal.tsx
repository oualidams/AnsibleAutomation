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
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useWebSocket } from "@/contexts/websocket-context"

export function AddServerModal({ open, onOpenChange }) {
  const [serverName, setServerName] = useState("")
  const [ipAddress, setIpAddress] = useState("")
  const [username, setUsername] = useState("root")
  const [password, setPassword] = useState("")
  const [environment, setEnvironment] = useState("production")
  const [osType, setOsType] = useState("")
  const [runTemplate, setRunTemplate] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [sshKeyGenerated, setSshKeyGenerated] = useState(false)
  const { toast } = useToast()
  const { sendMessage, lastMessage, mockMode } = useWebSocket()

  // OS-specific templates
  const osTemplates = {
    ubuntu: [
      { value: "ubuntu-basic", label: "Ubuntu Basic Setup" },
      { value: "ubuntu-web", label: "Ubuntu Web Server" },
      { value: "ubuntu-db", label: "Ubuntu Database Server" },
    ],
    centos: [
      { value: "centos-basic", label: "CentOS Basic Setup" },
      { value: "centos-web", label: "CentOS Web Server" },
      { value: "centos-db", label: "CentOS Database Server" },
    ],
    debian: [
      { value: "debian-basic", label: "Debian Basic Setup" },
      { value: "debian-web", label: "Debian Web Server" },
      { value: "debian-db", label: "Debian Database Server" },
    ],
    rhel: [
      { value: "rhel-basic", label: "RHEL Basic Setup" },
      { value: "rhel-web", label: "RHEL Web Server" },
      { value: "rhel-db", label: "RHEL Database Server" },
    ],
    windows: [
      { value: "windows-basic", label: "Windows Basic Setup" },
      { value: "windows-web", label: "Windows Web Server" },
      { value: "windows-db", label: "Windows Database Server" },
    ],
  }

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

  // Handle SSH key generation
  const handleGenerateSSHKey = () => {
    setIsLoading(true)

    // Simulate SSH key generation
    setTimeout(() => {
      setSshKeyGenerated(true)
      setIsLoading(false)
      toast({
        title: "SSH Key Generated",
        description: "SSH key pair has been generated and the public key has been transferred to the server.",
      })
    }, 2000)
  }

  // Handle final submission
  const handleFinalSubmit = async () => {
    if (!sshKeyGenerated) {
      toast({
        variant: "destructive",
        title: "SSH Key Required",
        description: "Please generate an SSH key before adding the server.",
      })
      return
    }

    setIsLoading(true)

    try {
      // Create server object
      const serverData = {
        name: serverName,
        ip: ipAddress,
        environment: environment,
        os: osType,
        cpu: "Unknown", // This would be detected in a real app
        memory: "Unknown", // This would be detected in a real app
        disk: "Unknown", // This would be detected in a real app
        ssh_key_path: `/etc/ansible/keys/${serverName}`,
      }

      if (mockMode) {
        // Simulate server creation in mock mode
        setTimeout(() => {
          toast({
            title: "Server Added",
            description: `Server ${serverName} has been added successfully.`,
          })

          if (runTemplate) {
            toast({
              title: "OS Template Applied",
              description: `Applied ${osType} configuration to ${serverName}.`,
            })
          }

          setIsLoading(false)
          resetForm()
          onOpenChange(false)
        }, 1500)
      } else {
        // Send server creation request via WebSocket
        sendMessage({
          action: "add-server",
          server: serverData,
          runTemplate: runTemplate,
          osType: osType,
        })

        // In a real app, we would wait for a response from the server
        // For now, we'll just simulate success
        setTimeout(() => {
          toast({
            title: "Server Added",
            description: `Server ${serverName} has been added successfully.`,
          })

          setIsLoading(false)
          resetForm()
          onOpenChange(false)
        }, 1500)
      }
    } catch (error) {
      console.error("Error adding server:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add server. Please try again.",
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
    setEnvironment("production")
    setOsType("")
    setRunTemplate(false)
    setCurrentStep(1)
    setSshKeyGenerated(false)
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Server</DialogTitle>
          <DialogDescription>
            {currentStep === 1
              ? "Enter server details to establish a connection."
              : "Generate SSH key for passwordless authentication."}
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
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="root"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
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
                    <SelectItem value="centos">CentOS</SelectItem>
                    <SelectItem value="debian">Debian</SelectItem>
                    <SelectItem value="rhel">RHEL</SelectItem>
                    <SelectItem value="windows">Windows</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

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
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>SSH Key Authentication</Label>
                <Button type="button" size="sm" onClick={handleGenerateSSHKey} disabled={isLoading || sshKeyGenerated}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : sshKeyGenerated ? (
                    "Generated"
                  ) : (
                    "Generate Key"
                  )}
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                {sshKeyGenerated
                  ? "SSH key has been generated and the public key has been transferred to the server."
                  : "Generate an SSH key pair for passwordless authentication to this server."}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="run-template"
                  checked={runTemplate}
                  onCheckedChange={(checked) => setRunTemplate(checked === true)}
                />
                <Label htmlFor="run-template">Apply OS configuration template</Label>
              </div>

              {runTemplate && osType && (
                <div className="text-sm text-muted-foreground mt-2 p-2 bg-muted rounded-md">
                  <p className="font-medium">Selected OS: {osType.charAt(0).toUpperCase() + osType.slice(1)}</p>
                  <p className="mt-1">The following configuration will be applied:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Base system configuration</li>
                    <li>Security hardening</li>
                    <li>Standard monitoring agents</li>
                    <li>OS-specific optimizations</li>
                  </ul>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button type="button" onClick={handleFinalSubmit} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Server...
                  </>
                ) : (
                  "Add Server"
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
