import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"
import { ExecutionTable } from "@/components/execution-table"

export default function ExecutionsPage() {
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

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Executions</TabsTrigger>
          <TabsTrigger value="success">Successful</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <ExecutionTable executions={executions} />
        </TabsContent>

        <TabsContent value="success" className="mt-6">
          <ExecutionTable executions={executions.filter((e) => e.status === "success")} />
        </TabsContent>

        <TabsContent value="failed" className="mt-6">
          <ExecutionTable executions={executions.filter((e) => e.status === "failed")} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export const executions = [
  {
    id: "exec-001",
    playbook: "Web Server Setup",
    target: "web-server-01",
    user: "john.doe",
    startTime: "2023-06-15 14:32:45",
    duration: "2m 15s",
    status: "success",
    tasks: {
      total: 12,
      success: 12,
      failed: 0,
      skipped: 0,
    },
  },
  {
    id: "exec-002",
    playbook: "Database Backup",
    target: "db-server-01",
    user: "system",
    startTime: "2023-06-15 12:00:00",
    duration: "1m 45s",
    status: "success",
    tasks: {
      total: 8,
      success: 8,
      failed: 0,
      skipped: 0,
    },
  },
  {
    id: "exec-003",
    playbook: "Security Updates",
    target: "all",
    user: "jane.smith",
    startTime: "2023-06-14 18:15:22",
    duration: "15m 30s",
    status: "failed",
    tasks: {
      total: 24,
      success: 20,
      failed: 4,
      skipped: 0,
    },
  },
  {
    id: "exec-004",
    playbook: "Web Server Setup",
    target: "web-server-02",
    user: "john.doe",
    startTime: "2023-06-14 15:10:33",
    duration: "2m 10s",
    status: "success",
    tasks: {
      total: 12,
      success: 12,
      failed: 0,
      skipped: 0,
    },
  },
  {
    id: "exec-005",
    playbook: "Monitoring Setup",
    target: "monitoring-server-01",
    user: "jane.smith",
    startTime: "2023-06-13 11:22:45",
    duration: "5m 12s",
    status: "success",
    tasks: {
      total: 18,
      success: 17,
      failed: 0,
      skipped: 1,
    },
  },
  {
    id: "exec-006",
    playbook: "Docker Deployment",
    target: "app-server-01",
    user: "mike.johnson",
    startTime: "2023-06-12 09:45:12",
    duration: "3m 55s",
    status: "failed",
    tasks: {
      total: 10,
      success: 7,
      failed: 3,
      skipped: 0,
    },
  },
]

