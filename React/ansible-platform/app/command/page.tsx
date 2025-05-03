"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ServerTerminal } from "@/components/server-terminal"

// Mock server data - in a real app, this would come from your API


export default function TerminalPage() {
  const [selectedServer, setSelectedServer] = useState<string | null>(null)
  const searchParams = useSearchParams()

  const [servers, setServers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("http://localhost:8000/servers/getServers")
      .then((res) => res.json())
      .then((data) => {
        setServers(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])


  const selectedServerData = servers.find((server) => server.id === selectedServer)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Terminal Access</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Server Terminal</CardTitle>
          <CardDescription>Connect to a server and execute commands directly in the terminal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Server</label>
              <Select value={selectedServer || ""} onValueChange={(value) => setSelectedServer(value)}>
                <SelectTrigger className="w-full md:w-[300px]">
                  <SelectValue placeholder="Select a server" />
                </SelectTrigger>
                <SelectContent>
                  {servers.map((server) => (
                    <SelectItem key={server.id} value={server.id}>
                      {server.name} ({server.ip_address}) - {server.os}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedServerData ? (
              <ServerTerminal server={selectedServerData} />
            ) : (
              <div className="text-center p-8 text-muted-foreground">Select a server to access its terminal</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
