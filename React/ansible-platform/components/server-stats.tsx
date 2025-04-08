"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  Legend,
} from "recharts"
import { useWebSocketTopic } from "@/contexts/websocket-context"
import { Skeleton } from "@/components/ui/skeleton"
import { mockServerMetrics } from "@/lib/mock-data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"

// Custom tooltip component for better data presentation
const CustomTooltip = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-md shadow-md p-3 text-sm">
        <p className="font-medium">{`Time: ${label}`}</p>
        <p className="text-primary">
          <span className="font-medium">{`Value: ${payload[0].value}${unit}`}</span>
        </p>
        {payload[0].payload.status && (
          <p
            className={`${payload[0].payload.status === "warning" ? "text-amber-500" : payload[0].payload.status === "critical" ? "text-destructive" : "text-muted-foreground"}`}
          >
            Status: {payload[0].payload.status}
          </p>
        )}
      </div>
    )
  }
  return null
}

export function ServerStats() {
  const [activeTab, setActiveTab] = useState("cpu")
  const [timeRange, setTimeRange] = useState("24h")
  const metricsData = useWebSocketTopic("server-metrics") || mockServerMetrics

  // Enhanced data with status indicators based on thresholds
  const enhancedData = useMemo(() => {
    if (!metricsData) return { cpu: [], memory: [], disk: [] }

    return {
      cpu: metricsData.cpu.map((point) => ({
        ...point,
        status: point.value > 80 ? "critical" : point.value > 70 ? "warning" : "normal",
      })),
      memory: metricsData.memory.map((point) => ({
        ...point,
        status: point.value > 85 ? "critical" : point.value > 75 ? "warning" : "normal",
      })),
      disk: metricsData.disk.map((point) => ({
        ...point,
        status: point.value > 90 ? "critical" : point.value > 80 ? "warning" : "normal",
      })),
    }
  }, [metricsData])

  // Calculate statistics
  const stats = useMemo(() => {
    if (!metricsData) return { cpu: {}, memory: {}, disk: {} }

    const calculateStats = (data) => {
      if (!data.length) return { min: 0, max: 0, avg: 0, current: 0, trend: "stable" }

      const values = data.map((d) => d.value)
      const min = Math.min(...values)
      const max = Math.max(...values)
      const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      const current = values[values.length - 1]

      // Calculate trend based on last few points
      const recentValues = values.slice(-3)
      let trend = "stable"
      if (recentValues.length >= 2) {
        const diff = recentValues[recentValues.length - 1] - recentValues[0]
        trend = diff > 5 ? "up" : diff < -5 ? "down" : "stable"
      }

      return { min, max, avg, current, trend }
    }

    return {
      cpu: calculateStats(metricsData.cpu),
      memory: calculateStats(metricsData.memory),
      disk: calculateStats(metricsData.disk),
    }
  }, [metricsData])

  const isLoading = !metricsData

  // Get current stats based on active tab
  const currentStats = stats[activeTab] || {}

  // Get threshold values based on resource type
  const getThresholds = (type) => {
    switch (type) {
      case "cpu":
        return { warning: 70, critical: 80 }
      case "memory":
        return { warning: 75, critical: 85 }
      case "disk":
        return { warning: 80, critical: 90 }
      default:
        return { warning: 70, critical: 80 }
    }
  }

  const thresholds = getThresholds(activeTab)

  // Get unit based on resource type
  const getUnit = (type) => {
    switch (type) {
      case "cpu":
        return "%"
      case "memory":
        return "%"
      case "disk":
        return "%"
      default:
        return ""
    }
  }

  const unit = getUnit(activeTab)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Server Metrics</CardTitle>
            <CardDescription>Real-time resource utilization across your infrastructure</CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last hour</SelectItem>
              <SelectItem value="6h">Last 6 hours</SelectItem>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cpu" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cpu">CPU</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
            <TabsTrigger value="disk">Disk</TabsTrigger>
          </TabsList>

          {!isLoading && (
            <div className="grid grid-cols-4 gap-2 mt-4 mb-2">
              <div className="flex flex-col items-center p-2 border rounded-md">
                <span className="text-xs text-muted-foreground">Current</span>
                <span className="text-lg font-bold">
                  {currentStats.current}
                  {unit}
                </span>
              </div>
              <div className="flex flex-col items-center p-2 border rounded-md">
                <span className="text-xs text-muted-foreground">Average</span>
                <span className="text-lg font-bold">
                  {currentStats.avg}
                  {unit}
                </span>
              </div>
              <div className="flex flex-col items-center p-2 border rounded-md">
                <span className="text-xs text-muted-foreground">Peak</span>
                <span className="text-lg font-bold">
                  {currentStats.max}
                  {unit}
                </span>
              </div>
              <div className="flex flex-col items-center p-2 border rounded-md">
                <span className="text-xs text-muted-foreground">Trend</span>
                <span className="flex items-center gap-1">
                  {currentStats.trend === "up" ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-destructive" />{" "}
                      <span className="text-destructive font-medium">Rising</span>
                    </>
                  ) : currentStats.trend === "down" ? (
                    <>
                      <TrendingDown className="h-4 w-4 text-green-500" />{" "}
                      <span className="text-green-500 font-medium">Falling</span>
                    </>
                  ) : (
                    <>
                      <Activity className="h-4 w-4 text-muted-foreground" /> <span className="font-medium">Stable</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="h-[300px] mt-4 flex items-center justify-center">
              <Skeleton className="h-[250px] w-full" />
            </div>
          ) : (
            <>
              <TabsContent value="cpu" className="h-[300px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={enhancedData.cpu}>
                    <defs>
                      <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                    <XAxis dataKey="time" tick={{ fill: "#6B7280" }} axisLine={{ stroke: "#374151" }} />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "#6B7280" }}
                      axisLine={{ stroke: "#374151" }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip content={<CustomTooltip unit="%" />} />
                    <Legend />
                    <ReferenceLine
                      y={thresholds.warning}
                      stroke="#FCD34D"
                      strokeDasharray="3 3"
                      label={{ value: "Warning", position: "insideTopRight", fill: "#FCD34D" }}
                    />
                    <ReferenceLine
                      y={thresholds.critical}
                      stroke="#EF4444"
                      strokeDasharray="3 3"
                      label={{ value: "Critical", position: "insideTopRight", fill: "#EF4444" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      name="CPU Usage"
                      stroke="#8884d8"
                      fillOpacity={1}
                      fill="url(#colorCpu)"
                      activeDot={{ r: 6, strokeWidth: 2 }}
                      isAnimationActive={true}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="memory" className="h-[300px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={enhancedData.memory}>
                    <defs>
                      <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                    <XAxis dataKey="time" tick={{ fill: "#6B7280" }} axisLine={{ stroke: "#374151" }} />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "#6B7280" }}
                      axisLine={{ stroke: "#374151" }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip content={<CustomTooltip unit="%" />} />
                    <Legend />
                    <ReferenceLine
                      y={thresholds.warning}
                      stroke="#FCD34D"
                      strokeDasharray="3 3"
                      label={{ value: "Warning", position: "insideTopRight", fill: "#FCD34D" }}
                    />
                    <ReferenceLine
                      y={thresholds.critical}
                      stroke="#EF4444"
                      strokeDasharray="3 3"
                      label={{ value: "Critical", position: "insideTopRight", fill: "#EF4444" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      name="Memory Usage"
                      stroke="#82ca9d"
                      fillOpacity={1}
                      fill="url(#colorMemory)"
                      activeDot={{ r: 6, strokeWidth: 2 }}
                      isAnimationActive={true}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="disk" className="h-[300px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={enhancedData.disk}>
                    <defs>
                      <linearGradient id="colorDisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ffc658" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                    <XAxis dataKey="time" tick={{ fill: "#6B7280" }} axisLine={{ stroke: "#374151" }} />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "#6B7280" }}
                      axisLine={{ stroke: "#374151" }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip content={<CustomTooltip unit="%" />} />
                    <Legend />
                    <ReferenceLine
                      y={thresholds.warning}
                      stroke="#FCD34D"
                      strokeDasharray="3 3"
                      label={{ value: "Warning", position: "insideTopRight", fill: "#FCD34D" }}
                    />
                    <ReferenceLine
                      y={thresholds.critical}
                      stroke="#EF4444"
                      strokeDasharray="3 3"
                      label={{ value: "Critical", position: "insideTopRight", fill: "#EF4444" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      name="Disk Usage"
                      stroke="#ffc658"
                      fillOpacity={1}
                      fill="url(#colorDisk)"
                      activeDot={{ r: 6, strokeWidth: 2 }}
                      isAnimationActive={true}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>
            </>
          )}

          {!isLoading && (
            <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Normal (&lt;{thresholds.warning}%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span>
                    Warning ({thresholds.warning}%-{thresholds.critical}%)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <span>Critical (&gt;{thresholds.critical}%)</span>
                </div>
              </div>
              <div>Last updated: {new Date().toLocaleTimeString()}</div>
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}

