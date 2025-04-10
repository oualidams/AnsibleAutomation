"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HardDrive,
  Cpu,
  MemoryStickIcon as Memory,
  Network,
  Shield,
  Clock,
  RefreshCw,
} from "lucide-react"
import { useWebSocket } from "@/contexts/websocket-context"

// Health check types
const HEALTH_CHECKS = {
  basic: {
    name: "Basic Health Check",
    description: "Check disk space, CPU load, memory usage, and network connectivity",
    checks: ["disk", "cpu", "memory", "network"],
  },
  security: {
    name: "Security Audit",
    description: "Check for security vulnerabilities, open ports, and outdated packages",
    checks: ["updates", "firewall", "rootkit", "ports"],
  },
  performance: {
    name: "Performance Analysis",
    description: "Analyze system performance, identify bottlenecks, and check for resource-intensive processes",
    checks: ["io", "processes", "load", "network_perf"],
  },
  custom: {
    name: "Custom Health Check",
    description: "Select specific checks to run on your servers",
    checks: [],
  },
}

// Individual checks
const AVAILABLE_CHECKS = {
  disk: {
    name: "Disk Space",
    icon: <HardDrive className="h-4 w-4" />,
    description: "Check available disk space on all mounted filesystems",
  },
  cpu: {
    name: "CPU Load",
    icon: <Cpu className="h-4 w-4" />,
    description: "Check current CPU load and utilization",
  },
  memory: {
    name: "Memory Usage",
    icon: <Memory className="h-4 w-4" />,
    description: "Check available memory and swap usage",
  },
  network: {
    name: "Network Connectivity",
    icon: <Network className="h-4 w-4" />,
    description: "Check network connectivity and DNS resolution",
  },
  updates: {
    name: "System Updates",
    icon: <RefreshCw className="h-4 w-4" />,
    description: "Check for available system updates",
  },
  firewall: {
    name: "Firewall Status",
    icon: <Shield className="h-4 w-4" />,
    description: "Check firewall status and rules",
  },
  rootkit: {
    name: "Rootkit Detection",
    icon: <Shield className="h-4 w-4" />,
    description: "Scan for potential rootkits and malware",
  },
  ports: {
    name: "Open Ports",
    icon: <Network className="h-4 w-4" />,
    description: "Scan for open ports and listening services",
  },
  io: {
    name: "Disk I/O",
    icon: <HardDrive className="h-4 w-4" />,
    description: "Check disk I/O performance",
  },
  processes: {
    name: "Process Analysis",
    icon: <Cpu className="h-4 w-4" />,
    description: "Identify resource-intensive processes",
  },
  load: {
    name: "System Load",
    icon: <Cpu className="h-4 w-4" />,
    description: "Analyze system load over time",
  },
  network_perf: {
    name: "Network Performance",
    icon: <Network className="h-4 w-4" />,
    description: "Test network throughput and latency",
  },
}

