"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function MonitoringPage() {
  const [timeRange, setTimeRange] = useState("24h")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Monitoring</h1>
          <p className="text-muted-foreground">Real-time metrics and performance monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last hour</SelectItem>
              <SelectItem value="6h">Last 6 hours</SelectItem>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button>Refresh</Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cpu">CPU</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
          <TabsTrigger value="disk">Disk</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>CPU Usage</CardTitle>
                <CardDescription>Average across all servers</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cpuData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Memory Usage</CardTitle>
                <CardDescription>Average across all servers</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={memoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Disk Usage</CardTitle>
                <CardDescription>Average across all servers</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={diskData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#ffc658" fill="#ffc658" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-6 mt-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Server Status</CardTitle>
                <CardDescription>Current status of all servers</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Network Traffic</CardTitle>
                <CardDescription>Inbound and outbound traffic</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={networkData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="inbound" fill="#8884d8" />
                    <Bar dataKey="outbound" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cpu" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>CPU Usage</CardTitle>
              <CardDescription>Detailed CPU metrics for all servers</CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={detailedCpuData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="web-server-01" stroke="#8884d8" />
                  <Line type="monotone" dataKey="web-server-02" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="db-server-01" stroke="#ffc658" />
                  <Line type="monotone" dataKey="cache-server-01" stroke="#ff8042" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memory" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Memory Usage</CardTitle>
              <CardDescription>Detailed memory metrics for all servers</CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={detailedMemoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="web-server-01" stroke="#8884d8" />
                  <Line type="monotone" dataKey="web-server-02" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="db-server-01" stroke="#ffc658" />
                  <Line type="monotone" dataKey="cache-server-01" stroke="#ff8042" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disk" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Disk Usage</CardTitle>
              <CardDescription>Detailed disk metrics for all servers</CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={detailedDiskData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="web-server-01" stroke="#8884d8" />
                  <Line type="monotone" dataKey="web-server-02" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="db-server-01" stroke="#ffc658" />
                  <Line type="monotone" dataKey="cache-server-01" stroke="#ff8042" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Sample data for charts
const cpuData = [
  { time: "00:00", value: 45 },
  { time: "04:00", value: 40 },
  { time: "08:00", value: 55 },
  { time: "12:00", value: 75 },
  { time: "16:00", value: 60 },
  { time: "20:00", value: 50 },
  { time: "24:00", value: 45 },
]

const memoryData = [
  { time: "00:00", value: 60 },
  { time: "04:00", value: 65 },
  { time: "08:00", value: 70 },
  { time: "12:00", value: 80 },
  { time: "16:00", value: 75 },
  { time: "20:00", value: 70 },
  { time: "24:00", value: 65 },
]

const diskData = [
  { time: "00:00", value: 30 },
  { time: "04:00", value: 30 },
  { time: "08:00", value: 32 },
  { time: "12:00", value: 35 },
  { time: "16:00", value: 35 },
  { time: "20:00", value: 35 },
  { time: "24:00", value: 35 },
]

const statusData = [
  { name: "Online", value: 10, color: "#4CAF50" },
  { name: "Offline", value: 1, color: "#F44336" },
  { name: "Warning", value: 1, color: "#FFC107" },
]

const networkData = [
  { time: "00:00", inbound: 120, outbound: 80 },
  { time: "04:00", inbound: 100, outbound: 70 },
  { time: "08:00", inbound: 180, outbound: 120 },
  { time: "12:00", inbound: 250, outbound: 200 },
  { time: "16:00", inbound: 220, outbound: 170 },
  { time: "20:00", inbound: 150, outbound: 100 },
  { time: "24:00", inbound: 130, outbound: 90 },
]

const detailedCpuData = [
  { time: "00:00", "web-server-01": 45, "web-server-02": 42, "db-server-01": 60, "cache-server-01": 30 },
  { time: "04:00", "web-server-01": 40, "web-server-02": 38, "db-server-01": 55, "cache-server-01": 28 },
  { time: "08:00", "web-server-01": 55, "web-server-02": 52, "db-server-01": 65, "cache-server-01": 35 },
  { time: "12:00", "web-server-01": 75, "web-server-02": 70, "db-server-01": 85, "cache-server-01": 45 },
  { time: "16:00", "web-server-01": 60, "web-server-02": 58, "db-server-01": 75, "cache-server-01": 40 },
  { time: "20:00", "web-server-01": 50, "web-server-02": 75, "cache-server-01": 40 },
  { time: "20:00", "web-server-01": 50, "web-server-02": 48, "db-server-01": 65, "cache-server-01": 35 },
  { time: "24:00", "web-server-01": 45, "web-server-02": 43, "db-server-01": 60, "cache-server-01": 30 },
]

const detailedMemoryData = [
  { time: "00:00", "web-server-01": 60, "web-server-02": 58, "db-server-01": 75, "cache-server-01": 45 },
  { time: "04:00", "web-server-01": 65, "web-server-02": 62, "db-server-01": 78, "cache-server-01": 48 },
  { time: "08:00", "web-server-01": 70, "web-server-02": 68, "db-server-01": 82, "cache-server-01": 52 },
  { time: "12:00", "web-server-01": 80, "web-server-02": 78, "db-server-01": 90, "cache-server-01": 60 },
  { time: "16:00", "web-server-01": 75, "web-server-02": 72, "db-server-01": 85, "cache-server-01": 55 },
  { time: "20:00", "web-server-01": 70, "web-server-02": 68, "db-server-01": 80, "cache-server-01": 50 },
  { time: "24:00", "web-server-01": 65, "web-server-02": 63, "db-server-01": 75, "cache-server-01": 48 },
]

const detailedDiskData = [
  { time: "00:00", "web-server-01": 30, "web-server-02": 32, "db-server-01": 65, "cache-server-01": 25 },
  { time: "04:00", "web-server-01": 30, "web-server-02": 32, "db-server-01": 66, "cache-server-01": 25 },
  { time: "08:00", "web-server-01": 32, "web-server-02": 34, "db-server-01": 68, "cache-server-01": 26 },
  { time: "12:00", "web-server-01": 35, "web-server-02": 36, "db-server-01": 70, "cache-server-01": 28 },
  { time: "16:00", "web-server-01": 35, "web-server-02": 36, "db-server-01": 72, "cache-server-01": 28 },
  { time: "20:00", "web-server-01": 35, "web-server-02": 36, "db-server-01": 72, "cache-server-01": 28 },
  { time: "24:00", "web-server-01": 35, "web-server-02": 36, "db-server-01": 73, "cache-server-01": 28 },
]
