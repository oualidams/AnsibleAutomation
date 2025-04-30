"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"
import { ExecutionTable } from "@/components/execution-table"
import { useEffect, useState } from "react"

interface Log {
  id: number
  template_id: number
  server_name: string
  log_content: string
  timestamp: string 
  status: "success" | "failed" 
}

export default function ExecutionsPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch("http://localhost:8000/logs/getLogs")
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`)
        }
        const data = await response.json()
        setLogs(data)
      } catch (err: any) {
        setError(err.message || "Failed to fetch logs")
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Playbook Executions</h1>
          <p className="text-muted-foreground">View and manage your Ansible playbook execution history</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search executions..." className="pl-8 bg-background" />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <Tabs defaultValue="all" onValueChange={(value) => console.log(value)}>
        <TabsList>
          <TabsTrigger value="all">All Executions</TabsTrigger>
          <TabsTrigger value="success">Successful</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <ExecutionTable logs={logs} />
        </TabsContent>

        <TabsContent value="success" className="mt-6">
          <ExecutionTable logs={logs.filter((log) => log.status === "success")} />
        </TabsContent>

        <TabsContent value="failed" className="mt-6">
          <ExecutionTable logs={logs.filter((log) => log.status === "failed")} />
        </TabsContent>
      </Tabs>
    </div>
  )
}