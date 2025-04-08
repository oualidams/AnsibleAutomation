"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Clock, HardDrive, Cpu, MemoryStickIcon as Memory } from "lucide-react"

// Sample data - in a real app, this would come from your WebSocket or API
const serverData = {
  name: "web-server-01",
  status: "online",
  uptime: "45 days, 12 hours",
  lastReboot: "2023-05-01 02:15:00",
  os: "Ubuntu 22.04 LTS",
  cpu: {
    model: "Intel Xeon E5-2680 v4",
    cores: 8,
    threads: 16,
    usage: [
      { time: "14:00", value: 45 },
      { time: "14:15", value: 52 },
      { time: "14:30", value: 48 },
      { time: "14:45", value: 60 },
      { time: "15:00", value: 65 },
      { time: "15:15", value: 58 },
      { time: "15:30", value: 50 },
      { time: "15:45", value: 45 },
    ],
    processes: [
      { name: "nginx", usage: 12 },
      { name: "node", usage: 8 },
      { name: "postgres", usage: 5 },
      { name: "system", usage: 20 },
    ],
  },
  memory: {
    total: "32 GB",
    used: "18.5 GB",
    free: "13.5 GB",
    usage: [
      { time: "14:00", value: 55 },
      { time: "14:15", value: 58 },
      { time: "14:30", value: 62 },
      { time: "14:45", value: 65 },
      { time: "15:00", value: 70 },
      { time: "15:15", value: 68 },
      { time: "15:30", value: 65 },
      { time: "15:45", value: 60 },
    ],
    allocation: [
      { name: "Applications", value: 12 },
      { name: "Cache", value: 8 },
      { name: "Buffers", value: 5 },
      { name: "Free", value: 7 },
    ],
  },
  disk: {
    total: "500 GB",
    used: "320 GB",
    free: "180 GB",
    usage: [
      { time: "14:00", value: 62 },
      { time: "14:15", value: 62 },
      { time: "14:30", value: 63 },
      { time: "14:45", value: 63 },
      { time: "15:00", value: 64 },
      { time: "15:15", value: 64 },
      { time: "15:30", value: 65 },
      { time: "15:45", value: 65 },
    ],
    partitions: [
      { name: "/", value: 45 },
      { name: "/var", value: 15 },
      { name: "/home", value: 25 },
      { name: "/tmp", value: 5 },
      { name: "other", value: 10 },
    ],
  },
  network: {
    interfaces: ["eth0", "eth1"],
    ip: "192.168.1.101",
    traffic: [
      { time: "14:00", in: 25, out: 18 },
      { time: "14:15", in: 30, out: 22 },
      { time: "14:30", in: 35, out: 25 },
      { time: "14:45", in: 40, out: 30 },
      { time: "15:00", in: 45, out: 35 },
      { time: "15:15", in: 38, out: 28 },
      { time: "15:30", in: 32, out: 24 },
      { time: "15:45", in: 28, out: 20 },
    ],
  },
}

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

