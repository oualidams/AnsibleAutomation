"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import {
  Loader2,
  Terminal,
  Play,
  Download,
  Copy,
  CheckCircle2,
  XCircle,
  Server,
  Plus,
  Trash2,
  RefreshCw,
} from "lucide-react"
import { useWebSocket } from "@/contexts/websocket-context"

// Sample saved commands
const SAVED_COMMANDS = [
  {
    id: "cmd-1",
    name: "Check Disk Space",
    command: "df -h",
    description: "Display free disk space",
  },
  {
    id: "cmd-2",
    name: "Check Memory Usage",
    command: "free -m",
    description: "Display free and used memory",
  },
  {
    id: "cmd-3",
    name: "Check System Load",
    command: "uptime",
    description: "Display system load average",
  },
  {
    id: "cmd-4",
    name: "List Running Processes",
    command: "ps aux | sort -nrk 3,3 | head -n 10",
    description: "List top 10 CPU-consuming processes",
  },
  {
    id: "cmd-5",
    name: "Check Service Status",
    command: "systemctl status nginx",
    description: "Check the status of Nginx service",
  },
]

export function ParallelCommandExecution({ servers }) {
  const [selectedServers, setSelectedServers] = useState<string[]>([])
  const [commandGroups, setCommandGroups] = useState([{ id: "1", command: "", name: "" }])
  const [isExecuting, setIsExecuting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("execute")
  const [results, setResults] = useState<
    Record<string, Record<string, { output: string; status: "success" | "error" | "running" }>>
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

  // Handle command change
  const handleCommandChange = (id: string, value: string) => {
    setCommandGroups((prev) => prev.map((group) => (group.id === id ? { ...group, command: value } : group)))
  }

  // Handle command name change
  const handleCommandNameChange = (id: string, value: string) => {
    setCommandGroups((prev) => prev.map((group) => (group.id === id ? { ...group, name: value } : group)))
  }

  // Add command group
  const addCommandGroup = () => {
    setCommandGroups((prev) => [...prev, { id: Date.now().toString(), command: "", name: "" }])
  }

  // Remove command group
  const removeCommandGroup = (id: string) => {
    if (commandGroups.length > 1) {
      setCommandGroups((prev) => prev.filter((group) => group.id !== id))
    }
  }

  // Load saved command
  const loadSavedCommand = (savedCommand, groupId) => {
    setCommandGroups((prev) =>
      prev.map((group) =>
        group.id === groupId ? { ...group, command: savedCommand.command, name: savedCommand.name } : group,
      ),
    )
    setActiveTab("execute")
  }

  // Handle parallel command execution
  const handleExecuteCommands = async () => {
    if (selectedServers.length === 0) {
      toast({
        variant: "destructive",
        title: "No servers selected",
        description: "Please select at least one server.",
      })
      return
    }

    const validCommands = commandGroups.filter((group) => group.command.trim() !== "")
    if (validCommands.length === 0) {
      toast({
        variant: "destructive",
        title: "No commands to execute",
        description: "Please enter at least one command.",
      })
      return
    }

    setIsExecuting(true)
    setProgress(0)

    // Initialize results for selected servers and commands
    const initialResults: Record<
      string,
      Record<string, { output: string; status: "success" | "error" | "running" }>
    > = {}
    selectedServers.forEach((serverId) => {
      initialResults[serverId] = {}
      validCommands.forEach((group) => {
        initialResults[serverId][group.id] = {
          output: `Preparing to execute command${group.name ? ` "${group.name}"` : ""}...\n`,
          status: "running",
        }
      })
    })
    setResults(initialResults)

    if (mockMode) {
      // Simulate parallel command execution in mock mode
      const totalOperations = selectedServers.length * validCommands.length
      let completedOperations = 0

      // Process each command for each server
      for (const group of validCommands) {
        // Execute command on all servers in parallel
        await Promise.all(
          selectedServers.map(async (serverId) => {
            const server = servers.find((s) => s.id === serverId)

            // Update status to running
            setResults((prev) => ({
              ...prev,
              [serverId]: {
                ...prev[serverId],
                [group.id]: {
                  ...prev[serverId][group.id],
                  output:
                    prev[serverId][group.id].output +
                    `Connecting to ${server?.name} (${server?.ip})...\nExecuting: ${group.command}\n\n`,
                },
              },
            }))

            // Simulate random execution time
            await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 3000))

            // Generate mock output based on command
            let mockOutput = ""
            let status: "success" | "error" = "success"

            // Randomly fail some commands
            const shouldFail = Math.random() > 0.9

            if (shouldFail) {
              status = "error"
              mockOutput = `Error: Connection timed out or command failed\nCommand: ${group.command}\nExit code: 1`
            } else {
              // Generate command-specific output
              if (group.command.includes("df")) {
                mockOutput = `Filesystem      Size  Used Avail Use% Mounted on
udev            7.8G     0  7.8G   0% /dev
tmpfs           1.6G  2.1M  1.6G   1% /run
/dev/sda1        98G   48G   45G  52% /
tmpfs           7.8G   84M  7.7G   2% /dev/shm
tmpfs           5.0M     0  5.0M   0% /run/lock`
              } else if (group.command.includes("free")) {
                mockOutput = `              total        used        free      shared  buff/cache   available
Mem:          16096        4738        8740         754        2617       10302
Swap:          4095           0        4095`
              } else if (group.command.includes("uptime")) {
                mockOutput = ` 15:42:32 up 47 days,  6:28,  1 user,  load average: 0.52, 0.58, 0.59`
              } else if (group.command.includes("ps")) {
                mockOutput = `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root      1255  2.0  1.2 1345648 98764 ?      Ssl  Mar09 834:25 /usr/bin/dockerd
www-data  2207  1.8  2.5 357372 209844 ?      S    Mar10 798:22 nginx: worker process
mysql     1857  1.5  4.8 1276540 392716 ?     Ssl  Mar09 645:13 /usr/sbin/mysqld
root      1124  0.3  0.5 851300 47144 ?       Ssl  Mar09 138:42 /usr/lib/systemd/systemd-journald
nodejs    2857  0.2  3.1 1124568 253672 ?     Ssl  Mar10  98:35 node /var/www/app.js`
              } else if (group.command.includes("systemctl")) {
                mockOutput = `● nginx.service - A high performance web server and a reverse proxy server
   Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
   Active: active (running) since Tue 2023-04-11 15:43:25 UTC; 27 days ago
     Docs: man:nginx(8)
  Process: 12345 ExecStart=/usr/sbin/nginx -g daemon on; master_process on; (code=exited, status=0)
 Main PID: 12346 (nginx)
    Tasks: 9 (limit: 4915)
   Memory: 14.2M
   CGroup: /system.slice/nginx.service
           ├─12346 nginx: master process /usr/sbin/nginx -g daemon on; master_process on;
           ├─12347 nginx: worker process
           └─12348 nginx: worker process`
              } else {
                // Generic output for other commands
                mockOutput = `Command executed successfully.
${group.command} completed with exit code 0.
Operation completed at ${new Date().toISOString()}`
              }
            }

            // Update results for this server and command
            setResults((prev) => ({
              ...prev,
              [serverId]: {
                ...prev[serverId],
                [group.id]: {
                  output: prev[serverId][group.id].output + mockOutput + "\n",
                  status: status,
                },
              },
            }))

            // Update progress
            completedOperations++
            setProgress(Math.round((completedOperations / totalOperations) * 100))
          }),
        )
      }

      // Complete the execution
      setIsExecuting(false)
      toast({
        title: "Execution Complete",
        description: `Executed ${validCommands.length} commands on ${selectedServers.length} servers.`,
      })
    } else {
      // In a real app, send commands to the backend for parallel execution
      // For now, simulate success after a delay
      setTimeout(() => {
        setIsExecuting(false)
        setProgress(100)
        toast({
          title: "Execution Complete",
          description: `Executed ${validCommands.length} commands on ${selectedServers.length} servers.`,
        })
      }, 5000)
    }
  }

  // Handle copying results to clipboard
  const handleCopyResults = (serverId, commandId) => {
    if (results[serverId] && results[serverId][commandId]) {
      navigator.clipboard.writeText(results[serverId][commandId].output)
      toast({
        title: "Copied to Clipboard",
        description: "Command output has been copied to clipboard.",
      })
    }
  }

  // Handle downloading results
  const handleDownloadResults = (serverId, commandId) => {
    if (results[serverId] && results[serverId][commandId]) {
      const server = servers.find((s) => s.id === serverId)
      const command = commandGroups.find((g) => g.id === commandId)
      const filename = `${server?.name}-${command?.name || "command"}-${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-")}.txt`
      const blob = new Blob([results[serverId][commandId].output], {
        type: "text/plain",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Parallel Command Execution
          </CardTitle>
          <CardDescription>Execute multiple commands on multiple servers simultaneously</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="execute">Execute Commands</TabsTrigger>
              <TabsTrigger value="saved">Saved Commands</TabsTrigger>
            </TabsList>

            <TabsContent value="execute" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Commands to Execute</Label>
                  <Button variant="outline" size="sm" onClick={addCommandGroup} className="h-7 text-xs">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Command
                  </Button>
                </div>

                <div className="space-y-3">
                  {commandGroups.map((group, index) => (
                    <div key={group.id} className="space-y-2 p-3 border rounded-md">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`command-name-${group.id}`} className="text-xs">
                          Command Name (Optional)
                        </Label>
                        {commandGroups.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCommandGroup(group.id)}
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Input
                        id={`command-name-${group.id}`}
                        value={group.name}
                        onChange={(e) => handleCommandNameChange(group.id, e.target.value)}
                        placeholder={`Command ${index + 1}`}
                        className="h-8"
                      />
                      <Label htmlFor={`command-${group.id}`} className="text-xs">
                        Command
                      </Label>
                      <Textarea
                        id={`command-${group.id}`}
                        value={group.command}
                        onChange={(e) => handleCommandChange(group.id, e.target.value)}
                        placeholder="Enter command to execute (e.g., df -h)"
                        className="font-mono text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

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
                          />
                          <Label
                            htmlFor={`server-${server.id}`}
                            className="flex items-center gap-2 text-sm cursor-pointer"
                          >
                            {server.name}
                            <span className="text-muted-foreground text-xs">({server.ip})</span>
                            {server.status === "offline" && <span className="text-destructive text-xs">(Offline)</span>}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={handleExecuteCommands}
                disabled={isExecuting || commandGroups.every((g) => !g.command) || selectedServers.length === 0}
                className="w-full"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Executing Commands...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Execute Commands in Parallel
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="saved" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Saved Commands</h3>
                  <div className="space-y-2">
                    {SAVED_COMMANDS.map((savedCommand) => (
                      <div
                        key={savedCommand.id}
                        className="border rounded-md p-3 hover:border-primary cursor-pointer transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">{savedCommand.name}</h4>
                          <div className="flex gap-1">
                            {commandGroups.map((group) => (
                              <Button
                                key={group.id}
                                variant="outline"
                                size="sm"
                                onClick={() => loadSavedCommand(savedCommand, group.id)}
                                className="h-7 text-xs"
                              >
                                Add to #{Number.parseInt(group.id)}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{savedCommand.description}</p>
                        <pre className="mt-2 text-xs bg-muted p-2 rounded-sm font-mono overflow-x-auto">
                          {savedCommand.command}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {isExecuting && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Execution Progress
            </CardTitle>
            <CardDescription>
              Running {commandGroups.filter((g) => g.command).length} commands on {selectedServers.length} servers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress: {progress}%</span>
                <span>
                  {Object.keys(results).length} of {selectedServers.length} servers processed
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {Object.keys(results).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Execution Results</CardTitle>
            <CardDescription>Command output from {Object.keys(results).length} servers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {selectedServers.map((serverId) => {
                const server = servers.find((s) => s.id === serverId)
                const serverResults = results[serverId]

                if (!serverResults) return null

                return (
                  <div key={serverId} className="border rounded-md overflow-hidden">
                    <div className="bg-muted/50 p-3 border-b">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{server?.name}</span>
                        <span className="text-xs text-muted-foreground">({server?.ip})</span>
                      </div>
                    </div>

                    <div className="divide-y">
                      {Object.entries(serverResults).map(([commandId, result]) => {
                        const command = commandGroups.find((g) => g.id === commandId)
                        return (
                          <div key={commandId} className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {result.status === "running" ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                ) : result.status === "success" ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-destructive" />
                                )}
                                <span className="font-medium">{command?.name || `Command ${commandId}`}</span>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleCopyResults(serverId, commandId)}
                                  disabled={isExecuting}
                                >
                                  <Copy className="h-4 w-4" />
                                  <span className="sr-only">Copy</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDownloadResults(serverId, commandId)}
                                  disabled={isExecuting}
                                >
                                  <Download className="h-4 w-4" />
                                  <span className="sr-only">Download</span>
                                </Button>
                              </div>
                            </div>
                            <ScrollArea className="h-40 font-mono text-xs">
                              <pre className="whitespace-pre-wrap break-all">{result.output}</pre>
                            </ScrollArea>
                          </div>
                        )
                      })}
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
