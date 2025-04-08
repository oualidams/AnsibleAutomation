"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Server, Key } from "lucide-react"

export default function NewServer() {
  const [step, setStep] = useState(1)
  const [isProvisioning, setIsProvisioning] = useState(false)
  const [provisioningStatus, setProvisioningStatus] = useState("")
  const [serverDetails, setServerDetails] = useState({
    name: "",
    hostname: "",
    ip: "",
    os: "",
    username: "",
    password: "",
    useTemplate: false,
    template: "",
  })

  const handleChange = (field: string, value: string | boolean) => {
    setServerDetails((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleProvision = () => {
    setIsProvisioning(true)
    setProvisioningStatus("Connecting to server...")

    // Simulate provisioning process
    setTimeout(() => {
      setProvisioningStatus("Verifying credentials...")
      setTimeout(() => {
        setProvisioningStatus("Generating SSH keys...")
        setTimeout(() => {
          setProvisioningStatus("Configuring Ansible...")
          setTimeout(() => {
            setProvisioningStatus("Applying base configuration...")
            setTimeout(() => {
              if (serverDetails.useTemplate && serverDetails.template) {
                setProvisioningStatus(`Applying ${serverDetails.template} template...`)
                setTimeout(() => {
                  setProvisioningStatus("Server provisioned successfully!")
                  setIsProvisioning(false)
                  // Reset form or redirect
                }, 2000)
              } else {
                setProvisioningStatus("Server provisioned successfully!")
                setIsProvisioning(false)
                // Reset form or redirect
              }
            }, 2000)
          }, 2000)
        }, 2000)
      }, 2000)
    }, 2000)
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Provision New Server</CardTitle>
        <CardDescription>Add a new server to be managed by Ansible</CardDescription>
      </CardHeader>
      <CardContent>
        {isProvisioning ? (
          <div className="py-8 text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <div className="font-medium text-lg">{provisioningStatus}</div>
            <div className="text-sm text-muted-foreground">
              This process may take a few minutes. Please do not close this window.
            </div>
          </div>
        ) : (
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="basic" disabled={step !== 1} onClick={() => setStep(1)}>
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="access" disabled={step < 2} onClick={() => step >= 2 && setStep(2)}>
                Access
              </TabsTrigger>
              <TabsTrigger value="template" disabled={step < 3} onClick={() => step >= 3 && setStep(3)}>
                Template
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Server Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., web-server-01"
                    value={serverDetails.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hostname">Hostname</Label>
                  <Input
                    id="hostname"
                    placeholder="e.g., web01.example.com"
                    value={serverDetails.hostname}
                    onChange={(e) => handleChange("hostname", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ip">IP Address</Label>
                  <Input
                    id="ip"
                    placeholder="e.g., 192.168.1.10"
                    value={serverDetails.ip}
                    onChange={(e) => handleChange("ip", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="os">Operating System</Label>
                  <Select value={serverDetails.os} onValueChange={(value) => handleChange("os", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select OS" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ubuntu-22.04">Ubuntu 22.04 LTS</SelectItem>
                      <SelectItem value="ubuntu-20.04">Ubuntu 20.04 LTS</SelectItem>
                      <SelectItem value="debian-11">Debian 11</SelectItem>
                      <SelectItem value="centos-8">CentOS 8</SelectItem>
                      <SelectItem value="centos-7">CentOS 7</SelectItem>
                      <SelectItem value="rhel-8">Red Hat Enterprise Linux 8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!serverDetails.name || !serverDetails.hostname || !serverDetails.ip || !serverDetails.os}
                >
                  Next
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="access" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="e.g., admin"
                      value={serverDetails.username}
                      onChange={(e) => handleChange("username", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={serverDetails.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                    />
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-md">
                  <div className="flex items-start space-x-3">
                    <Key className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="font-medium">SSH Key Authentication</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        After initial connection, Ansible will automatically generate and configure SSH keys for
                        passwordless authentication.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={!serverDetails.username || !serverDetails.password}>
                  Next
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="template" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="useTemplate"
                    checked={serverDetails.useTemplate}
                    onCheckedChange={(checked) => handleChange("useTemplate", Boolean(checked))}
                  />
                  <Label htmlFor="useTemplate">Apply a server template</Label>
                </div>

                {serverDetails.useTemplate && (
                  <div className="space-y-2">
                    <Label htmlFor="template">Select Template</Label>
                    <Select value={serverDetails.template} onValueChange={(value) => handleChange("template", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="web-server">Web Server (Nginx, PHP)</SelectItem>
                        <SelectItem value="db-server">Database Server (PostgreSQL)</SelectItem>
                        <SelectItem value="app-server">Application Server (Node.js)</SelectItem>
                        <SelectItem value="storage-server">Storage Server (NFS)</SelectItem>
                        <SelectItem value="monitoring-server">Monitoring Server (Prometheus)</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="text-sm text-muted-foreground mt-2">
                      The selected template will automatically install and configure the necessary software and settings
                      for this server type.
                    </div>
                  </div>
                )}

                <div className="bg-muted/50 p-4 rounded-md mt-4">
                  <div className="flex items-start space-x-3">
                    <Server className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="font-medium">Server Summary</h4>
                      <div className="text-sm mt-2 space-y-1">
                        <div>
                          <span className="font-medium">Name:</span> {serverDetails.name}
                        </div>
                        <div>
                          <span className="font-medium">Hostname:</span> {serverDetails.hostname}
                        </div>
                        <div>
                          <span className="font-medium">IP Address:</span> {serverDetails.ip}
                        </div>
                        <div>
                          <span className="font-medium">OS:</span> {serverDetails.os.replace("-", " ").toUpperCase()}
                        </div>
                        {serverDetails.useTemplate && serverDetails.template && (
                          <div>
                            <span className="font-medium">Template:</span> {serverDetails.template.replace("-", " ")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={handleProvision}>Provision Server</Button>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