export function DetailedServerMonitoring() {
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("1h")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{serverData.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={serverData.status === "online" ? "default" : "destructive"}>{serverData.status}</Badge>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" /> Uptime: {serverData.uptime}
            </span>
          </div>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[150px]">
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cpu">CPU</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
          <TabsTrigger value="disk">Disk</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{serverData.cpu.usage[serverData.cpu.usage.length - 1].value}%</div>
                <div className="h-[100px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={serverData.cpu.usage}>
                      <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={false} />
                      <ReferenceLine y={80} stroke="#EF4444" strokeDasharray="3 3" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {serverData.cpu.model} ({serverData.cpu.cores} cores, {serverData.cpu.threads} threads)
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                <Memory className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {serverData.memory.usage[serverData.memory.usage.length - 1].value}%
                </div>
                <div className="flex items-center justify-between mt-1 text-xs">
                  <span>Used: {serverData.memory.used}</span>
                  <span>Free: {serverData.memory.free}</span>
                </div>
                <div className="h-[100px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={serverData.memory.usage}>
                      <Line type="monotone" dataKey="value" stroke="#82ca9d" strokeWidth={2} dot={false} />
                      <ReferenceLine y={85} stroke="#EF4444" strokeDasharray="3 3" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">Total Memory: {serverData.memory.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {serverData.disk.usage[serverData.disk.usage.length - 1].value}%
                </div>
                <div className="flex items-center justify-between mt-1 text-xs">
                  <span>Used: {serverData.disk.used}</span>
                  <span>Free: {serverData.disk.free}</span>
                </div>
                <div className="h-[100px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={serverData.disk.usage}>
                      <Line type="monotone" dataKey="value" stroke="#ffc658" strokeWidth={2} dot={false} />
                      <ReferenceLine y={90} stroke="#EF4444" strokeDasharray="3 3" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">Total Disk: {serverData.disk.total}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 mt-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Network Traffic</CardTitle>
                <CardDescription>Inbound and outbound traffic</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serverData.network.traffic}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="in" name="Inbound (MB/s)" fill="#8884d8" />
                    <Bar dataKey="out" name="Outbound (MB/s)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>Server details and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Status</h3>
                      <div className="flex items-center gap-2">
                        {serverData.status === "online" ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-destructive" />
                        )}
                        <span className="capitalize">{serverData.status}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Operating System</h3>
                      <p>{serverData.os}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1">IP Address</h3>
                      <p>{serverData.network.ip}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Last Reboot</h3>
                      <p>{serverData.lastReboot}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-1">Network Interfaces</h3>
                    <div className="flex flex-wrap gap-2">
                      {serverData.network.interfaces.map((iface) => (
                        <Badge key={iface} variant="outline">
                          {iface}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cpu" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>CPU Usage Over Time</CardTitle>
                <CardDescription>Percentage utilization</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={serverData.cpu.usage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <ReferenceLine
                      y={80}
                      stroke="#EF4444"
                      strokeDasharray="3 3"
                      label={{ value: "Critical", position: "right", fill: "#EF4444" }}
                    />
                    <ReferenceLine
                      y={60}
                      stroke="#FCD34D"
                      strokeDasharray="3 3"
                      label={{ value: "Warning", position: "right", fill: "#FCD34D" }}
                    />
                    <Line type="monotone" dataKey="value" name="CPU Usage %" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Process CPU Usage</CardTitle>
                <CardDescription>Top processes by CPU consumption</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serverData.cpu.processes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="usage"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {serverData.cpu.processes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="memory" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Memory Usage Over Time</CardTitle>
                <CardDescription>Percentage utilization</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={serverData.memory.usage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <ReferenceLine
                      y={85}
                      stroke="#EF4444"
                      strokeDasharray="3 3"
                      label={{ value: "Critical", position: "right", fill: "#EF4444" }}
                    />
                    <ReferenceLine
                      y={75}
                      stroke="#FCD34D"
                      strokeDasharray="3 3"
                      label={{ value: "Warning", position: "right", fill: "#FCD34D" }}
                    />
                    <Line type="monotone" dataKey="value" name="Memory Usage %" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory Allocation</CardTitle>
                <CardDescription>Memory usage by category</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serverData.memory.allocation}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {serverData.memory.allocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="disk" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Disk Usage Over Time</CardTitle>
                <CardDescription>Percentage utilization</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={serverData.disk.usage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <ReferenceLine
                      y={90}
                      stroke="#EF4444"
                      strokeDasharray="3 3"
                      label={{ value: "Critical", position: "right", fill: "#EF4444" }}
                    />
                    <ReferenceLine
                      y={80}
                      stroke="#FCD34D"
                      strokeDasharray="3 3"
                      label={{ value: "Warning", position: "right", fill: "#FCD34D" }}
                    />
                    <Line type="monotone" dataKey="value" name="Disk Usage %" stroke="#ffc658" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Disk Space by Partition</CardTitle>
                <CardDescription>Storage allocation by mount point</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serverData.disk.partitions}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {serverData.disk.partitions.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

