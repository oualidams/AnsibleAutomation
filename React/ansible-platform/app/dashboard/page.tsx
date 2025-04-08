import { ServerStats } from "@/components/server-stats"
import { RecentActivity } from "@/components/recent-activity"
import { DashboardHeader } from "@/components/dashboard-header"
import { ServerStatusCards } from "@/components/server-status-cards"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader />
      <ServerStatusCards />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ServerStats />
        <RecentActivity />
      </div>
    </div>
  )
}

