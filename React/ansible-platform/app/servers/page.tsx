"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { PlusCircle, Search } from "lucide-react"
import { ServerTable } from "@/components/server-table"
import { useState } from "react"
import { AddServerModal } from "@/components/add-server-modal"

export default function ServersPage() {
  const [addServerModalOpen, setAddServerModalOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Servers</h1>
          <p className="text-muted-foreground">Manage your infrastructure and server inventory</p>
        </div>
        <Button className="gap-2" onClick={() => setAddServerModalOpen(true)}>
          <PlusCircle className="h-4 w-4" />
          Add Server
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search servers..." className="pl-8 bg-background" />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Servers</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="staging">Staging</TabsTrigger>
          <TabsTrigger value="development">Development</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <ServerTable servers={servers} />
        </TabsContent>

        <TabsContent value="production" className="mt-6">
          <ServerTable servers={servers.filter((s) => s.environment === "Production")} />
        </TabsContent>

        <TabsContent value="staging" className="mt-6">
          <ServerTable servers={servers.filter((s) => s.environment === "Staging")} />
        </TabsContent>

        <TabsContent value="development" className="mt-6">
          <ServerTable servers={servers.filter((s) => s.environment === "Development")} />
        </TabsContent>
      </Tabs>
      <AddServerModal open={addServerModalOpen} onOpenChange={setAddServerModalOpen} />
    </div>
  )
}

export const servers = [
  {
    id: "srv-001",
    name: "web-server-01",
    ip: "192.168.1.101",
    status: "online",
    environment: "Production",
    os: "Ubuntu 22.04 LTS",
    cpu: "4 cores",
    memory: "16 GB",
    disk: "500 GB SSD",
    lastSeen: "2 minutes ago",
  },
  {
    id: "srv-002",
    name: "web-server-02",
    ip: "192.168.1.102",
    status: "online",
    environment: "Production",
    os: "Ubuntu 22.04 LTS",
    cpu: "4 cores",
    memory: "16 GB",
    disk: "500 GB SSD",
    lastSeen: "5 minutes ago",
  },
  {
    id: "srv-003",
    name: "db-server-01",
    ip: "192.168.1.201",
    status: "online",
    environment: "Production",
    os: "Ubuntu 22.04 LTS",
    cpu: "8 cores",
    memory: "32 GB",
    disk: "1 TB SSD",
    lastSeen: "1 minute ago",
  },
  {
    id: "srv-004",
    name: "cache-server-01",
    ip: "192.168.1.301",
    status: "offline",
    environment: "Production",
    os: "Ubuntu 22.04 LTS",
    cpu: "2 cores",
    memory: "8 GB",
    disk: "250 GB SSD",
    lastSeen: "2 days ago",
  },
  {
    id: "srv-005",
    name: "staging-web-01",
    ip: "192.168.2.101",
    status: "online",
    environment: "Staging",
    os: "Ubuntu 22.04 LTS",
    cpu: "2 cores",
    memory: "8 GB",
    disk: "250 GB SSD",
    lastSeen: "10 minutes ago",
  },
  {
    id: "srv-006",
    name: "staging-db-01",
    ip: "192.168.2.201",
    status: "online",
    environment: "Staging",
    os: "Ubuntu 22.04 LTS",
    cpu: "4 cores",
    memory: "16 GB",
    disk: "500 GB SSD",
    lastSeen: "15 minutes ago",
  },
  {
    id: "srv-007",
    name: "dev-server-01",
    ip: "192.168.3.101",
    status: "online",
    environment: "Development",
    os: "Ubuntu 22.04 LTS",
    cpu: "2 cores",
    memory: "8 GB",
    disk: "250 GB SSD",
    lastSeen: "30 minutes ago",
  },
]
