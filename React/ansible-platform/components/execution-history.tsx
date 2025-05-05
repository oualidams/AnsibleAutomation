"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import {
  Search,
  Filter,
  MoreVertical,
  Calendar,
  Server,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  FileText,
  Download,
  ChevronRight,
  ChevronDown,
} from "lucide-react"

// Mock data for execution history
const MOCK_EXECUTIONS = [
  {
    id: "exec-001",
    type: "command",
    name: "System Update",
    command: "apt-get update && apt-get upgrade -y",
    servers: [
      { id: "srv-001", name: "web-server-1", status: "success", duration: "45s" },
      { id: "srv-002", name: "web-server-2", status: "success", duration: "52s" },
      { id: "srv-003", name: "db-server-1", status: "failed", duration: "23s" },
    ],
    user: "admin",
    timestamp: "2023-04-15T14:30:00Z",
    status: "partial",
  },
  {
    id: "exec-002",
    type: "initialization",
    name: "New Web Server Setup",
    template: "LAMP Stack",
    servers: [{ id: "srv-004", name: "web-server-3", status: "success", duration: "5m 12s" }],
    user: "admin",
    timestamp: "2023-04-14T10:15:00Z",
    status: "success",
  },
  {
    id: "exec-003",
    type: "health-check",
    name: "Monthly Security Audit",
    checks: ["disk", "memory", "security", "updates"],
    servers: [
      { id: "srv-001", name: "web-server-1", status: "success", duration: "1m 30s" },
      { id: "srv-002", name: "web-server-2", status: "warning", duration: "1m 45s" },
      { id: "srv-003", name: "db-server-1", status: "success", duration: "1m 38s" },
      { id: "srv-004", name: "web-server-3", status: "success", duration: "1m 42s" },
    ],
    user: "security-admin",
    timestamp: "2023-04-10T09:00:00Z",
    status: "warning",
  },
  {
    id: "exec-004",
    type: "command",
    name: "Restart Nginx",
    command: "systemctl restart nginx",
    servers: [
      { id: "srv-001", name: "web-server-1", status: "success", duration: "3s" },
      { id: "srv-002", name: "web-server-2", status: "success", duration: "3s" },
      { id: "srv-004", name: "web-server-3", status: "success", duration: "3s" },
    ],
    user: "admin",
    timestamp: "2023-04-08T16:45:00Z",
    status: "success",
  },
  {
    id: "exec-005",
    type: "initialization",
    name: "Database Server Setup",
    template: "PostgreSQL",
    servers: [{ id: "srv-005", name: "db-server-2", status: "success", duration: "6m 20s" }],
    user: "db-admin",
    timestamp: "2023-04-05T11:30:00Z",
    status: "success",
  },
  {
    id: "exec-006",
    type: "health-check",
    name: "Weekly Performance Check",
    checks: ["cpu", "memory", "disk", "processes"],
    servers: [
      { id: "srv-001", name: "web-server-1", status: "warning", duration: "1m 10s" },
      { id: "srv-002", name: "web-server-2", status: "success", duration: "1m 05s" },
      { id: "srv-003", name: "db-server-1", status: "success", duration: "1m 12s" },
    ],
    user: "admin",
    timestamp: "2023-04-03T08:00:00Z",
    status: "warning",
  },
]

