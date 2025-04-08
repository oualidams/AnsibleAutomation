"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, Copy, Settings, FileText } from "lucide-react"

export default function Configurations() {
  const [configurations, setConfigurations] = useState([
    {
      id: "nginx-config",
      name: "Nginx Configuration",
      description: "Standard web server configuration",
      category: "web",
      lastModified: "2023-10-15",
      usageCount: 8,
    },
    {
      id: "postgres-config",
      name: "PostgreSQL Configuration",
      description: "Optimized for transactional workloads",
      category: "database",
      lastModified: "2023-09-20",
      usageCount: 5,
    },
    {
      id: "ssh-hardening",
      name: "SSH Hardening",
      description: "Security-focused SSH configuration",
      category: "security",
      lastModified: "2023-10-05",
      usageCount: 12,
    },
    {
      id: "ntp-config",
      name: "NTP Configuration",
      description: "Time synchronization setup",
      category: "system",
      lastModified: "2023-08-12",
      usageCount: 10,
    },
    {
      id: "firewall-rules",
      name: "Firewall Rules",
      description: "Standard firewall configuration",
      category: "security",
      lastModified: "2023-10-10",
      usageCount: 9,
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null)

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "web":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">
            {category}
          </Badge>
        )
      case "database":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
            {category}
          </Badge>
        )
      case "security":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">
            {category}
          </Badge>
        )
      case "system":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20"
          >
            {category}
          </Badge>
        )
      default:
        return <Badge variant="outline">{category}</Badge>
    }
  }

  const filteredConfigurations = configurations.filter(
    (config) =>
      config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const selectedConfigData = configurations.find((config) => config.id === selectedConfig)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search configurations..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Configuration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Configuration</DialogTitle>
              <DialogDescription>Create a new configuration that can be applied to servers</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" placeholder="e.g., Nginx Configuration" className="col-span-3" />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <select
                  id="category"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="web">Web</option>
                  <option value="database">Database</option>
                  <option value="security">Security</option>
                  <option value="system">System</option>
                  <option value="network">Network</option>
                </select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input id="description" placeholder="Brief description of the configuration" className="col-span-3" />
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="playbook" className="text-right pt-2">
                  Ansible Task
                </Label>
                <Textarea
                  id="playbook"
                  className="col-span-3 font-mono text-sm h-64"
                  defaultValue={`---
# Ansible task for configuration
- name: Apply configuration
  template:
    src: templates/config.conf.j2
    dest: /etc/service/config.conf
    owner: root
    group: root
    mode: '0644'
  notify: Restart service

- name: Ensure service is running
  service:
    name: service
    state: started
    enabled: yes`}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">Save Configuration</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="border rounded-md">
            {filteredConfigurations.length > 0 ? (
              <div className="divide-y">
                {filteredConfigurations.map((config) => (
                  <div
                    key={config.id}
                    className={`p-3 cursor-pointer hover:bg-muted/50 ${selectedConfig === config.id ? "bg-muted" : ""}`}
                    onClick={() => setSelectedConfig(config.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium">{config.name}</div>
                      {getCategoryBadge(config.category)}
                    </div>
                    <div className="text-sm text-muted-foreground">{config.description}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">No configurations found</div>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          {selectedConfigData ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <CardTitle>{selectedConfigData.name}</CardTitle>
                    {getCategoryBadge(selectedConfigData.category)}
                  </div>
                  <CardDescription>{selectedConfigData.description}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="task">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="task">Ansible Task</TabsTrigger>
                    <TabsTrigger value="files">Configuration Files</TabsTrigger>
                    <TabsTrigger value="usage">Usage</TabsTrigger>
                  </TabsList>

                  <TabsContent value="task">
                    <div className="bg-muted p-4 rounded-md font-mono text-sm whitespace-pre overflow-auto h-96">
                      {selectedConfigData.id === "nginx-config"
                        ? `---
# Nginx Configuration Task
- name: Ensure Nginx is installed
  apt:
    name: nginx
    state: present

- name: Configure Nginx main configuration
  template:
    src: templates/nginx.conf.j2
    dest: /etc/nginx/nginx.conf
    owner: root
    group: root
    mode: '0644'
  notify: Restart Nginx

- name: Configure Nginx virtual host
  template:
    src: templates/vhost.conf.j2
    dest: /etc/nginx/sites-available/default
    owner: root
    group: root
    mode: '0644'
  notify: Restart Nginx

- name: Enable Nginx virtual host
  file:
    src: /etc/nginx/sites-available/default
    dest: /etc/nginx/sites-enabled/default
    state: link
  notify: Restart Nginx

- name: Ensure Nginx is running and enabled
  service:
    name: nginx
    state: started
    enabled: yes

handlers:
  - name: Restart Nginx
    service:
      name: nginx
      state: restarted`
                        : selectedConfigData.id === "postgres-config"
                          ? `---
# PostgreSQL Configuration Task
- name: Ensure PostgreSQL is installed
  apt:
    name:
      - postgresql
      - postgresql-contrib
    state: present

- name: Configure PostgreSQL main configuration
  template:
    src: templates/postgresql.conf.j2
    dest: /etc/postgresql/12/main/postgresql.conf
    owner: postgres
    group: postgres
    mode: '0644'
  notify: Restart PostgreSQL

- name: Configure PostgreSQL client authentication
  template:
    src: templates/pg_hba.conf.j2
    dest: /etc/postgresql/12/main/pg_hba.conf
    owner: postgres
    group: postgres
    mode: '0640'
  notify: Restart PostgreSQL

- name: Ensure PostgreSQL is running and enabled
  service:
    name: postgresql
    state: started
    enabled: yes

handlers:
  - name: Restart PostgreSQL
    service:
      name: postgresql
      state: restarted`
                          : selectedConfigData.id === "ssh-hardening"
                            ? `---
# SSH Hardening Configuration Task
- name: Configure SSH server
  template:
    src: templates/sshd_config.j2
    dest: /etc/ssh/sshd_config
    owner: root
    group: root
    mode: '0600'
  notify: Restart SSH

- name: Ensure SSH service is running and enabled
  service:
    name: ssh
    state: started
    enabled: yes

- name: Disable SSH password authentication
  lineinfile:
    path: /etc/ssh/sshd_config
    regexp: '^#?PasswordAuthentication'
    line: 'PasswordAuthentication no'
  notify: Restart SSH

- name: Disable SSH root login
  lineinfile:
    path: /etc/ssh/sshd_config
    regexp: '^#?PermitRootLogin'
    line: 'PermitRootLogin no'
  notify: Restart SSH

- name: Set SSH idle timeout
  lineinfile:
    path: /etc/ssh/sshd_config
    regexp: '^#?ClientAliveInterval'
    line: 'ClientAliveInterval 300'
  notify: Restart SSH

- name: Set SSH client alive count max
  lineinfile:
    path: /etc/ssh/sshd_config
    regexp: '^#?ClientAliveCountMax'
    line: 'ClientAliveCountMax 2'
  notify: Restart SSH

handlers:
  - name: Restart SSH
    service:
      name: ssh
      state: restarted`
                            : `---
# Configuration Task
- name: Apply configuration
  template:
    src: templates/config.conf.j2
    dest: /etc/service/config.conf
    owner: root
    group: root
    mode: '0644'
  notify: Restart service

- name: Ensure service is running
  service:
    name: service
    state: started
    enabled: yes

handlers:
  - name: Restart service
    service:
      name: service
      state: restarted`}
                    </div>
                  </TabsContent>

                  <TabsContent value="files">
                    <div className="border rounded-md">
                      <div className="p-3 font-medium border-b">Configuration Files</div>
                      <div className="divide-y">
                        {selectedConfigData.id === "nginx-config"
                          ? [
                              { name: "nginx.conf.j2", description: "Main Nginx configuration template" },
                              { name: "vhost.conf.j2", description: "Virtual host configuration template" },
                            ].map((file, i) => (
                              <div key={i} className="p-3 flex items-center justify-between">
                                <div className="flex items-center">
                                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <div>
                                    <div className="font-mono text-sm">{file.name}</div>
                                    <div className="text-xs text-muted-foreground">{file.description}</div>
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm">
                                  View
                                </Button>
                              </div>
                            ))
                          : selectedConfigData.id === "postgres-config"
                            ? [
                                { name: "postgresql.conf.j2", description: "Main PostgreSQL configuration template" },
                                { name: "pg_hba.conf.j2", description: "Client authentication configuration template" },
                              ].map((file, i) => (
                                <div key={i} className="p-3 flex items-center justify-between">
                                  <div className="flex items-center">
                                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <div>
                                      <div className="font-mono text-sm">{file.name}</div>
                                      <div className="text-xs text-muted-foreground">{file.description}</div>
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="sm">
                                    View
                                  </Button>
                                </div>
                              ))
                            : selectedConfigData.id === "ssh-hardening"
                              ? [{ name: "sshd_config.j2", description: "SSH server configuration template" }].map(
                                  (file, i) => (
                                    <div key={i} className="p-3 flex items-center justify-between">
                                      <div className="flex items-center">
                                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <div>
                                          <div className="font-mono text-sm">{file.name}</div>
                                          <div className="text-xs text-muted-foreground">{file.description}</div>
                                        </div>
                                      </div>
                                      <Button variant="ghost" size="sm">
                                        View
                                      </Button>
                                    </div>
                                  ),
                                )
                              : [{ name: "config.conf.j2", description: "Configuration template" }].map((file, i) => (
                                  <div key={i} className="p-3 flex items-center justify-between">
                                    <div className="flex items-center">
                                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                      <div>
                                        <div className="font-mono text-sm">{file.name}</div>
                                        <div className="text-xs text-muted-foreground">{file.description}</div>
                                      </div>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                      View
                                    </Button>
                                  </div>
                                ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="usage">
                    <div className="space-y-4">
                      <div className="bg-muted/50 p-4 rounded-md">
                        <div className="text-sm">
                          <p className="font-medium">Usage Information</p>
                          <p className="mt-2">
                            This configuration has been applied to {selectedConfigData.usageCount} servers.
                          </p>
                          <p className="mt-1">Last modified: {selectedConfigData.lastModified}</p>
                        </div>
                      </div>

                      <div className="border rounded-md">
                        <div className="p-3 font-medium border-b">Recent Applications</div>
                        <div className="divide-y">
                          {[1, 2, 3, 4, 5]
                            .slice(0, selectedConfigData.usageCount > 5 ? 5 : selectedConfigData.usageCount)
                            .map((_, i) => (
                              <div key={i} className="p-3 grid grid-cols-3">
                                <div>Server {i + 1}</div>
                                <div>
                                  10.0.{Math.floor(Math.random() * 10)}.{Math.floor(Math.random() * 100)}
                                </div>
                                <div className="text-muted-foreground">
                                  Applied: 2023-10-{Math.floor(Math.random() * 30) + 1}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Export Configuration</Button>
                <Button>Apply to Server</Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center border rounded-md p-8">
              <div className="text-center">
                <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Configuration Selected</h3>
                <p className="text-muted-foreground">Select a configuration from the list to view its details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

