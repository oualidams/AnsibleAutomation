import { ScheduleManager } from "@/components/schedule-manager"

export default function SchedulesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Scheduled Tasks</h1>
        <p className="text-muted-foreground">Manage automated playbook executions</p>
      </div>

      <ScheduleManager />
    </div>
  )
}

