"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, Filter, Calendar } from "lucide-react"
import { ExecutionTable } from "@/components/execution-table"
import { useEffect, useRef, useState } from "react"

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
  const [search, setSearch] = useState("")
  const [date, setDate] = useState("")
  const [templateNames, setTemplateNames] = useState<{ [key: number]: string }>({});
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch("http://localhost:8000/logs/getLogs")
        if (!response.ok) throw new Error(`Error: ${response.statusText}`)
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

  useEffect(() => {
    const uniqueTemplateIds = Array.from(new Set(logs.map(log => log.template_id)))
    uniqueTemplateIds
      .filter((id) => id !== null && id !== undefined) // Filter out invalid IDs
      .forEach((id) => {
        if (!templateNames[id]) {
          fetch(`http://localhost:8000/templates/getTemplate/${id}`)
            .then(res => {
              if (!res.ok) throw new Error(`Failed to fetch template with ID ${id}`)
              return res.json()
            })
            .then(template => {
              setTemplateNames(prev => ({
                ...prev,
                [id]: template.name,
              }))
            })
            .catch(err => console.error(err.message))
        }
      })
  }, [logs, templateNames])

  const filteredLogs = logs.filter((log) => {
    const templateName = templateNames[log.template_id] || ""
    const searchLower = search.toLowerCase()
    const matchesSearch =
      !search ||
      String(log.template_id).toLowerCase().includes(searchLower) ||
      templateName.toLowerCase().includes(searchLower) ||
      log.server_name.toLowerCase().includes(searchLower) ||
      log.timestamp.slice(0, 10).includes(searchLower)

    const matchesDate = !date || log.timestamp.slice(0, 10) === date
    return matchesSearch && matchesDate
  })

  if (loading) return <div className="text-center mt-10 text-lg font-medium">Loading...</div>
  if (error) return <div className="text-center mt-10 text-red-600 font-medium">Error: {error}</div>

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
          <button
            type="button"
            className="absolute right-7 top-1.5 h-1 w-1 text-muted-foreground"
            onClick={() => dateInputRef.current?.showPicker()}
            aria-label="Pick a date"
            style={{ background: "none", border: "none", padding: 0 }}
          >
            <Calendar />
          </button>

          <input
            ref={dateInputRef}
            type="date"
            onChange={(e) => setDate(e.target.value)}
            style={{
              position: "absolute",
              right: 20,
              top: 8,
              width: 24,
              height: 24,
              opacity: 0,
              cursor: "pointer",
              zIndex: 10,
            }}
          />

          <Input
            type="search"
            placeholder="Search by template, server, or date..."
            className="pl-10 pr-10 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Button variant="outline" onClick={() => { setSearch(""); setDate("") }}>
          <Filter className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="success">Successful</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <ExecutionTable logs={filteredLogs} />
        </TabsContent>

        <TabsContent value="success" className="mt-6">
          <ExecutionTable logs={filteredLogs.filter(log => log.status === "success")} />
        </TabsContent>

        <TabsContent value="failed" className="mt-6">
          <ExecutionTable logs={filteredLogs.filter(log => log.status === "failed")} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
