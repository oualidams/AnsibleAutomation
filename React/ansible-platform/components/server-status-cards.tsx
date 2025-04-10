"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Server, PlaySquare, AlertCircle, CheckCircle2, TrendingUp, TrendingDown } from "lucide-react"
import { useWebSocketTopic } from "@/contexts/websocket-context"
import { Skeleton } from "@/components/ui/skeleton"
import { mockServerStatus } from "@/lib/mock-data"
import { Progress } from "@/components/ui/progress"

export function ServerStatusCards() {
  const statusData = useWebSocketTopic("server-status") || mockServerStatus
  const isLoading = !statusData

  // Helper function to determine trend icon
  const getTrendIcon = (value, threshold) => {
    if (value > threshold) {
      return <TrendingUp className="h-3 w-3 text-destructive" />
    } else {
      return <TrendingDown className="h-3 w-3 text-green-500" />
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {isLoading ? (
        // Loading skeletons
        Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <Skeleton className="h-4 w-24" />
                </CardTitle>
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))
      ) : (
        // Actual data
        <>
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Servers</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusData.totalServers}</div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {statusData.newServers} added this month
                  {getTrendIcon(statusData.newServers, 2)}
                </p>
                <p className="text-xs font-medium">
                  {Math.round((statusData.healthy / statusData.totalServers) * 100)}% online
                </p>
              </div>
              <Progress value={(statusData.healthy / statusData.totalServers) * 100} className="h-1 mt-2" />
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Playbooks</CardTitle>
              <PlaySquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusData.totalPlaybooks}</div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {statusData.executedToday} executed today
                  {getTrendIcon(statusData.executedToday, 5)}
                </p>
                <p className="text-xs font-medium">
                  {Math.round((statusData.executedToday / statusData.totalPlaybooks) * 100)}% utilization
                </p>
              </div>
              <Progress value={(statusData.executedToday / statusData.totalPlaybooks) * 100} className="h-1 mt-2" />
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Issues</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusData.issues}</div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">Requires attention</p>
                <p className="text-xs font-medium flex items-center gap-1">
                  {Math.round((statusData.issues / statusData.totalServers) * 100)}% affected
                  {getTrendIcon(statusData.issues, 1)}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-1 mt-2">
                <div className="h-1 bg-destructive rounded-sm"></div>
                <div className="h-1 bg-amber-500 rounded-sm"></div>
                <div className="h-1 bg-muted rounded-sm"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Healthy</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusData.healthy}</div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">{statusData.healthyPercentage}% of servers</p>
                <p className="text-xs font-medium flex items-center gap-1">
                  {statusData.totalServers - statusData.healthy} need attention
                </p>
              </div>
              <div className="grid grid-cols-10 gap-1 mt-2">
                {Array(10)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-sm ${i < Math.round(statusData.healthyPercentage / 10) ? "bg-green-500" : "bg-muted"}`}
                    ></div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
