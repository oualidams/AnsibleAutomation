"use client"

import { useEffect, useState } from "react"

export default function ServerStatusChart() {
  const [servers, setServers] = useState([
    {
      id: "srv-web-01",
      name: "Web Server 01",
      status: "online",
      uptime: "45d 12h",
      os: "Ubuntu 22.04",
      ip: "10.0.1.10",
    },
    {
      id: "srv-web-02",
      name: "Web Server 02",
      status: "online",
      uptime: "30d 8h",
      os: "Ubuntu 22.04",
      ip: "10.0.1.11",
    },
    {
      id: "srv-db-01",
      name: "Database Server 01",
      status: "online",
      uptime: "60d 3h",
      os: "CentOS 8",
      ip: "10.0.2.10",
    },
    {
      id: "srv-app-01",
      name: "Application Server 01",
      status: "warning",
      uptime: "15d 22h",
      os: "Debian 11",
      ip: "10.0.3.10",
    },
    {
      id: "srv-storage-01",
      name: "Storage Server 01",
      status: "online",
      uptime: "90d 5h",
      os: "Ubuntu 20.04",
      ip: "10.0.4.10",
    },
    {
      id: "srv-backup-01",
      name: "Backup Server 01",
      status: "offline",
      uptime: "0d 0h",
      os: "CentOS 7",
      ip: "10.0.5.10",
    },
  ])

  // Simulate status changes
  useEffect(() => {
    const interval = setInterval(() => {
      setServers((prev) => {
        const newServers = [...prev]
        const randomIndex = Math.floor(Math.random() * newServers.length)
        const statuses = ["online", "warning", "offline"]
        const currentStatusIndex = statuses.indexOf(newServers[randomIndex].status)
        const newStatusIndex = (currentStatusIndex + 1) % statuses.length
        newServers[randomIndex] = {
          ...newServers[randomIndex],
          status: statuses[newStatusIndex],
        }
        return newServers
      })
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      case "offline":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="w-full overflow-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Server</th>
            <th className="text-left p-2">Status</th>
            <th className="text-left p-2">Uptime</th>
            <th className="text-left p-2">OS</th>
            <th className="text-left p-2">IP Address</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {servers.map((server) => (
            <tr key={server.id} className="border-b hover:bg-muted/50">
              <td className="p-2 font-medium">{server.name}</td>
              <td className="p-2">
                <div className="flex items-center">
                  <div className={`h-2 w-2 rounded-full mr-2 ${getStatusColor(server.status)}`} />
                  <span className="capitalize">{server.status}</span>
                </div>
              </td>
              <td className="p-2">{server.uptime}</td>
              <td className="p-2">{server.os}</td>
              <td className="p-2">{server.ip}</td>
              <td className="p-2">
                <div className="flex space-x-2">
                  <button className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Details</button>
                  <button className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                    Configure
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

