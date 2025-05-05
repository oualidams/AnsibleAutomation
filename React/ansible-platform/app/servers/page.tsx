"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { PlusCircle, Search } from "lucide-react"
import { ServerTable } from "@/components/server-table"
import { ServerInitializationWizard } from "@/components/server-initialization-wizard"

export default function ServersPage() {
  const [addServerModalOpen, setAddServerModalOpen] = useState(false)
  const [servers, setServers] = useState<any[]>([])
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
          {loading ? <div>Loading...</div> : <ServerTable servers={servers} />}
        </TabsContent>

        <TabsContent value="production" className="mt-6">
          <ServerTable servers={servers.filter((s) => s.environment === "production")} />
        </TabsContent>

        <TabsContent value="staging" className="mt-6">
          <ServerTable servers={servers.filter((s) => s.environment === "staging")} />
        </TabsContent>

        <TabsContent value="development" className="mt-6">
          <ServerTable servers={servers.filter((s) => s.environment === "development")} />
        </TabsContent>
      </Tabs>
      <ServerInitializationWizard open={addServerModalOpen} onOpenChange={setAddServerModalOpen} />
    </div>
  )
}
