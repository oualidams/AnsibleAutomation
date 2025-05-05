"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PlusCircle, MoreHorizontal, Download, Server, Globe, Tag, Folder } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Sample inventory groups
const defaultGroups = [
  {
    id: 1,
    name: "Web Servers",
    description: "Frontend web servers running Nginx",
    servers: 4,
    variables: {
      ansible_user: "webadmin",
      http_port: "80",
      https_port: "443",
    },
  },
  {
    id: 2,
    name: "Database Servers",
    description: "PostgreSQL database servers",
    servers: 2,
    variables: {
      ansible_user: "dbadmin",
      postgresql_version: "14",
      backup_enabled: "true",
    },
  },
  {
    id: 3,
    name: "Load Balancers",
    description: "HAProxy load balancers",
    servers: 2,
    variables: {
      ansible_user: "sysadmin",
      haproxy_stats_port: "8404",
    },
  },
  {
    id: 4,
    name: "Monitoring",
    description: "Prometheus and Grafana servers",
    servers: 1,
    variables: {
      ansible_user: "monitor",
      prometheus_retention: "15d",
    },
  },
]

export function InventoryManager() {
  const [activeTab, setActiveTab] = useState("groups")
  const [groups, setGroups] = useState(defaultGroups)
  const [servers, setServers] = useState<any[]>([])
  const [newGroupDialogOpen, setNewGroupDialogOpen] = useState(false)
  const [newServerDialogOpen, setNewServerDialogOpen] = useState(false)
  const [editGroupDialogOpen, setEditGroupDialogOpen] = useState(false)
  const [editServerDialogOpen, setEditServerDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [selectedServer, setSelectedServer] = useState(null)
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    variables: {},
  })
  const [newServer, setNewServer] = useState({
    name: "",
    ip: "",
    groups: [],
    variables: {
      ansible_host: "",
      ansible_user: "",
    },
  })
  const [variablesText, setVariablesText] = useState("")
  const { toast } = useToast()

  const handleEditGroup = (group) => {
    setSelectedGroup(group)
    setVariablesText(JSON.stringify(group.variables, null, 2))
    setEditGroupDialogOpen(true)
  }

  const handleEditServer = (server) => {
    setSelectedServer(server)
    setVariablesText(JSON.stringify(server.variables, null, 2))
    setEditServerDialogOpen(true)
  }

  const handleSaveGroup = () => {
    if (selectedGroup) {
      try {
        const variables = JSON.parse(variablesText)
        const updatedGroup = { ...selectedGroup, variables }

        setGroups(groups.map((g) => (g.id === selectedGroup.id ? updatedGroup : g)))
        toast({
          title: "Group updated",
          description: `Successfully updated group: ${selectedGroup.name}`,
        })
        setEditGroupDialogOpen(false)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Invalid JSON",
          description: "Please check your variables format",
        })
      }
    }
  }

  const handleSaveServer = () => {
    if (selectedServer) {
      try {
        const variables = JSON.parse(variablesText)
        const updatedServer = { ...selectedServer, variables }

        setServers(servers.map((s) => (s.id === selectedServer.id ? updatedServer : s)))
        toast({
          title: "Server updated",
          description: `Successfully updated server: ${selectedServer.name}`,
        })
        setEditServerDialogOpen(false)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Invalid JSON",
          description: "Please check your variables format",
        })
      }
    }
  }

  const handleCreateGroup = () => {
    if (!newGroup.name) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Group name is required",
      })
      return
    }

    try {
      const variables = variablesText ? JSON.parse(variablesText) : {}
      const newId = Math.max(...groups.map((g) => g.id)) + 1

      setGroups([
        ...groups,
        {
          ...newGroup,
          id: newId,
          servers: 0,
          variables,
        },
      ])

      toast({
        title: "Group created",
        description: `Successfully created group: ${newGroup.name}`,
      })

      setNewGroupDialogOpen(false)
      setNewGroup({
        name: "",
        description: "",
        variables: {},
      })
      setVariablesText("")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Invalid JSON",
        description: "Please check your variables format",
      })
    }
  }

  const handleCreateServer = () => {
    if (!newServer.name || !newServer.ip) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Server name and IP are required",
      })
      return
    }

    try {
      let variables = { ...newServer.variables }
      if (variablesText) {
        variables = JSON.parse(variablesText)
      }

      // Ensure ansible_host is set to the IP if not specified
      if (!variables.ansible_host) {
        variables.ansible_host = newServer.ip
      }

      const newId = Math.max(...servers.map((s) => s.id)) + 1

      setServers([
        ...servers,
        {
          ...newServer,
          id: newId,
          variables,
        },
      ])

      toast({
        title: "Server created",
        description: `Successfully created server: ${newServer.name}`,
      })

      setNewServerDialogOpen(false)
      setNewServer({
        name: "",
        ip: "",
        groups: [],
        variables: {
          ansible_host: "",
          ansible_user: "",
        },
      })
      setVariablesText("")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Invalid JSON",
        description: "Please check your variables format",
      })
    }
  }

  const generateInventoryFile = () => {
    let inventoryContent = "# Ansible Inventory File\n\n"

    // Add groups
    groups.forEach((group) => {
      inventoryContent += `[${group.name}]\n`

      // Add servers in this group
      servers
        .filter((server) => server.groups.includes(group.name))
        .forEach((server) => {
          inventoryContent += `${server.name} ansible_host=${server.variables.ansible_host}\n`
        })

      inventoryContent += "\n"

      // Add group variables
      if (Object.keys(group.variables).length > 0) {
        inventoryContent += `[${group.name}:vars]\n`
        Object.entries(group.variables).forEach(([key, value]) => {
          inventoryContent += `${key}=${value}\n`
        })
        inventoryContent += "\n"
      }
    })

    // Create a blob and download
    const blob = new Blob([inventoryContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "ansible_inventory.ini"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Inventory exported",
      description: "Ansible inventory file has been downloaded",
    })
  }

    const [loading, setLoading] = useState(true)
  
    useEffect(() => {
      fetch("http://localhost:8000/servers/getServers")
        .then((res) => res.json())
        .then((data) => {
          setServers(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }, [])
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl">Inventory Management</CardTitle>
          <CardDescription>Manage Ansible inventory groups and servers</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateInventoryFile} className="gap-2">
            <Download className="h-4 w-4" />
            Export Inventory
          </Button>
          {activeTab === "groups" ? (
            <Button onClick={() => setNewGroupDialogOpen(true)} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Group
            </Button>
          ) : (
            <Button onClick={() => setNewServerDialogOpen(true)} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Server
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="servers">Servers</TabsTrigger>
          </TabsList>

          <TabsContent value="groups">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => (
                <Card key={group.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{group.name}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditGroup(group)}>Edit group</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>View servers</DropdownMenuItem>
                          <DropdownMenuItem>Clone group</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">Delete group</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription className="line-clamp-2 text-xs">{group.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Server className="h-4 w-4 text-muted-foreground" />
                        <span>{group.servers} servers</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span>{Object.keys(group.variables).length} variables</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="servers">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {servers.map((server) => (
                <Card key={server.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{server.name}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditServer(server)}>Edit server</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Run playbook on server</DropdownMenuItem>
                          <DropdownMenuItem>SSH to server</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">Delete server</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription className="text-xs">{server.ip_address}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-sm">
                        <Folder className="h-4 w-4 text-muted-foreground" />
                        <span>{server.project}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                          <Badge key="environment" variant="outline" className="text-xs">
                            {server.environment}
                          </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Create New Group Dialog */}
      <Dialog open={newGroupDialogOpen} onOpenChange={setNewGroupDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Inventory Group</DialogTitle>
            <DialogDescription>Add a new group to your Ansible inventory</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                placeholder="Enter group name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="group-description">Description</Label>
              <Input
                id="group-description"
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                placeholder="Describe this group"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="group-variables">Variables (JSON format)</Label>
              <Textarea
                id="group-variables"
                value={variablesText}
                onChange={(e) => setVariablesText(e.target.value)}
                placeholder='{\n  "ansible_user": "admin",\n  "http_port": "80"\n}'
                className="font-mono text-sm h-40"
              />
              <p className="text-xs text-muted-foreground">
                Enter group variables in JSON format. These will be applied to all servers in this group.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewGroupDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateGroup}>Create Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create New Server Dialog */}
      <Dialog open={newServerDialogOpen} onOpenChange={setNewServerDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Server</DialogTitle>
            <DialogDescription>Add a new server to your Ansible inventory</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="server-name">Server Name</Label>
              <Input
                id="server-name"
                value={newServer.name}
                onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                placeholder="Enter server name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="server-ip">IP Address</Label>
              <Input
                id="server-ip"
                value={newServer.ip}
                onChange={(e) => {
                  setNewServer({
                    ...newServer,
                    ip: e.target.value,
                    variables: {
                      ...newServer.variables,
                      ansible_host: e.target.value,
                    },
                  })
                }}
                placeholder="Enter IP address"
              />
            </div>

            <div className="grid gap-2">
              <Label>Groups</Label>
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                {groups.map((group) => (
                  <div key={group.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`group-${group.id}`}
                      checked={newServer.groups.includes(group.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewServer({
                            ...newServer,
                            groups: [...newServer.groups, group.name],
                          })
                        } else {
                          setNewServer({
                            ...newServer,
                            groups: newServer.groups.filter((g) => g !== group.name),
                          })
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor={`group-${group.id}`} className="text-sm">
                      {group.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="server-variables">Variables (JSON format)</Label>
              <Textarea
                id="server-variables"
                value={variablesText}
                onChange={(e) => setVariablesText(e.target.value)}
                placeholder='{\n  "ansible_host": "192.168.1.100",\n  "ansible_user": "admin"\n}'
                className="font-mono text-sm h-40"
              />
              <p className="text-xs text-muted-foreground">
                Enter server-specific variables in JSON format. These will override group variables.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewServerDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateServer}>Add Server</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={editGroupDialogOpen} onOpenChange={setEditGroupDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>Modify group details and variables</DialogDescription>
          </DialogHeader>

          {selectedGroup && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-group-name">Group Name</Label>
                <Input
                  id="edit-group-name"
                  value={selectedGroup.name}
                  onChange={(e) => setSelectedGroup({ ...selectedGroup, name: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-group-description">Description</Label>
                <Input
                  id="edit-group-description"
                  value={selectedGroup.description}
                  onChange={(e) => setSelectedGroup({ ...selectedGroup, description: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-group-variables">Variables (JSON format)</Label>
                <Textarea
                  id="edit-group-variables"
                  value={variablesText}
                  onChange={(e) => setVariablesText(e.target.value)}
                  className="font-mono text-sm h-40"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditGroupDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveGroup}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Server Dialog */}
      <Dialog open={editServerDialogOpen} onOpenChange={setEditServerDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Server</DialogTitle>
            <DialogDescription>Modify server details and variables</DialogDescription>
          </DialogHeader>

          {selectedServer && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-server-name">Server Name</Label>
                <Input
                  id="edit-server-name"
                  value={selectedServer.name}
                  onChange={(e) => setSelectedServer({ ...selectedServer, name: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-server-ip">IP Address</Label>
                <Input
                  id="edit-server-ip"
                  value={selectedServer.ip}
                  onChange={(e) => setSelectedServer({ ...selectedServer, ip: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label>Groups</Label>
                <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                  {groups.map((group) => (
                    <div key={group.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`edit-group-${group.id}`}
                        checked={selectedServer.groups.includes(group.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedServer({
                              ...selectedServer,
                              groups: [...selectedServer.groups, group.name],
                            })
                          } else {
                            setSelectedServer({
                              ...selectedServer,
                              groups: selectedServer.groups.filter((g) => g !== group.name),
                            })
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor={`edit-group-${group.id}`} className="text-sm">
                        {group.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-server-variables">Variables (JSON format)</Label>
                <Textarea
                  id="edit-server-variables"
                  value={variablesText}
                  onChange={(e) => setVariablesText(e.target.value)}
                  className="font-mono text-sm h-40"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditServerDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveServer}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
