"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"

export default function ServerMetrics() {
  const [servers, setServers] = useState([
    {
      id: "srv-web-01",
      name: "Web Server 01",
      cpu: 45,
      memory: 60,
      disk: 35,
    },
    {
      id: "srv-web-02",
      name: "Web Server 02",
      cpu: 30,
      memory: 45,
      disk: 40,
    },
    {
      id: "srv-db-01",
      name: "Database Server 01",
      cpu: 65,
      memory: 80,
      disk: 75,
    },
    {
      id: "srv-app-01",
      name: "Application Server 01",
      cpu: 55,
      memory: 70,
      disk: 50,
    },
    {
      id: "srv-storage-01",
      name: "Storage Server 01",
      cpu: 20,
      memory: 30,
      disk: 85,
    },
  ])

  // Simulate metric changes
  useEffect(() => {
    const interval = setInterval(() => {
      setServers((prev) => {
        return prev.map((server) => ({
          ...server,
          cpu: Math.min(100, Math.max(5, server.cpu + (Math.random() * 10 - 5))),
          memory: Math.min(100, Math.max(10, server.memory + (Math.random() * 8 - 4))),
          disk: Math.min(100, Math.max(20, server.disk + (Math.random() * 2 - 1))),
        }))
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getProgressColor = (value: number) => {
    if (value > 80) return "bg-red-500"
    if (value > 60) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <div className="space-y-6">
      {servers.map((server) => (
        <div key={server.id} className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">{server.name}</h3>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>CPU</span>
                <span>{Math.round(server.cpu)}%</span>
              </div>
              <Progress value={server.cpu} className="h-2" indicatorClassName={getProgressColor(server.cpu)} />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Memory</span>
                <span>{Math.round(server.memory)}%</span>
              </div>
              <Progress value={server.memory} className="h-2" indicatorClassName={getProgressColor(server.memory)} />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Disk</span>
                <span>{Math.round(server.disk)}%</span>
              </div>
              <Progress value={server.disk} className="h-2" indicatorClassName={getProgressColor(server.disk)} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

