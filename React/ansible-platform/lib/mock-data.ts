// Generate more realistic time series data
const generateTimeSeriesData = (baseValue, variance, count, timeInterval = 1) => {
  const now = new Date()
  const result = []

  for (let i = count - 1; i >= 0; i--) {
    // Create time points going backward from now
    const time = new Date(now)
    time.setHours(time.getHours() - i * timeInterval)

    // Add some randomness to the value but keep it within reasonable bounds
    const randomVariance = (Math.random() * 2 - 1) * variance
    let value = Math.round(baseValue + randomVariance)

    // Add some patterns - higher during business hours
    const hour = time.getHours()
    if (hour >= 9 && hour <= 17) {
      value += 10 // Higher during business hours
    }

    // Ensure value is within bounds
    value = Math.max(0, Math.min(100, value))

    result.push({
      time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      value,
    })
  }

  return result
}

// Mock data for server metrics with more realistic patterns
export const mockServerMetrics = {
  cpu: generateTimeSeriesData(45, 15, 24, 1), // 24 hours of data with hourly points
  memory: generateTimeSeriesData(65, 10, 24, 1),
  disk: generateTimeSeriesData(32, 3, 24, 1),
}

// Mock data for server status with more realistic values
export const mockServerStatus = {
  totalServers: 42,
  newServers: 4,
  totalPlaybooks: 24,
  executedToday: 6,
  issues: 3,
  healthy: 39,
  healthyPercentage: 93,
}

// Mock data for recent activity with more realistic timestamps
export const mockRecentActivity = [
  {
    id: 1,
    user: "John Doe",
    action: "Executed playbook",
    target: "web-servers-setup.yml",
    time: "10 minutes ago",
    status: "success",
  },
  {
    id: 2,
    user: "Jane Smith",
    action: "Added server",
    target: "db-server-03",
    time: "25 minutes ago",
    status: "success",
  },
  {
    id: 3,
    user: "Mike Johnson",
    action: "Executed playbook",
    target: "security-updates.yml",
    time: "1 hour ago",
    status: "failed",
  },
  {
    id: 4,
    user: "Sarah Williams",
    action: "Updated inventory",
    target: "production",
    time: "2 hours ago",
    status: "success",
  },
  {
    id: 5,
    user: "System",
    action: "Scheduled backup",
    target: "database-backup.yml",
    time: "3 hours ago",
    status: "success",
  },
]

// Mock data for server list with more realistic server information
export const mockServerList = [
  { id: 1, name: "web-server-01", ip: "192.168.1.101", environment: "Production", status: "online" },
  { id: 2, name: "web-server-02", ip: "192.168.1.102", environment: "Production", status: "online" },
  { id: 3, name: "db-server-01", ip: "192.168.1.201", environment: "Production", status: "online" },
  { id: 4, name: "db-server-02", ip: "192.168.1.202", environment: "Production", status: "online" },
  { id: 5, name: "cache-server-01", ip: "192.168.1.301", environment: "Production", status: "offline" },
  { id: 6, name: "staging-web-01", ip: "192.168.2.101", environment: "Staging", status: "online" },
  { id: 7, name: "staging-db-01", ip: "192.168.2.201", environment: "Staging", status: "online" },
  { id: 8, name: "dev-server-01", ip: "192.168.3.101", environment: "Development", status: "online" },
]

// Mock execution logs with more realistic timestamps and messages
export const mockExecutionLogs = [
  { timestamp: "2023-06-15 14:32:45", level: "INFO", message: "Playbook execution started" },
  { timestamp: "2023-06-15 14:32:46", level: "INFO", message: "Connecting to servers..." },
  { timestamp: "2023-06-15 14:32:47", level: "INFO", message: "Connected to web-server-01" },
  { timestamp: "2023-06-15 14:32:48", level: "INFO", message: "Connected to web-server-02" },
  { timestamp: "2023-06-15 14:32:50", level: "INFO", message: "TASK [Update apt cache]" },
  { timestamp: "2023-06-15 14:32:55", level: "INFO", message: "web-server-01: ok=1 changed=1" },
  { timestamp: "2023-06-15 14:32:56", level: "INFO", message: "web-server-02: ok=1 changed=1" },
  { timestamp: "2023-06-15 14:32:57", level: "INFO", message: "TASK [Install Nginx]" },
  { timestamp: "2023-06-15 14:33:10", level: "INFO", message: "web-server-01: ok=2 changed=1" },
  {
    timestamp: "2023-06-15 14:33:12",
    level: "WARNING",
    message: "web-server-02: Timeout connecting to package repository",
  },
  { timestamp: "2023-06-15 14:33:15", level: "INFO", message: "TASK [Retry: Install Nginx]" },
  { timestamp: "2023-06-15 14:33:25", level: "INFO", message: "web-server-02: ok=2 changed=1" },
  { timestamp: "2023-06-15 14:33:26", level: "INFO", message: "TASK [Start Nginx service]" },
  { timestamp: "2023-06-15 14:33:30", level: "INFO", message: "web-server-01: ok=3 changed=1" },
  { timestamp: "2023-06-15 14:33:32", level: "INFO", message: "web-server-02: ok=3 changed=1" },
  { timestamp: "2023-06-15 14:33:33", level: "INFO", message: "TASK [Configure firewall]" },
  { timestamp: "2023-06-15 14:33:40", level: "INFO", message: "web-server-01: ok=4 changed=1" },
  {
    timestamp: "2023-06-15 14:33:42",
    level: "ERROR",
    message: "web-server-02: Failed to configure firewall: Permission denied",
  },
  { timestamp: "2023-06-15 14:33:45", level: "INFO", message: "Playbook execution completed" },
  { timestamp: "2023-06-15 14:33:46", level: "INFO", message: "Summary: 2 servers, 1 success, 1 failed" },
]