// Mock data for server-specific execution details
const MOCK_SERVER_DETAILS = {
  "srv-001": [
    {
      executionId: "exec-001",
      type: "command",
      name: "System Update",
      command: "apt-get update && apt-get upgrade -y",
      status: "success",
      output:
        "Reading package lists... Done\nBuilding dependency tree... Done\nReading state information... Done\nCalculating upgrade... Done\n0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.",
      startTime: "2023-04-15T14:30:00Z",
      endTime: "2023-04-15T14:30:45Z",
      duration: "45s",
    },
    {
      executionId: "exec-003",
      type: "health-check",
      name: "Monthly Security Audit",
      checks: [
        { name: "disk", status: "success", message: "All filesystems have sufficient space." },
        { name: "memory", status: "success", message: "Memory usage is normal (45%)." },
        { name: "security", status: "success", message: "No security vulnerabilities detected." },
        { name: "updates", status: "success", message: "System is up to date." },
      ],
      status: "success",
      startTime: "2023-04-10T09:00:00Z",
      endTime: "2023-04-10T09:01:30Z",
      duration: "1m 30s",
    },
    {
      executionId: "exec-004",
      type: "command",
      name: "Restart Nginx",
      command: "systemctl restart nginx",
      status: "success",
      output:
        "● nginx.service - A high performance web server and a reverse proxy server\n   Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)\n   Active: active (running) since Sat 2023-04-08 16:45:03 UTC; 0s ago\n     Docs: man:nginx(8)",
      startTime: "2023-04-08T16:45:00Z",
      endTime: "2023-04-08T16:45:03Z",
      duration: "3s",
    },
    {
      executionId: "exec-006",
      type: "health-check",
      name: "Weekly Performance Check",
      checks: [
        { name: "cpu", status: "success", message: "CPU load is normal." },
        { name: "memory", status: "warning", message: "Memory usage is high (82%)." },
        { name: "disk", status: "success", message: "All filesystems have sufficient space." },
        { name: "processes", status: "success", message: "No resource-intensive processes detected." },
      ],
      status: "warning",
      startTime: "2023-04-03T08:00:00Z",
      endTime: "2023-04-03T08:01:10Z",
      duration: "1m 10s",
    },
  ],
  "srv-003": [
    {
      executionId: "exec-001",
      type: "command",
      name: "System Update",
      command: "apt-get update && apt-get upgrade -y",
      status: "failed",
      output:
        "Reading package lists... Done\nBuilding dependency tree... Done\nReading state information... Done\nE: Could not get lock /var/lib/dpkg/lock-frontend. It is held by process 1234 (apt-get)\nE: Unable to acquire the dpkg frontend lock (/var/lib/dpkg/lock-frontend), is another process using it?",
      startTime: "2023-04-15T14:30:00Z",
      endTime: "2023-04-15T14:30:23Z",
      duration: "23s",
    },
    {
      executionId: "exec-003",
      type: "health-check",
      name: "Monthly Security Audit",
      checks: [
        { name: "disk", status: "success", message: "All filesystems have sufficient space." },
        { name: "memory", status: "success", message: "Memory usage is normal (38%)." },
        { name: "security", status: "success", message: "No security vulnerabilities detected." },
        { name: "updates", status: "success", message: "System is up to date." },
      ],
      status: "success",
      startTime: "2023-04-10T09:00:00Z",
      endTime: "2023-04-10T09:01:38Z",
      duration: "1m 38s",
    },
    {
      executionId: "exec-006",
      type: "health-check",
      name: "Weekly Performance Check",
      checks: [
        { name: "cpu", status: "success", message: "CPU load is normal." },
        { name: "memory", status: "success", message: "Memory usage is normal (45%)." },
        { name: "disk", status: "success", message: "All filesystems have sufficient space." },
        { name: "processes", status: "success", message: "No resource-intensive processes detected." },
      ],
      status: "success",
      startTime: "2023-04-03T08:00:00Z",
      endTime: "2023-04-03T08:01:12Z",
      duration: "1m 12s",
    },
  ],
}

