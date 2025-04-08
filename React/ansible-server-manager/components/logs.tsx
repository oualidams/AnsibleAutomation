"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Download, RefreshCcw } from "lucide-react"

export default function Logs() {
  const [logs, setLogs] = useState([
    {
      id: "log-001",
      server: "srv-web-01",
      time: "2023-10-25 10:42:15",
      description: "Configuration updated: hostname",
      user: "admin",
      path: "/etc/hostname",
      level: "info",
    },
    {
      id: "log-002",
      server: "srv-web-01",
      time: "2023-10-25 10:40:22",
      description: "Service restarted: nginx",
      user: "system",
      path: "/etc/nginx/nginx.conf",
      level: "info",
    },
    {
      id: "log-003",
      server: "srv-db-01",
      time: "2023-10-25 09:15:30",
      description: "User added: developer",
      user: "admin",
      path: "/etc/passwd",
      level: "info",
    },
    {
      id: "log-004",
      server: "srv-app-01",
      time: "2023-10-25 08:30:45",
      description: "Package installed: postgresql",
      user: "ansible",
      path: "/var/lib/dpkg",
      level: "info",
    },
    {
      id: "log-005",
      server: "srv-storage-01",
      time: "2023-10-24 16:20:10",
      description: "Disk space warning: /var at 85%",
      user: "system",
      path: "/var",
      level: "warning",
    },
    {
      id: "log-006",
      server: "srv-backup-01",
      time: "2023-10-24 14:15:33",
      description: "Backup failed: Permission denied",
      user: "backup",
      path: "/var/backups",
      level: "error",
    },
    {
      id: "log-007",
      server: "srv-web-02",
      time: "2023-10-24 12:10:45",
      description: "System update completed",
      user: "ansible",
      path: "/var/log/apt",
      level: "info",
    },
    {
      id: "log-008",
      server: "srv-db-01",
      time: "2023-10-24 10:05:22",
      description: "Database backup completed",
      user: "postgres",
      path: "/var/lib/postgresql",
      level: "info",
    },
    {
      id: "log-009",
      server: "srv-app-01",
      time: "2023-10-24 08:30:15",
      description: "Failed login attempt: user root",
      user: "system",
      path: "/var/log/auth.log",
      level: "warning",
    },
    {
      id: "log-010",
      server: "srv-web-01",
      time: "2023-10-23 22:45:10",
      description: "Service failed to start: redis",
      user: "system",
      path: "/etc/redis/redis.conf",
      level: "error",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [serverFilter, setServerFilter] = useState<string>("all")
  const [levelFilter, setLevelFilter] = useState<string>("all")
  const [userFilter, setUserFilter] = useState<string>("all")

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "info":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">
            {level}
          </Badge>
        )
      case "warning":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20"
          >
            {level}
          </Badge>
        )
      case "error":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">
            {level}
          </Badge>
        )
      default:
        return <Badge variant="outline">{level}</Badge>
    }
  }

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.server.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.path.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesServer = serverFilter === "all" || log.server === serverFilter
    const matchesLevel = levelFilter === "all" || log.level === levelFilter
    const matchesUser = userFilter === "all" || log.user === userFilter

    return matchesSearch && matchesServer && matchesLevel && matchesUser
  })

  const servers = Array.from(new Set(logs.map((log) => log.server)))
  const users = Array.from(new Set(logs.map((log) => log.user)))

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>System Logs</CardTitle>
            <CardDescription>View and filter logs from all managed servers</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={serverFilter} onValueChange={setServerFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Server" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Servers</SelectItem>
                  {servers.map((server) => (
                    <SelectItem key={server} value={server}>
                      {server}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>

              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="User" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user} value={user}>
                      {user}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-md">
            <div className="grid grid-cols-12 gap-2 p-3 font-medium border-b text-sm">
              <div className="col-span-2">Time</div>
              <div className="col-span-2">Server</div>
              <div className="col-span-4">Description</div>
              <div className="col-span-1">Level</div>
              <div className="col-span-1">User</div>
              <div className="col-span-2">Path</div>
            </div>
            <div className="divide-y">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <div key={log.id} className="grid grid-cols-12 gap-2 p-3 text-sm hover:bg-muted/50">
                    <div className="col-span-2 text-muted-foreground">{log.time}</div>
                    <div className="col-span-2">{log.server}</div>
                    <div className="col-span-4">{log.description}</div>
                    <div className="col-span-1">{getLevelBadge(log.level)}</div>
                    <div className="col-span-1">{log.user}</div>
                    <div className="col-span-2 font-mono text-xs truncate" title={log.path}>
                      {log.path}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">No logs found matching your filters</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

