import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Server, HardDrive, Network, Users, Clock } from "lucide-react"
import ServerStatusChart from "./server-status-chart"
import ServerMetrics from "./server-metrics"

export default function Dashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Servers</CardTitle>
          <Server className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">10 active, 2 maintenance</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">68%</div>
          <p className="text-xs text-muted-foreground">8.2TB used of 12TB total</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Network Traffic</CardTitle>
          <Network className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1.2 GB/s</div>
          <p className="text-xs text-muted-foreground">Peak: 2.8 GB/s at 14:30</p>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Server Status</CardTitle>
          <CardDescription>Real-time status of all managed servers</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ServerStatusChart />
        </CardContent>
      </Card>

      <Card className="col-span-full md:col-span-2">
        <CardHeader>
          <CardTitle>Server Metrics</CardTitle>
          <CardDescription>CPU, Memory, and Disk usage across servers</CardDescription>
        </CardHeader>
        <CardContent>
          <ServerMetrics />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest server management activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: "10:42 AM", action: "Web server template applied to srv-web-03", user: "admin" },
              { time: "09:15 AM", action: "New server provisioned: srv-db-02", user: "devops" },
              { time: "Yesterday", action: "Configuration updated on srv-app-01", user: "admin" },
              { time: "Yesterday", action: "Storage expanded on srv-storage-01", user: "system" },
            ].map((activity, i) => (
              <div key={i} className="flex items-center">
                <div className="mr-2 h-2 w-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>{activity.time}</span>
                    <span className="mx-1">•</span>
                    <Users className="mr-1 h-3 w-3" />
                    <span>{activity.user}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

