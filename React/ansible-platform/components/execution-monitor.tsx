"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Server, FileText, Download } from "lucide-react"
import { useWebSocket } from "@/contexts/websocket-context"
import { Skeleton } from "@/components/ui/skeleton"
import { mockExecutionLogs } from "@/lib/mock-data"

// Types for execution data
type ServerStatus = {
  name: string
  status: "pending" | "running" | "success" | "failed"
  tasks: {
    total: number
    completed: number
    failed: number
  }
}

type LogEntry = {
  timestamp: string
  level: "INFO" | "WARNING" | "ERROR" | "DEBUG"
  message: string
}

type ExecutionData = {
  id: string
  playbook: string
  status: "running" | "success" | "failed" | "completed"
  progress: number
  startTime: string
  duration: string
  servers: ServerStatus[]
  logs?: LogEntry[]
}

// This component shows real-time execution of a playbook
export function ExecutionMonitor({ executionId, open, onClose }) {
  const [execution, setExecution] = useState<ExecutionData | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const scrollRef = useRef<HTMLDivElement>(null)
  const { isConnected, sendMessage, lastMessage, mockMode, getMockData } = useWebSocket()
  const [isLoading, setIsLoading] = useState(true)
  const logIntervalRef = useRef<NodeJS.Timeout>()

  // Connect to execution WebSocket when dialog opens
  useEffect(() => {
    if (open) {
      if (mockMode) {
        // In mock mode, use mock data
        const mockExecution = getMockData(`execution-${executionId}`)
        setExecution(mockExecution)
        setIsLoading(false)

        // Simulate log streaming in mock mode
        let logIndex = 0
        logIntervalRef.current = setInterval(() => {
          if (logIndex < mockExecutionLogs.length) {
            setLogs((prev) => [...prev, mockExecutionLogs[logIndex]])
            logIndex++

            // Update progress
            setExecution((prev) => {
              if (!prev) return null
              const progress = Math.min(100, Math.round((logIndex / mockExecutionLogs.length) * 100))
              return {
                ...prev,
                progress,
                servers: prev.servers.map((server) => ({
                  ...server,
                  tasks: {
                    ...server.tasks,
                    completed: Math.min(server.tasks.total, Math.floor((progress / 100) * server.tasks.total)),
                  },
                  status: progress === 100 ? (server.name === "web-server-02" ? "failed" : "success") : "running",
                })),
              }
            })

            // Complete execution at the end
            if (logIndex === mockExecutionLogs.length) {
              setExecution((prev) => {
                if (!prev) return null
                return {
                  ...prev,
                  status: "failed", // One server failed in our mock data
                  progress: 100,
                }
              })
            }
          } else {
            clearInterval(logIntervalRef.current)
          }
        }, 500)
      } else if (isConnected) {
        // In connected mode, subscribe to execution updates
        sendMessage({
          action: "subscribe",
          topic: `execution-${executionId}`,
        })

        // Request initial execution data
        sendMessage({
          action: "get-execution",
          executionId,
        })
      } else {
        // Not connected and not in mock mode yet
        setIsLoading(true)
      }

      return () => {
        // Clean up
        if (logIntervalRef.current) {
          clearInterval(logIntervalRef.current)
        }

        if (isConnected) {
          // Unsubscribe when dialog closes
          sendMessage({
            action: "unsubscribe",
            topic: `execution-${executionId}`,
          })
        }
      }
    }
  }, [open, isConnected, executionId, sendMessage, mockMode, getMockData])

  // Process incoming WebSocket messages
  useEffect(() => {
    if (lastMessage && lastMessage.topic === `execution-${executionId}`) {
      const { type, data } = lastMessage

      if (type === "execution_info") {
        setExecution(data)
        setIsLoading(false)
      } else if (type === "log") {
        setLogs((prev) => [...prev, data])
      } else if (type === "server_update") {
        setExecution((prev) => {
          if (!prev) return null

          // Update the specific server
          const updatedServers = prev.servers.map((server) =>
            server.name === data.name ? { ...server, ...data } : server,
          )

          return {
            ...prev,
            servers: updatedServers,
            progress: data.progress || prev.progress,
          }
        })
      } else if (type === "execution_complete") {
        setExecution((prev) => {
          if (!prev) return null
          return {
            ...prev,
            status: data.status,
            duration: data.duration,
          }
        })
      }
    }
  }, [lastMessage, executionId])

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (scrollRef.current && activeTab === "logs") {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs, activeTab])

  // Download logs function
  const handleDownloadLogs = () => {
    if (!logs.length) return

    const logText = logs.map((log) => `${log.timestamp} [${log.level}] ${log.message}`).join("\n")

    const blob = new Blob([logText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `execution-${executionId}-logs.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Playbook Execution: {isLoading ? <Skeleton className="h-4 w-32 inline-block" /> : execution?.playbook}
            {!isLoading && execution && (
              <Badge
                variant={
                  execution.status === "running"
                    ? "outline"
                    : execution.status === "success"
                      ? "default"
                      : "destructive"
                }
                className="ml-2"
              >
                {execution.status}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {isLoading ? (
              <Skeleton className="h-4 w-48" />
            ) : (
              <>
                Started at {execution?.startTime} • Running for {execution?.duration}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm">
                Progress: {isLoading ? <Skeleton className="h-3 w-8 inline-block" /> : `${execution?.progress || 0}%`}
              </span>
              <span className="text-sm">
                {isLoading ? (
                  <Skeleton className="h-3 w-24 inline-block" />
                ) : (
                  `${execution?.servers.filter((s) => s.status === "success" || s.tasks.completed === s.tasks.total).length} of ${execution?.servers.length} servers completed`
                )}
              </span>
            </div>
            <Progress value={isLoading ? 0 : execution?.progress || 0} className="h-2" />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              {isLoading ? (
                // Loading skeletons for servers
                Array(2)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-4 rounded-full" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                      </div>
                    </div>
                  ))
              ) : (
                <div className="grid gap-4">
                  {execution?.servers.map((server) => (
                    <div key={server.name} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Server className="h-4 w-4" />
                          <span className="font-medium">{server.name}</span>
                        </div>
                        <Badge
                          variant={
                            server.status === "pending"
                              ? "outline"
                              : server.status === "running"
                                ? "secondary"
                                : server.status === "success"
                                  ? "default"
                                  : "destructive"
                          }
                        >
                          {server.status}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Tasks completed:</span>
                          <span>
                            {server.tasks.completed} of {server.tasks.total}
                          </span>
                        </div>

                        <Progress
                          value={server.tasks.total > 0 ? (server.tasks.completed / server.tasks.total) * 100 : 0}
                          className="h-2"
                        />

                        {server.tasks.failed > 0 && (
                          <div className="flex items-center gap-1 text-sm text-destructive mt-2">
                            <AlertCircle className="h-4 w-4" />
                            <span>{server.tasks.failed} task(s) failed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="logs" className="mt-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Execution Logs</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1"
                  onClick={handleDownloadLogs}
                  disabled={logs.length === 0}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </div>

              <ScrollArea className="h-[400px] border rounded-md p-4 bg-muted/30" ref={scrollRef}>
                <div className="font-mono text-xs space-y-1">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className={`py-0.5 ${
                        log.level === "ERROR" ? "text-destructive" : log.level === "WARNING" ? "text-amber-500" : ""
                      }`}
                    >
                      <span className="text-muted-foreground">{log.timestamp}</span>{" "}
                      <span className="font-semibold">[{log.level}]</span> {log.message}
                    </div>
                  ))}

                  {logs.length === 0 && (
                    <div className="py-8 text-center text-muted-foreground">
                      {isLoading ? "Connecting to execution..." : "Waiting for logs..."}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

