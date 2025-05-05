"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { ServerInitializationWizard } from "@/components/server-initialization-wizard"
import { CommandExecution } from "@/components/command-execution"
import { ServerHealthCheck } from "@/components/server-health-check"

export default function Home() {
  const [initWizardOpen, setInitWizardOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Server Management</h1>
          <p className="text-muted-foreground">Manage, monitor, and configure your servers</p>
        </div>
        <Button className="gap-2" onClick={() => setInitWizardOpen(true)}>
          <PlusCircle className="h-4 w-4" />
          Initialize New Server
        </Button>
      </div>

      <Tabs defaultValue="commands">
        <TabsList>
          <TabsTrigger value="commands">Commands</TabsTrigger>
          <TabsTrigger value="health">Health Checks</TabsTrigger>
          <TabsTrigger value="servers">Servers</TabsTrigger>
        </TabsList>

        <TabsContent value="commands" className="mt-6">
          <CommandExecution servers={mockServers} />
        </TabsContent>

        <TabsContent value="health" className="mt-6">
          <ServerHealthCheck servers={mockServers} />
        </TabsContent>

        <TabsContent value="servers" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">Server inventory view will be displayed here</div>
        </TabsContent>
      </Tabs>

      <ServerInitializationWizard open={initWizardOpen} onOpenChange={setInitWizardOpen} />
    </div>
  )
}

// Mock data for servers
const mockServers = [
  {
    id: "srv-001",
    name: "web-server-01",
    ip: "192.168.1.101",
    status: "online",
    environment: "Production",
    os: "Ubuntu 22.04 LTS",
  },
  {
    id: "srv-002",
    name: "web-server-02",
    ip: "192.168.1.102",
    status: "online",
    environment: "Production",
    os: "Ubuntu 22.04 LTS",
  },
  {
    id: "srv-003",
    name: "db-server-01",
    ip: "192.168.1.201",
    status: "online",
    environment: "Production",
    os: "Ubuntu 22.04 LTS",
  },
  {
    id: "srv-004",
    name: "cache-server-01",
    ip: "192.168.1.301",
    status: "offline",
    environment: "Production",
    os: "Ubuntu 22.04 LTS",
  },
  {
    id: "srv-005",
    name: "staging-web-01",
    ip: "192.168.2.101",
    status: "online",
    environment: "Staging",
    os: "CentOS 8",
  },
  {
    id: "srv-006",
    name: "staging-db-01",
    ip: "192.168.2.201",
    status: "online",
    environment: "Staging",
    os: "CentOS 8",
  },
  {
    id: "srv-007",
    name: "dev-server-01",
    ip: "192.168.3.101",
    status: "online",
    environment: "Development",
    os: "Debian 11",
  },
]