export function ExecutionHistory() {
  const [executions, setExecutions] = useState(MOCK_EXECUTIONS)
  const [filteredExecutions, setFilteredExecutions] = useState(MOCK_EXECUTIONS)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterServer, setFilterServer] = useState("")
  const [filterDateFrom, setFilterDateFrom] = useState("")
  const [filterDateTo, setFilterDateTo] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedExecution, setSelectedExecution] = useState(null)
  const [selectedServer, setSelectedServer] = useState(null)
  const [serverExecutions, setServerExecutions] = useState([])
  const [executionDetailsOpen, setExecutionDetailsOpen] = useState(false)
  const [serverDetailsOpen, setServerDetailsOpen] = useState(false)
  const [expandedRows, setExpandedRows] = useState<string[]>([])

  const { toast } = useToast()

  // Load executions (would fetch from API in a real app)
  useEffect(() => {
    // In a real app, fetch from API
    setExecutions(MOCK_EXECUTIONS)
    setFilteredExecutions(MOCK_EXECUTIONS)
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...executions]

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (exec) =>
          exec.name.toLowerCase().includes(term) ||
          exec.user.toLowerCase().includes(term) ||
          (exec.command && exec.command.toLowerCase().includes(term)) ||
          (exec.template && exec.template.toLowerCase().includes(term)) ||
          exec.servers.some((server) => server.name.toLowerCase().includes(term)),
      )
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter((exec) => exec.type === filterType)
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((exec) => exec.status === filterStatus)
    }

    // Apply server filter
    if (filterServer) {
      filtered = filtered.filter((exec) =>
        exec.servers.some((server) => server.id === filterServer || server.name === filterServer),
      )
    }

    // Apply date range filter
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom)
      filtered = filtered.filter((exec) => new Date(exec.timestamp) >= fromDate)
    }

    if (filterDateTo) {
      const toDate = new Date(filterDateTo)
      toDate.setHours(23, 59, 59, 999) // End of day
      filtered = filtered.filter((exec) => new Date(exec.timestamp) <= toDate)
    }

    setFilteredExecutions(filtered)
  }, [executions, searchTerm, filterType, filterStatus, filterServer, filterDateFrom, filterDateTo])

  // Handle row expansion
  const toggleRowExpansion = (executionId: string) => {
    setExpandedRows((prev) => {
      if (prev.includes(executionId)) {
        return prev.filter((id) => id !== executionId)
      } else {
        return [...prev, executionId]
      }
    })
  }

  // Handle execution details
  const handleViewExecutionDetails = (execution) => {
    setSelectedExecution(execution)
    setExecutionDetailsOpen(true)
  }

  // Handle server details
  const handleViewServerDetails = (execution, serverId) => {
    const server = execution.servers.find((s) => s.id === serverId)
    setSelectedExecution(execution)
    setSelectedServer(server)

    // In a real app, fetch server-specific execution details from API
    // For now, use mock data
    if (MOCK_SERVER_DETAILS[serverId]) {
      const executionDetail = MOCK_SERVER_DETAILS[serverId].find((detail) => detail.executionId === execution.id)
      if (executionDetail) {
        setServerExecutions([executionDetail])
      } else {
        setServerExecutions([])
      }
    } else {
      setServerExecutions([])
    }

    setServerDetailsOpen(true)
  }

  // Handle rerun execution
  const handleRerunExecution = (execution) => {
    toast({
      title: "Execution Scheduled",
      description: `Rerunning "${execution.name}" on ${execution.servers.length} servers.`,
    })
  }

  // Handle download logs
  const handleDownloadLogs = (execution) => {
    toast({
      title: "Logs Downloaded",
      description: `Logs for "${execution.name}" have been downloaded.`,
    })
  }

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-500">
            Success
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive" className="bg-red-500">
            Failed
          </Badge>
        )
      case "warning":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            Warning
          </Badge>
        )
      case "partial":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            Partial Success
          </Badge>
        )
      case "running":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            Running
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="border-gray-500 text-gray-500">
            Unknown
          </Badge>
        )
    }
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "partial":
        return <AlertTriangle className="h-4 w-4 text-blue-500" />
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case "command":
        return <FileText className="h-4 w-4" />
      case "initialization":
        return <Server className="h-4 w-4" />
      case "health-check":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Get all unique servers for filter
  const getAllServers = () => {
    const servers = new Set()
    executions.forEach((exec) => {
      exec.servers.forEach((server) => {
        servers.add(server.id)
      })
    })
    return Array.from(servers)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Execution History</CardTitle>
          <CardDescription>View and manage all server operations and their results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            {/* Search and filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search executions..."
                  className="pl-8 bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {(filterType !== "all" || filterStatus !== "all" || filterServer || filterDateFrom || filterDateTo) && (
                  <Badge variant="secondary" className="ml-2">
                    Active
                  </Badge>
                )}
              </Button>
            </div>

            {/* Advanced filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-md">
                <div className="space-y-2">
                  <Label htmlFor="filter-type">Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger id="filter-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="command">Command</SelectItem>
                      <SelectItem value="initialization">Initialization</SelectItem>
                      <SelectItem value="health-check">Health Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filter-status">Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger id="filter-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="partial">Partial Success</SelectItem>
                      <SelectItem value="running">Running</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filter-server">Server</Label>
                  <Select value={filterServer} onValueChange={setFilterServer}>
                    <SelectTrigger id="filter-server">
                      <SelectValue placeholder="Select server" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Servers</SelectItem>
                      {executions
                        .flatMap((exec) => exec.servers)
                        .map((server) => (
                          <SelectItem key={server.id} value={server.id}>
                            {server.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filter-date-from">Date Range</Label>
                  <div className="flex gap-2">
                    <Input
                      id="filter-date-from"
                      type="date"
                      value={filterDateFrom}
                      onChange={(e) => setFilterDateFrom(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      id="filter-date-to"
                      type="date"
                      value={filterDateTo}
                      onChange={(e) => setFilterDateTo(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="col-span-full flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilterType("all")
                      setFilterStatus("all")
                      setFilterServer("")
                      setFilterDateFrom("")
                      setFilterDateTo("")
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}

            {/* Execution table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Servers</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExecutions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                        No executions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExecutions.map((execution) => (
                      <>
                        <TableRow key={execution.id} className="group">
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleRowExpansion(execution.id)}
                              className="h-6 w-6"
                            >
                              {expandedRows.includes(execution.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium">{execution.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(execution.type)}
                              <span className="capitalize">{execution.type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Server className="h-4 w-4 text-muted-foreground" />
                              <span>{execution.servers.length}</span>
                            </div>
                          </TableCell>
                          <TableCell>{execution.user}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{formatDate(execution.timestamp)}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(execution.status)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewExecutionDetails(execution)}>
                                  View details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRerunExecution(execution)}>
                                  Rerun execution
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadLogs(execution)}>
                                  Download logs
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>

                        {/* Expanded row with server details */}
                        {expandedRows.includes(execution.id) && (
                          <TableRow className="bg-muted/50">
                            <TableCell colSpan={8} className="p-0">
                              <div className="p-4">
                                <h4 className="font-medium mb-2">Server Details</h4>
                                <div className="rounded-md border overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Server</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead className="w-10"></TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {execution.servers.map((server) => (
                                        <TableRow key={server.id}>
                                          <TableCell className="font-medium">{server.name}</TableCell>
                                          <TableCell>
                                            <div className="flex items-center gap-2">
                                              {getStatusIcon(server.status)}
                                              <span className="capitalize">{server.status}</span>
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            <div className="flex items-center gap-1">
                                              <Clock className="h-4 w-4 text-muted-foreground" />
                                              <span>{server.duration}</span>
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleViewServerDetails(execution, server.id)}
                                            >
                                              Details
                                            </Button>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>

                                {/* Command or template details */}
                                {execution.type === "command" && (
                                  <div className="mt-4">
                                    <h4 className="font-medium mb-2">Command</h4>
                                    <pre className="bg-muted p-2 rounded-md text-xs overflow-x-auto">
                                      {execution.command}
                                    </pre>
                                  </div>
                                )}

                                {execution.type === "initialization" && (
                                  <div className="mt-4">
                                    <h4 className="font-medium mb-2">Template</h4>
                                    <div className="bg-muted p-2 rounded-md text-sm">{execution.template}</div>
                                  </div>
                                )}

                                {execution.type === "health-check" && (
                                  <div className="mt-4">
                                    <h4 className="font-medium mb-2">Checks</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {execution.checks.map((check) => (
                                        <Badge key={check} variant="outline">
                                          {check}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Execution Details Dialog */}
      <Dialog open={executionDetailsOpen} onOpenChange={setExecutionDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Execution Details</DialogTitle>
            <DialogDescription>
              {selectedExecution?.type === "command"
                ? "Command execution details"
                : selectedExecution?.type === "initialization"
                  ? "Server initialization details"
                  : "Health check details"}
            </DialogDescription>
          </DialogHeader>

          {selectedExecution && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                  <p>{selectedExecution.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                  <p className="capitalize">{selectedExecution.type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">User</h3>
                  <p>{selectedExecution.user}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Timestamp</h3>
                  <p>{formatDate(selectedExecution.timestamp)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedExecution.status)}
                    <span className="capitalize">{selectedExecution.status}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Servers</h3>
                  <p>{selectedExecution.servers.length} servers</p>
                </div>
              </div>

              {selectedExecution.type === "command" && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Command</h3>
                  <pre className="mt-1 bg-muted p-2 rounded-md text-xs overflow-x-auto">
                    {selectedExecution.command}
                  </pre>
                </div>
              )}

              {selectedExecution.type === "initialization" && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Template</h3>
                  <p className="mt-1">{selectedExecution.template}</p>
                </div>
              )}

              {selectedExecution.type === "health-check" && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Checks</h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {selectedExecution.checks.map((check) => (
                      <Badge key={check} variant="outline">
                        {check}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Server Results</h3>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Server</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedExecution.servers.map((server) => (
                        <TableRow key={server.id}>
                          <TableCell className="font-medium">{server.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(server.status)}
                              <span className="capitalize">{server.status}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{server.duration}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setExecutionDetailsOpen(false)
                                handleViewServerDetails(selectedExecution, server.id)
                              }}
                            >
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleDownloadLogs(selectedExecution)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Logs
                </Button>
                <Button onClick={() => handleRerunExecution(selectedExecution)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Rerun Execution
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Server-specific Execution Details Dialog */}
      <Dialog open={serverDetailsOpen} onOpenChange={setServerDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Server Execution Details</DialogTitle>
            <DialogDescription>
              {selectedServer?.name} - {selectedExecution?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedServer && serverExecutions.length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Server</h3>
                  <p>{selectedServer.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedServer.status)}
                    <span className="capitalize">{selectedServer.status}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Start Time</h3>
                  <p>{formatDate(serverExecutions[0].startTime)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">End Time</h3>
                  <p>{formatDate(serverExecutions[0].endTime)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Duration</h3>
                  <p>{serverExecutions[0].duration}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Execution Type</h3>
                  <p className="capitalize">{serverExecutions[0].type}</p>
                </div>
              </div>

              {serverExecutions[0].type === "command" && (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Command</h3>
                    <pre className="mt-1 bg-muted p-2 rounded-md text-xs overflow-x-auto">
                      {serverExecutions[0].command}
                    </pre>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Output</h3>
                    <ScrollArea className="h-64 mt-1">
                      <pre className="bg-muted p-2 rounded-md text-xs whitespace-pre-wrap">
                        {serverExecutions[0].output}
                      </pre>
                    </ScrollArea>
                  </div>
                </>
              )}

              {serverExecutions[0].type === "health-check" && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Check Results</h3>
                  <div className="space-y-2">
                    {serverExecutions[0].checks.map((check) => (
                      <div key={check.name} className="bg-muted p-3 rounded-md">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(check.status)}
                          <span className="font-medium">{check.name}</span>
                        </div>
                        <p className="mt-1 text-sm">{check.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setServerDetailsOpen(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    toast({
                      title: "Command Scheduled",
                      description: `Rerunning "${selectedExecution.name}" on ${selectedServer.name}.`,
                    })
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Rerun on this Server
                </Button>
              </div>
            </div>
          )}

          {(!selectedServer || serverExecutions.length === 0) && (
            <div className="py-4 text-center text-muted-foreground">No execution details available</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
