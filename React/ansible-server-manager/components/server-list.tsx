"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Server, Clock, Settings } from "lucide-react"

export default function ServerList() {
  const [servers, setServers] = useState([
    {
      id: "srv-web-01",
      name: "Web Server 01",
      status: "online",
      uptime: "45d 12h",
      os: "Ubuntu 22.04",
      ip: "10.0.1.10",
      hostname: "web-01.example.com",
      domain: "example.com",
      machineId: "a1b2c3d4e5f6",
      lastConfigured: "2023-10-15 08:30:22",
    },
    {
      id: "srv-web-02",
      name: "Web Server 02",
      status: "online",
      uptime: "30d 8h",
      os: "Ubuntu 22.04",
      ip: "10.0.1.11",
      hostname: "web-02.example.com",
      domain: "example.com",
      machineId: "f6e5d4c3b2a1",
      lastConfigured: "2023-10-20 14:15:10",
    },
    {
      id: "srv-db-01",
      name: "Database Server 01",
      status: "online",
      uptime: "60d 3h",
      os: "CentOS 8",
      ip: "10.0.2.10",
      hostname: "db-01.example.com",
      domain: "example.com",
      machineId: "1a2b3c4d5e6f",
      lastConfigured: "2023-09-05 10:45:33",
    },
    {
      id: "srv-app-01",
      name: "Application Server 01",
      status: "warning",
      uptime: "15d 22h",
      os: "Debian 11",
      ip: "10.0.3.10",
      hostname: "app-01.example.com",
      domain: "example.com",
      machineId: "6f5e4d3c2b1a",
      lastConfigured: "2023-10-25 16:20:45",
    },
    {
      id: "srv-storage-01",
      name: "Storage Server 01",
      status: "online",
      uptime: "90d 5h",
      os: "Ubuntu 20.04",
      ip: "10.0.4.10",
      hostname: "storage-01.example.com",
      domain: "example.com",
      machineId: "2b3c4d5e6f1a",
      lastConfigured: "2023-08-12 09:10:18",
    },
    {
      id: "srv-backup-01",
      name: "Backup Server 01",
      status: "offline",
      uptime: "0d 0h",
      os: "CentOS 7",
      ip: "10.0.5.10",
      hostname: "backup-01.example.com",
      domain: "example.com",
      machineId: "5e6f1a2b3c4d",
      lastConfigured: "2023-10-01 22:05:40",
    },
  ])

  const [selectedServer, setSelectedServer] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500 text-green-50"
      case "warning":
        return "bg-yellow-500 text-yellow-50"
      case "offline":
        return "bg-red-500 text-red-50"
      default:
        return "bg-gray-500 text-gray-50"
    }
  }

  const filteredServers = servers.filter(
    (server) =>
      server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.ip.includes(searchTerm) ||
      server.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.os.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const selectedServerData = servers.find((server) => server.id === selectedServer)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search servers..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="border rounded-md">
          {filteredServers.length > 0 ? (
            <div className="divide-y">
              {filteredServers.map((server) => (
                <div
                  key={server.id}
                  className={`p-3 cursor-pointer hover:bg-muted/50 ${selectedServer === server.id ? "bg-muted" : ""}`}
                  onClick={() => setSelectedServer(server.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{server.name}</div>
                    <Badge variant="outline" className={getStatusColor(server.status)}>
                      {server.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {server.ip} • {server.os}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">No servers found</div>
          )}
        </div>
      </div>

      <div className="md:col-span-2">
        {selectedServerData ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{selectedServerData.name}</CardTitle>
                <CardDescription>{selectedServerData.hostname}</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
                <Button size="sm">Run Playbook</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="info">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="info">Information</TabsTrigger>
                  <TabsTrigger value="storage">Storage</TabsTrigger>
                  <TabsTrigger value="network">Network</TabsTrigger>
                  <TabsTrigger value="logs">Logs</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Status</div>
                      <div className="flex items-center">
                        <div
                          className={`h-2 w-2 rounded-full mr-2 ${selectedServerData.status === "online" ? "bg-green-500" : selectedServerData.status === "warning" ? "bg-yellow-500" : "bg-red-500"}`}
                        />
                        <span className="capitalize">{selectedServerData.status}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-medium">Uptime</div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        {selectedServerData.uptime}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-medium">Operating System</div>
                      <div>{selectedServerData.os}</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-medium">IP Address</div>
                      <div>{selectedServerData.ip}</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-medium">Hostname</div>
                      <div>{selectedServerData.hostname}</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-medium">Domain</div>
                      <div>{selectedServerData.domain}</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-medium">Machine ID</div>
                      <div>{selectedServerData.machineId}</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-medium">Last Configured</div>
                      <div>{selectedServerData.lastConfigured}</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="storage">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <div className="font-medium">Disk Usage</div>
                        <div>120GB / 500GB (24%)</div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: "24%" }}></div>
                      </div>
                    </div>

                    <div className="border rounded-md">
                      <div className="p-3 font-medium border-b">Mount Points</div>
                      <div className="divide-y">
                        <div className="p-3 grid grid-cols-4">
                          <div>/ (root)</div>
                          <div>80GB / 200GB</div>
                          <div>ext4</div>
                          <div>40%</div>
                        </div>
                        <div className="p-3 grid grid-cols-4">
                          <div>/var</div>
                          <div>30GB / 100GB</div>
                          <div>ext4</div>
                          <div>30%</div>
                        </div>
                        <div className="p-3 grid grid-cols-4">
                          <div>/home</div>
                          <div>10GB / 200GB</div>
                          <div>ext4</div>
                          <div>5%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="network">
                  <div className="space-y-4">
                    <div className="border rounded-md">
                      <div className="p-3 font-medium border-b">Network Interfaces</div>
                      <div className="divide-y">
                        <div className="p-3 grid grid-cols-3">
                          <div>eth0</div>
                          <div>{selectedServerData.ip}/24</div>
                          <div>1000Mbps</div>
                        </div>
                        <div className="p-3 grid grid-cols-3">
                          <div>lo</div>
                          <div>127.0.0.1/8</div>
                          <div>-</div>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-md">
                      <div className="p-3 font-medium border-b">Network Traffic</div>
                      <div className="p-3 grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="text-sm">Inbound</div>
                          <div className="text-xl font-bold">245 MB/s</div>
                          <div className="text-xs text-muted-foreground">Peak: 320 MB/s at 14:30</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm">Outbound</div>
                          <div className="text-xl font-bold">120 MB/s</div>
                          <div className="text-xs text-muted-foreground">Peak: 180 MB/s at 14:30</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="logs">
                  <div className="border rounded-md">
                    <div className="p-3 font-medium border-b flex justify-between items-center">
                      <div>Recent Logs</div>
                      <Button variant="outline" size="sm">
                        View All
                      </Button>
                    </div>
                    <div className="divide-y">
                      {[
                        {
                          time: "10:42:15",
                          description: "Configuration updated: hostname",
                          user: "admin",
                          path: "/etc/hostname",
                        },
                        {
                          time: "10:40:22",
                          description: "Service restarted: nginx",
                          user: "system",
                          path: "/etc/nginx/nginx.conf",
                        },
                        { time: "09:15:30", description: "User added: developer", user: "admin", path: "/etc/passwd" },
                        {
                          time: "08:30:45",
                          description: "Package installed: postgresql",
                          user: "ansible",
                          path: "/var/lib/dpkg",
                        },
                        {
                          time: "Yesterday",
                          description: "System update completed",
                          user: "ansible",
                          path: "/var/log/apt",
                        },
                      ].map((log, i) => (
                        <div key={i} className="p-3">
                          <div className="flex justify-between">
                            <div className="font-medium">{log.description}</div>
                            <div className="text-sm text-muted-foreground">{log.time}</div>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1 flex justify-between">
                            <div>User: {log.user}</div>
                            <div>Path: {log.path}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <div className="h-full flex items-center justify-center border rounded-md p-8">
            <div className="text-center">
              <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Server Selected</h3>
              <p className="text-muted-foreground">Select a server from the list to view its details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

