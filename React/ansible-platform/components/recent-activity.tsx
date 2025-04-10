"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useWebSocketTopic } from "@/contexts/websocket-context"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"
import { mockRecentActivity } from "@/lib/mock-data"

export function RecentActivity() {
  const activityData = useWebSocketTopic("recent-activity")
  const [activities, setActivities] = useState([])

  // Initialize with mock data if needed
  useEffect(() => {
    if (!activities.length && !activityData) {
      setActivities(mockRecentActivity)
    }
  }, [activities.length, activityData])

  // Update activities when new data comes in
  useEffect(() => {
    if (activityData) {
      // Add new activities to the top of the list
      setActivities((prev) => {
        // If it's a new activity (not already in the list)
        if (activityData.id && !prev.some((a) => a.id === activityData.id)) {
          return [activityData, ...prev].slice(0, 5) // Keep only the 5 most recent
        }
        return prev
      })
    }
  }, [activityData])

  const isLoading = activities.length === 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions performed on the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading
            ? // Loading skeletons
              Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="ml-auto h-4 w-16" />
                      </div>
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))
            : // Actual data
              activities.map((activity, index) => (
                <div key={activity.id || index} className="flex items-start gap-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`/placeholder.svg?height=32&width=32&text=${activity.user.charAt(0)}`} />
                    <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">{activity.user}</p>
                      <Badge variant={activity.status === "success" ? "default" : "destructive"} className="ml-auto">
                        {activity.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.action} <span className="font-medium">{activity.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
        </div>
      </CardContent>
    </Card>
  )
}