export function ServerHealthCheck({ servers }) {
  const [selectedServers, setSelectedServers] = useState<string[]>([])
  const [selectedChecks, setSelectedChecks] = useState<string[]>([])
  const [checkType, setCheckType] = useState("basic")
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<
    Record<string, Record<string, { status: "success" | "warning" | "error" | "running"; message: string }>>
  >({})

  const { toast } = useToast()
  const { sendMessage, lastMessage, mockMode } = useWebSocket()

  // Handle server selection
  const handleServerSelection = (serverId: string) => {
    setSelectedServers((prev) => {
      if (prev.includes(serverId)) {
        return prev.filter((id) => id !== serverId)
      } else {
        return [...prev, serverId]
      }
    })
  }

  // Handle select all servers
  const handleSelectAll = () => {
    if (selectedServers.length === servers.length) {
      setSelectedServers([])
    } else {
      setSelectedServers(servers.map((server) => server.id))
    }
  }

  // Handle check selection
  const handleCheckSelection = (checkId: string) => {
    setSelectedChecks((prev) => {
      if (prev.includes(checkId)) {
        return prev.filter((id) => id !== checkId)
      } else {
        return [...prev, checkId]
      }
    })
  }

  // Handle check type change
  const handleCheckTypeChange = (type: string) => {
    setCheckType(type)
    if (type !== "custom") {
      setSelectedChecks(HEALTH_CHECKS[type].checks)
    }
  }

  // Handle running health checks
  const handleRunHealthCheck = async () => {
    if (selectedServers.length === 0) {
      toast({
        variant: "destructive",
        title: "No servers selected",
        description: "Please select at least one server.",
      })
      return
    }

    if (selectedChecks.length === 0) {
      toast({
        variant: "destructive",
        title: "No checks selected",
        description: "Please select at least one health check.",
      })
      return
    }

    setIsRunning(true)
    setProgress(0)

    // Initialize results for selected servers
    const initialResults: Record<
      string,
      Record<string, { status: "success" | "warning" | "error" | "running"; message: string }>
    > = {}
    selectedServers.forEach((serverId) => {
      initialResults[serverId] = {}
      selectedChecks.forEach((checkId) => {
        initialResults[serverId][checkId] = {
          status: "running",
          message: "Check in progress...",
        }
      })
    })
    setResults(initialResults)

    if (mockMode) {
      // Simulate health check execution in mock mode
      const totalChecks = selectedServers.length * selectedChecks.length
      let completedChecks = 0

      for (const serverId of selectedServers) {
        const server = servers.find((s) => s.id === serverId)

        for (const checkId of selectedChecks) {
          // Simulate delay for each check
          await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1500))

          // Generate mock result
          let status: "success" | "warning" | "error" = "success"
          let message = ""

          // Randomly determine status with bias toward success
          const rand = Math.random()
          if (rand > 0.85) {
            status = "error"
          } else if (rand > 0.7) {
            status = "warning"
          }

          // Generate appropriate message based on check and status
          switch (checkId) {
            case "disk":
              if (status === "success") {
                message = "All filesystems have sufficient space. Root: 45% used (55% free)."
              } else if (status === "warning") {
                message = "Some filesystems are getting full. Root: 78% used (22% free)."
              } else {
                message = "Critical: Filesystem nearly full. Root: 92% used (8% free)."
              }
              break

            case "cpu":
              if (status === "success") {
                message = "CPU load is normal. Current load: 0.45, 0.52, 0.48 (1, 5, 15 min)."
              } else if (status === "warning") {
                message = "CPU load is elevated. Current load: 2.45, 2.12, 1.87 (1, 5, 15 min)."
              } else {
                message = "CPU load is very high. Current load: 8.12, 7.45, 6.23 (1, 5, 15 min)."
              }
              break

            case "memory":
              if (status === "success") {
                message = "Memory usage is normal. 4.2GB/16GB (26%) used."
              } else if (status === "warning") {
                message = "Memory usage is elevated. 12.8GB/16GB (80%) used."
              } else {
                message = "Memory usage is very high. 15.5GB/16GB (97%) used, swap active."
              }
              break

            case "network":
              if (status === "success") {
                message = "Network connectivity is good. All services reachable."
              } else if (status === "warning") {
                message = "Some network latency detected. Average ping: 145ms."
              } else {
                message = "Network connectivity issues detected. DNS resolution failing."
              }
              break

            case "updates":
              if (status === "success") {
                message = "System is up to date. Last update: 2 days ago."
              } else if (status === "warning") {
                message = "12 non-critical updates available."
              } else {
                message = "38 updates available, including 5 security updates."
              }
              break

            case "firewall":
              if (status === "success") {
                message = "Firewall is active and properly configured."
              } else if (status === "warning") {
                message = "Firewall is active but some rules may be too permissive."
              } else {
                message = "Firewall is disabled or not installed."
              }
              break

            case "rootkit":
              if (status === "success") {
                message = "No rootkits or malware detected."
              } else if (status === "warning") {
                message = "Some suspicious files detected, manual review recommended."
              } else {
                message = "Potential rootkit detected. Immediate action required."
              }
              break

            case "ports":
              if (status === "success") {
                message = "Only expected ports are open (22, 80, 443)."
              } else if (status === "warning") {
                message = "Some unexpected ports are open (22, 80, 443, 3306, 8080)."
              } else {
                message =
                  "Many unexpected ports are open, including potentially dangerous ones (22, 80, 443, 3306, 8080, 1433, 3389)."
              }
              break

            case "io":
              if (status === "success") {
                message = "Disk I/O performance is good. Read: 120MB/s, Write: 90MB/s."
              } else if (status === "warning") {
                message = "Disk I/O performance is below average. Read: 45MB/s, Write: 30MB/s."
              } else {
                message = "Disk I/O performance is poor. Read: 12MB/s, Write: 8MB/s."
              }
              break

            case "processes":
              if (status === "success") {
                message = "No resource-intensive processes detected."
              } else if (status === "warning") {
                message = "Some processes using high resources: mysql (25% CPU), nginx (15% CPU)."
              } else {
                message = "Critical resource usage: mysql (85% CPU), java (76% CPU, 8GB RAM)."
              }
              break

            case "load":
              if (status === "success") {
                message = "System load is stable and within normal range."
              } else if (status === "warning") {
                message = "System load has occasional spikes above normal range."
              } else {
                message = "System load consistently exceeds available resources."
              }
              break

            case "network_perf":
              if (status === "success") {
                message = "Network performance is good. Throughput: 945Mbps, Latency: 2ms."
              } else if (status === "warning") {
                message = "Network performance is below average. Throughput: 450Mbps, Latency: 45ms."
              } else {
                message = "Network performance is poor. Throughput: 120Mbps, Latency: 250ms."
              }
              break

            default:
              message = "Check completed."
          }

          // Update results for this check
          setResults((prev) => ({
            ...prev,
            [serverId]: {
              ...prev[serverId],
              [checkId]: {
                status,
                message,
              },
            },
          }))

          // Update progress
          completedChecks++
          setProgress(Math.round((completedChecks / totalChecks) * 100))
        }
      }

      // Complete the health check
      setIsRunning(false)

      toast({
        title: "Health Check Complete",
        description: `Completed health checks on ${selectedServers.length} servers.`,
      })
    } else {
      // Send health check request via WebSocket
      sendMessage({
        action: "run-health-check",
        servers: selectedServers,
        checks: selectedChecks,
      })

      // In a real app, we would process responses from the server
      // For now, we'll just simulate success after a delay
      setTimeout(() => {
        setIsRunning(false)
        setProgress(100)

        toast({
          title: "Health Check Complete",
          description: `Completed health checks on ${selectedServers.length} servers.`,
        })
      }, 5000)
    }
  }

  // Get status icon based on status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Server Health Check
          </CardTitle>
          <CardDescription>Run diagnostics to check the health and performance of your servers</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={checkType} onValueChange={handleCheckTypeChange}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>

            <TabsContent value={checkType} className="mt-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">{HEALTH_CHECKS[checkType].name}</h3>
                  <p className="text-sm text-muted-foreground">{HEALTH_CHECKS[checkType].description}</p>
                </div>

                {checkType === "custom" ? (
                  <div className="space-y-2">
                    <Label>Select Checks to Run</Label>
                    <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(AVAILABLE_CHECKS).map(([checkId, check]) => (
                          <div key={checkId} className="flex items-center space-x-2">
                            <Checkbox
                              id={`check-${checkId}`}
                              checked={selectedChecks.includes(checkId)}
                              onCheckedChange={() => handleCheckSelection(checkId)}
                            />
                            <Label
                              htmlFor={`check-${checkId}`}
                              className="flex items-center gap-2 text-sm cursor-pointer"
                            >
                              {check.icon}
                              {check.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Included Checks</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {HEALTH_CHECKS[checkType].checks.map((checkId) => (
                        <div key={checkId} className="flex items-center gap-2 text-sm">
                          {AVAILABLE_CHECKS[checkId].icon}
                          <span>{AVAILABLE_CHECKS[checkId].name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Select Servers</Label>
                    <Button variant="outline" size="sm" onClick={handleSelectAll} className="h-7 text-xs">
                      {selectedServers.length === servers.length ? "Deselect All" : "Select All"}
                    </Button>
                  </div>

                  <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
                    {servers.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No servers available</p>
                    ) : (
                      <div className="space-y-2">
                        {servers.map((server) => (
                          <div key={server.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`server-${server.id}`}
                              checked={selectedServers.includes(server.id)}
                              onCheckedChange={() => handleServerSelection(server.id)}
                              disabled={server.status === "offline"}
                            />
                            <Label
                              htmlFor={`server-${server.id}`}
                              className="flex items-center gap-2 text-sm cursor-pointer"
                            >
                              {server.name}
                              <span className="text-muted-foreground text-xs">({server.ip})</span>
                              {server.status === "offline" && (
                                <span className="text-destructive text-xs">(Offline)</span>
                              )}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedServers.length} servers selected • {selectedChecks.length} checks selected
          </div>
          <Button
            onClick={handleRunHealthCheck}
            disabled={isRunning || selectedServers.length === 0 || selectedChecks.length === 0}
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Checks...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Run Health Check
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {isRunning && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Health Check Progress
            </CardTitle>
            <CardDescription>Running health checks on {selectedServers.length} servers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress: {progress}%</span>
                <span>
                  {Object.keys(results).length} of {selectedServers.length} servers checked
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {Object.keys(results).length > 0 && !isRunning && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Health Check Results
            </CardTitle>
            <CardDescription>Results from health checks on {Object.keys(results).length} servers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(results).map(([serverId, checks]) => {
                const server = servers.find((s) => s.id === serverId)

                // Count statuses
                const statusCounts = {
                  success: 0,
                  warning: 0,
                  error: 0,
                  running: 0,
                }

                Object.values(checks).forEach((check) => {
                  statusCounts[check.status]++
                })

                // Determine overall status
                let overallStatus = "success"
                if (statusCounts.error > 0) {
                  overallStatus = "error"
                } else if (statusCounts.warning > 0) {
                  overallStatus = "warning"
                }

                return (
                  <div key={serverId} className="border rounded-md overflow-hidden">
                    <div className="flex items-center justify-between p-4 bg-muted/50">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(overallStatus)}
                        <span className="font-medium">{server?.name}</span>
                        <span className="text-xs text-muted-foreground">({server?.ip})</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          <span>{statusCounts.success}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                          <span>{statusCounts.warning}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <XCircle className="h-3 w-3 text-destructive" />
                          <span>{statusCounts.error}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="space-y-3">
                        {Object.entries(checks).map(([checkId, check]) => (
                          <div key={checkId} className="flex items-start gap-2">
                            <div className="mt-0.5">{getStatusIcon(check.status)}</div>
                            <div>
                              <div className="font-medium text-sm">{AVAILABLE_CHECKS[checkId]?.name}</div>
                              <div className="text-sm text-muted-foreground">{check.message}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
