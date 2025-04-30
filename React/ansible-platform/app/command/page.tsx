"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { ServerInitializationWizard } from "@/components/server-initialization-wizard"
import { CommandExecution } from "@/components/command-execution"
import { ServerHealthCheck } from "@/components/server-health-check"

interface Server {
    id: string
    name: string
    [key: string]: any 
  }

export default function Home() {
  const [initWizardOpen, setInitWizardOpen] = useState(false)
  const [servers, setServers] = useState<Server[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await fetch("http://localhost:8000/servers/getServers")
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`)
        }
        const data = await response.json()
        setServers(data)
      } catch (err: any) {
        setError(err.message || "Failed to fetch servers")
      } finally {
        setLoading(false)
      }
    }

    fetchServers()
  }, [])

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
        </TabsList>

        <TabsContent value="commands" className="mt-6">
          <CommandExecution servers={servers} />
        </TabsContent>

        <TabsContent value="health" className="mt-6">
          <ServerHealthCheck servers={servers} />
        </TabsContent>

        <TabsContent value="servers" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">Server inventory view will be displayed here</div>
        </TabsContent>
      </Tabs>

      <ServerInitializationWizard open={initWizardOpen} onOpenChange={setInitWizardOpen} />
    </div>
  )
}

