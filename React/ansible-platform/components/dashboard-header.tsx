import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export function DashboardHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your server infrastructure and automation</p>
      </div>
      <Button className="gap-2">
        <PlusCircle className="h-4 w-4" />
        Add Server
      </Button>
    </div>
  )
}
