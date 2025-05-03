"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { useWebSocket } from "@/contexts/websocket-context"
import { Loader2, Send, X, Download, Copy, RotateCw } from "lucide-react"

interface ServerTerminalProps {
  server: {
    id: string
    name: string
    ip: string
    os: string
  }
}

export function ServerTerminal({ server }: ServerTerminalProps) {
  const [command, setCommand] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [output, setOutput] = useState<string>("")
  const outputRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { sendMessage, mockMode } = useWebSocket()

  // Auto-scroll output to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

  // Focus input when connected
  useEffect(() => {
    if (isConnected && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isConnected])

  // Connect to server
  const connectToServer = () => {
    setIsConnecting(true)
    setOutput("")

    // Simulate connection
    setTimeout(() => {
      setIsConnected(true)
      setIsConnecting(false)
      setOutput(`Connecting to ${server.name} (${server.ip})...
SSH connection established.
Last login: ${new Date().toLocaleString()}

${server.name}:~$ `)
    }, 1500)
  }

  // Disconnect from server
  const disconnectFromServer = () => {
    setIsConnected(false)
    setOutput((prev) => prev + "\nConnection closed.\n")
    toast({
      title: "Disconnected",
      description: `Terminal session with ${server.name} has been closed.`,
    })
  }

  // Handle command execution
  const executeCommand = async () => {
    if (!command.trim()) return

    // Add command to history
    setCommandHistory((prev) => [...prev, command])
    setHistoryIndex(-1)

    // Update output with command
    setOutput((prev) => `${prev}${command}\n`)

    // Clear command input
    setCommand("")

    if (mockMode) {
      // Simulate command execution
      const trimmedCommand = command.trim()

      // Handle exit command
      if (trimmedCommand === "exit") {
        disconnectFromServer()
        return
      }

      // Handle clear command
      if (trimmedCommand === "clear") {
        setOutput(`${server.name}:~$ `)
        return
      }

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 700))

      // Generate mock output based on command
      let mockOutput = ""

      if (trimmedCommand === "ls") {
        mockOutput = `Documents  Downloads  Pictures  Videos  app.conf  data  logs`
      } else if (trimmedCommand === "pwd") {
        mockOutput = `/home/admin`
      } else if (trimmedCommand === "whoami") {
        mockOutput = `admin`
      } else if (trimmedCommand === "date") {
        mockOutput = new Date().toString()
      } else if (trimmedCommand.startsWith("cd ")) {
        mockOutput = "" // cd commands don't typically produce output
      } else if (trimmedCommand === "ls -la") {
        mockOutput = `total 56
drwxr-xr-x 10 admin admin 4096 May  3 14:22 .
drwxr-xr-x  3 root  root  4096 Jan 15 09:34 ..
-rw-------  1 admin admin  567 May  3 10:11 .bash_history
-rw-r--r--  1 admin admin  220 Jan 15 09:34 .bash_logout
-rw-r--r--  1 admin admin 3771 Jan 15 09:34 .bashrc
drwxr-xr-x  3 admin admin 4096 Jan 15 09:45 .cache
drwxr-xr-x  3 admin admin 4096 Jan 15 09:45 .config
drwxr-xr-x  2 admin admin 4096 May  2 15:32 Documents
drwxr-xr-x  2 admin admin 4096 Jan 15 09:45 Downloads
drwxr-xr-x  2 admin admin 4096 Jan 15 09:45 Pictures
-rw-r--r--  1 admin admin  807 Jan 15 09:34 .profile
drwxr-xr-x  2 admin admin 4096 Jan 15 09:45 Videos
-rw-r--r--  1 admin admin  512 May  2 14:23 app.conf
drwxr-xr-x  4 admin admin 4096 May  2 14:23 data
drwxr-xr-x  2 admin admin 4096 May  2 14:23 logs`
      } else if (trimmedCommand === "uname -a") {
        mockOutput = `Linux ${server.name} 5.15.0-76-generic #83-Ubuntu SMP ${server.os} x86_64 GNU/Linux`
      } else if (trimmedCommand.startsWith("cat ")) {
        const file = trimmedCommand.split(" ")[1]
        if (file === "app.conf") {
          mockOutput = `# Application configuration
port = 8080
log_level = info
max_connections = 100
timeout = 30
enable_ssl = true
ssl_cert = /etc/ssl/certs/app.crt
ssl_key = /etc/ssl/private/app.key`
        } else {
          mockOutput = `cat: ${file}: No such file or directory`
        }
      } else if (trimmedCommand === "ps aux | grep nginx") {
        mockOutput = `root      1234  0.0  0.2 142392 12345 ?        Ss   May02   0:00 nginx: master process /usr/sbin/nginx -g daemon on; master_process on;
www-data  1235  0.0  0.1 142752  6789 ?        S    May02   0:00 nginx: worker process
www-data  1236  0.0  0.1 142752  6789 ?        S    May02   0:00 nginx: worker process
admin     5678  0.0  0.0  12345  1234 pts/0    S+   14:30   0:00 grep --color=auto nginx`
      } else if (trimmedCommand === "df -h") {
        mockOutput = `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        98G   48G   45G  52% /
tmpfs           7.8G   84M  7.7G   2% /dev/shm
/dev/sda2       450G  228G  199G  54% /data`
      } else if (trimmedCommand === "free -m") {
        mockOutput = `              total        used        free      shared  buff/cache   available
Mem:          16096        4738        8740         754        2617       10302
Swap:          4095           0        4095`
      } else if (trimmedCommand === "uptime") {
        mockOutput = ` 14:30:45 up 47 days,  6:28,  1 user,  load average: 0.52, 0.58, 0.59`
      } else if (trimmedCommand === "help" || trimmedCommand === "--help") {
        mockOutput = `Available commands in this mock terminal:
- ls, ls -la: List files
- pwd: Print working directory
- whoami: Show current user
- date: Show current date and time
- cd [dir]: Change directory (simulated)
- cat [file]: Show file contents
- ps aux | grep nginx: Show nginx processes
- df -h: Show disk usage
- free -m: Show memory usage
- uptime: Show system uptime
- uname -a: Show system information
- clear: Clear the terminal
- exit: Close the terminal session`
      } else {
        mockOutput = `Command not found: ${trimmedCommand}`
      }

      // Update output with command result
      setOutput((prev) => `${prev}${mockOutput}\n\n${server.name}:~$ `)
    } else {
      // In a real implementation, send command to server via WebSocket
      sendMessage({
        action: "terminal-command",
        serverId: server.id,
        command: command,
      })

      // This would be handled by the WebSocket response handler
    }
  }

  // Handle key press in command input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeCommand()
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex
        setHistoryIndex(newIndex)
        setCommand(commandHistory[commandHistory.length - 1 - newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCommand(commandHistory[commandHistory.length - 1 - newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setCommand("")
      }
    }
  }

  // Handle copying terminal output to clipboard
  const handleCopyOutput = () => {
    navigator.clipboard.writeText(output)
    toast({
      title: "Copied to Clipboard",
      description: "Terminal output has been copied to clipboard.",
    })
  }

  // Handle downloading terminal output
  const handleDownloadOutput = () => {
    const filename = `${server.name}-terminal-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.txt`
    const blob = new Blob([output], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Handle clearing the terminal
  const handleClearTerminal = () => {
    setOutput(`${server.name}:~$ `)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
          <span className="text-sm font-medium">{isConnected ? "Connected" : "Disconnected"}</span>
        </div>
        <div className="flex gap-2">
          {isConnected ? (
            <>
              <Button variant="outline" size="sm" onClick={handleClearTerminal} title="Clear terminal">
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyOutput} title="Copy output">
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadOutput} title="Download output">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="sm" onClick={disconnectFromServer}>
                <X className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </>
          ) : (
            <Button onClick={connectToServer} disabled={isConnecting}>
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>Connect</>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="border rounded-md bg-black text-green-400 font-mono text-sm">
        <ScrollArea className="h-[400px] p-4" ref={outputRef}>
          <pre className="whitespace-pre-wrap">{output}</pre>
        </ScrollArea>

        {isConnected && (
          <div className="border-t border-gray-800 p-2 flex items-center">
            <span className="text-xs mr-2">$</span>
            <Input
              ref={inputRef}
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border-0 bg-transparent text-green-400 focus-visible:ring-0 focus-visible:ring-offset-0 font-mono"
              placeholder="Type a command..."
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={executeCommand}
              className="text-green-400 hover:text-green-300 hover:bg-transparent"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        <p>
          Type <code className="bg-muted px-1 rounded">help</code> to see available commands. Use{" "}
          <code className="bg-muted px-1 rounded">exit</code> to close the session.
        </p>
        <p>Use up/down arrow keys to navigate command history.</p>
      </div>
    </div>
  )
}
