"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Terminal, Save, Play, Download, Copy, CheckCircle2, XCircle } from "lucide-react"
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

export function CommandExecution({ servers }) {
  const [selectedServers, setSelectedServers] = useState<string[]>([])
  const [command, setCommand] = useState("")
  const [commandName, setCommandName] = useState("")
  const [commandDescription, setCommandDescription] = useState("")
  const [isExecuting, setIsExecuting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("execute")
  const [results, setResults] = useState<Record<string, { output: string; status: "success" | "error" | "running" }>>(
    {},
  )
  const scrollRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const { sendMessage, lastMessage, mockMode } = useWebSocket()

  // Auto-scroll results to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [results])

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

  // Handle command execution
  const handleExecuteCommand = async () => {
    if (!command) {
      toast({
        variant: "destructive",
        title: "Command required",
        description: "Please enter a command to execute.",
      })
      return
    }

    if (selectedServers.length === 0) {
      toast({
        variant: "destructive",
        title: "No servers selected",
        description: "Please select at least one server.",
      })
      return
    }

    setIsExecuting(true)

    // Initialize results for selected servers
    const initialResults: Record<string, { output: string; status: "success" | "error" | "running" }> = {}
    selectedServers.forEach((serverId) => {
      const server = servers.find((s) => s.id === serverId)
      initialResults[serverId] = {
        output: `Connecting to ${server?.name} (${server?.ip})...\n`,
        status: "running",
      }
    })
    setResults(initialResults)

    if (mockMode) {
      // Simulate command execution in mock mode
      for (const serverId of selectedServers) {
        const server = servers.find((s) => s.id === serverId)

        // Simulate delay for each server
        await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000))

        setResults((prev) => ({
          ...prev,
          [serverId]: {
            ...prev[serverId],
            output: prev[serverId].output + `Executing: ${command}\n\n`,
          },
        }))

        // Simulate command output with random delay
        await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

        // Generate mock output based on command
        let mockOutput = ""
        let status: "success" | "error" = "success"

        if (command.includes("df")) {
          mockOutput = `Filesystem      Size  Used Avail Use% Mounted on
udev            7.8G     0  7.8G   0% /dev
tmpfs           1.6G  2.1M  1.6G   1% /run
/dev/sda1        98G   48G   45G  52% /
tmpfs           7.8G   84M  7.7G   2% /dev/shm
tmpfs           5.0M     0  5.0M   0% /run/lock`
        } else if (command.includes("free")) {
          mockOutput = `              total        used        free      shared  buff/cache   available
Mem:          16096        4738        8740         754        2617       10302
Swap:          4095           0        4095`
        } else if (command.includes("uptime")) {
          mockOutput = ` 15:42:32 up 47 days,  6:28,  1 user,  load average: 0.52, 0.58, 0.59`
        } else if (command.includes("ps")) {
          mockOutput = `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root      1255  2.0  1.2 1345648 98764 ?      Ssl  Mar09 834:25 /usr/bin/dockerd
www-data  2207  1.8  2.5 357372 209844 ?      S    Mar10 798:22 nginx: worker process
mysql     1857  1.5  4.8 1276540 392716 ?     Ssl  Mar09 645:13 /usr/sbin/mysqld
root      1124  0.3  0.5 851300 47144 ?       Ssl  Mar09 138:42 /usr/lib/systemd/systemd-journald
nodejs    2857  0.2  3.1 1124568 253672 ?     Ssl  Mar10  98:35 node /var/www/app.js`
        } else if (command.includes("systemctl")) {
          if (Math.random() > 0.8) {
            mockOutput = `● nginx.service - A high performance web server and a reverse proxy server
   Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
   Active: failed (Result: exit-code) since Tue 2023-04-11 15:43:25 UTC; 2min 10s ago
     Docs: man:nginx(8)
  Process: 12345 ExecStart=/usr/sbin/nginx -g daemon on; master_process on; (code=exited, status=1)
 Main PID: 12345 (code=exited, status=1)

Apr 11 15:43:24 ${server?.name} systemd[1]: Starting A high performance web server and a reverse proxy server...
Apr 11 15:43:25 ${server?.name} nginx[12345]: nginx: [emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)
Apr 11 15:43:25 ${server?.name} nginx[12345]: nginx: [emerg] still could not bind()
Apr 11 15:43:25 ${server?.name} systemd[1]: nginx.service: Control process exited, code=exited status=1
Apr 11 15:43:25 ${server?.name} systemd[1]: Failed to start A high performance web server and a reverse proxy server.
Apr 11 15:43:25 ${server?.name} systemd[1]: nginx.service: Unit entered failed state.`
            status = "error"
          } else {
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
          }
        } else {
          // Random command
          if (Math.random() > 0.9) {
            mockOutput = `bash: ${command.split(" ")[0]}: command not found`
            status = "error"
          } else {
            mockOutput = `Command executed successfully.
${command} completed with exit code 0.`
          }
        }

        setResults((prev) => ({
          ...prev,
          [serverId]: {
            output: prev[serverId].output + mockOutput + "\n",
            status: status,
          },
        }))
      }

      setIsExecuting(false)
    } else {
      // Send command execution request via WebSocket
      sendMessage({
        action: "execute-command",
        command: command,
        servers: selectedServers,
      })

      // In a real app, we would process responses from the server
      // For now, we'll just simulate success after a delay
      setTimeout(() => {
        setIsExecuting(false)
      }, 3000)
    }
  }

  // Handle saving a command
  const handleSaveCommand = () => {
    if (!command) {
      toast({
        variant: "destructive",
        title: "Command required",
        description: "Please enter a command to save.",
      })
      return
    }

    if (!commandName) {
      toast({
        variant: "destructive",
        title: "Name required",
        description: "Please provide a name for this command.",
      })
      return
    }

    setIsSaving(true)

    // In a real app, we would save the command to the database
    setTimeout(() => {
      toast({
        title: "Command Saved",
        description: `Command "${commandName}" has been saved.`,
      })
      setIsSaving(false)
      setCommandName("")
      setCommandDescription("")
    }, 1000)
  }

  // Handle loading a saved command
  const handleLoadCommand = (savedCommand) => {
    setCommand(savedCommand.command)
    setActiveTab("execute")
  }

  // Handle copying results to clipboard
  const handleCopyResults = (serverId) => {
    if (results[serverId]) {
      navigator.clipboard.writeText(results[serverId].output)
      toast({
        title: "Copied to Clipboard",
        description: "Command output has been copied to clipboard.",
      })
    }
  }

  // Handle downloading results
  const handleDownloadResults = (serverId) => {
    if (results[serverId]) {
      const server = servers.find((s) => s.id === serverId)
      const filename = `${server?.name}-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.txt`
      const blob = new Blob([results[serverId].output], { type: "text/plain" })
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
            Command Execution
          </CardTitle>
          <CardDescription>Execute commands on multiple servers simultaneously</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="execute">Execute Command</TabsTrigger>
            </TabsList>

            <TabsContent value="execute" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="command">Command</Label>
                <div className="flex gap-2">
                  <Textarea
                    id="command"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    placeholder="Enter command to execute (e.g., df -h)"
                    className="font-mono text-sm"
                  />
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

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveTab("saved")
                      setCommandName(command)
                    }}
                    disabled={!command || isExecuting}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save Command
                  </Button>
                </div>

                <Button
                  onClick={handleExecuteCommand}
                  disabled={isExecuting || !command || selectedServers.length === 0}
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Execute
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="saved" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="command-name">Command Name</Label>
                  <Input
                    id="command-name"
                    value={commandName}
                    onChange={(e) => setCommandName(e.target.value)}
                    placeholder="Enter a name for this command"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="command-description">Description (Optional)</Label>
                  <Textarea
                    id="command-description"
                    value={commandDescription}
                    onChange={(e) => setCommandDescription(e.target.value)}
                    placeholder="Enter a description for this command"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="save-command">Command</Label>
                  <Textarea
                    id="save-command"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    placeholder="Enter command to save"
                    className="font-mono text-sm"
                  />
                </div>

                <Button onClick={handleSaveCommand} disabled={isSaving || !command || !commandName} className="w-full">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Command
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {Object.keys(results).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Execution Results</CardTitle>
            <CardDescription>Command output from selected servers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedServers.map((serverId) => {
                const server = servers.find((s) => s.id === serverId)
                const result = results[serverId]

                if (!result) return null

                return (
                  <div key={serverId} className="border rounded-md">
                    <div className="flex items-center justify-between p-3 border-b bg-muted/50">
                      <div className="flex items-center gap-2">
                        {result.status === "running" ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : result.status === "success" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                        <span className="font-medium">{server?.name}</span>
                        <span className="text-xs text-muted-foreground">({server?.ip})</span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyResults(serverId)}
                          disabled={isExecuting}
                        >
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Copy</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadResults(serverId)}
                          disabled={isExecuting}
                        >
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </Button>
                      </div>
                    </div>
                    <ScrollArea className="h-64 p-3 font-mono text-xs" ref={scrollRef}>
                      <pre className="whitespace-pre-wrap break-all">{result.output}</pre>
                    </ScrollArea>
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
