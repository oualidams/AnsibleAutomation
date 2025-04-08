"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PlusCircle, MoreHorizontal } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Sample scheduled tasks
const defaultSchedules = [
  {
    id: 1,
    name: "Daily Database Backup",
    playbook: "Database Backup",
    target: "All Database Servers",
    schedule: "Daily at 01:00 AM",
    lastRun: "2023-06-14 01:00:00",
    nextRun: "2023-06-15 01:00:00",
    status: "active",
    createdBy: "system",
  },
  {
    id: 2,
    name: "Weekly Security Updates",
    playbook: "Security Updates",
    target: "All Servers",
    schedule: "Every Sunday at 03:00 AM",
    lastRun: "2023-06-11 03:00:00",
    nextRun: "2023-06-18 03:00:00",
    status: "active",
    createdBy: "john.doe",
  },
  {
    id: 3,
    name: "Monthly Performance Optimization",
    playbook: "Performance Tuning",
    target: "Web Servers",
    schedule: "1st day of month at 02:00 AM",
    lastRun: "2023-06-01 02:00:00",
    nextRun: "2023-07-01 02:00:00",
    status: "active",
    createdBy: "jane.smith",
  },
  {
    id: 4,
    name: "Log Rotation",
    playbook: "Log Management",
    target: "All Servers",
    schedule: "Every day at 00:15 AM",
    lastRun: "2023-06-14 00:15:00",
    nextRun: "2023-06-15 00:15:00",
    status: "paused",
    createdBy: "system",
  },
]

// Sample playbooks for dropdown
const playbooks = [
  { id: 1, name: "Database Backup" },
  { id: 2, name: "Security Updates" },
  { id: 3, name: "Performance Tuning" },
  { id: 4, name: "Log Management" },
  { id: 5, name: "Web Server Setup" },
  { id: 6, name: "Docker Deployment" },
]

// Sample server groups for dropdown
const serverGroups = [
  { id: 1, name: "All Servers" },
  { id: 2, name: "Web Servers" },
  { id: 3, name: "Database Servers" },
  { id: 4, name: "Production Servers" },
  { id: 5, name: "Staging Servers" },
  { id: 6, name: "Development Servers" },
]

export function ScheduleManager() {
  const [schedules, setSchedules] = useState(defaultSchedules)
  const [newScheduleDialogOpen, setNewScheduleDialogOpen] = useState(false)
  const [editScheduleDialogOpen, setEditScheduleDialogOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [newSchedule, setNewSchedule] = useState({
    name: "",
    playbook: "",
    target: "",
    frequency: "daily",
    time: "00:00",
    dayOfWeek: "1", // Monday
    dayOfMonth: "1",
    status: "active",
  })
  const { toast } = useToast()

  const handleEditSchedule = (schedule) => {
    // Convert schedule string to form values
    const scheduleObj = {
      ...schedule,
      frequency: schedule.schedule.includes("Every day")
        ? "daily"
        : schedule.schedule.includes("Every Sunday")
          ? "weekly"
          : "monthly",
      time: schedule.schedule.split(" at ")[1].replace(" AM", "").replace(" PM", ""),
      dayOfWeek: "0", // Sunday (default)
      dayOfMonth: "1", // 1st (default)
    }

    setSelectedSchedule(scheduleObj)
    setEditScheduleDialogOpen(true)
  }

  const handleSaveSchedule = () => {
    if (selectedSchedule) {
      // Format schedule string based on frequency
      let scheduleString = ""
      if (selectedSchedule.frequency === "daily") {
        scheduleString = `Every day at ${selectedSchedule.time} AM`
      } else if (selectedSchedule.frequency === "weekly") {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        const day = days[Number.parseInt(selectedSchedule.dayOfWeek)]
        scheduleString = `Every ${day} at ${selectedSchedule.time} AM`
      } else {
        scheduleString = `${selectedSchedule.dayOfMonth}${getDaySuffix(selectedSchedule.dayOfMonth)} day of month at ${selectedSchedule.time} AM`
      }

      const updatedSchedule = {
        ...selectedSchedule,
        schedule: scheduleString,
        nextRun: calculateNextRun(selectedSchedule),
      }

      setSchedules(schedules.map((s) => (s.id === selectedSchedule.id ? updatedSchedule : s)))
      toast({
        title: "Schedule updated",
        description: `Successfully updated schedule: ${selectedSchedule.name}`,
      })
      setEditScheduleDialogOpen(false)
    }
  }

  const handleCreateSchedule = () => {
    if (!newSchedule.name || !newSchedule.playbook || !newSchedule.target) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      })
      return
    }

    // Format schedule string based on frequency
    let scheduleString = ""
    if (newSchedule.frequency === "daily") {
      scheduleString = `Every day at ${newSchedule.time} AM`
    } else if (newSchedule.frequency === "weekly") {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      const day = days[Number.parseInt(newSchedule.dayOfWeek)]
      scheduleString = `Every ${day} at ${newSchedule.time} AM`
    } else {
      scheduleString = `${newSchedule.dayOfMonth}${getDaySuffix(newSchedule.dayOfMonth)} day of month at ${newSchedule.time} AM`
    }

    const nextRun = calculateNextRun(newSchedule)

    const newId = Math.max(...schedules.map((s) => s.id)) + 1
    const createdSchedule = {
      id: newId,
      name: newSchedule.name,
      playbook: newSchedule.playbook,
      target: newSchedule.target,
      schedule: scheduleString,
      lastRun: "-",
      nextRun,
      status: newSchedule.status,
      createdBy: "current_user", // In a real app, this would be the logged-in user
    }

    setSchedules([...schedules, createdSchedule])
    toast({
      title: "Schedule created",
      description: `Successfully created schedule: ${newSchedule.name}`,
    })
    setNewScheduleDialogOpen(false)
    setNewSchedule({
      name: "",
      playbook: "",
      target: "",
      frequency: "daily",
      time: "00:00",
      dayOfWeek: "1",
      dayOfMonth: "1",
      status: "active",
    })
  }

  const toggleScheduleStatus = (id) => {
    setSchedules(
      schedules.map((schedule) => {
        if (schedule.id === id) {
          const newStatus = schedule.status === "active" ? "paused" : "active"
          toast({
            title: `Schedule ${newStatus}`,
            description: `${schedule.name} has been ${newStatus}`,
          })
          return { ...schedule, status: newStatus }
        }
        return schedule
      }),
    )
  }

  // Helper function to calculate next run date (simplified)
  const calculateNextRun = (schedule) => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")} ${schedule.time}:00`
  }

  // Helper function to get day suffix (1st, 2nd, 3rd, etc.)
  const getDaySuffix = (day) => {
    const d = Number.parseInt(day)
    if (d > 3 && d < 21) return "th"
    switch (d % 10) {
      case 1:
        return "st"
      case 2:
        return "nd"
      case 3:
        return "rd"
      default:
        return "th"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl">Scheduled Tasks</CardTitle>
          <CardDescription>Manage automated playbook executions</CardDescription>
        </div>
        <Button onClick={() => setNewScheduleDialogOpen(true)} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Create Schedule
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Playbook</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Next Run</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell className="font-medium">{schedule.name}</TableCell>
                <TableCell>{schedule.playbook}</TableCell>
                <TableCell>{schedule.target}</TableCell>
                <TableCell>{schedule.schedule}</TableCell>
                <TableCell>{schedule.nextRun}</TableCell>
                <TableCell>
                  <Badge variant={schedule.status === "active" ? "default" : "secondary"}>{schedule.status}</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEditSchedule(schedule)}>Edit schedule</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleScheduleStatus(schedule.id)}>
                        {schedule.status === "active" ? "Pause schedule" : "Activate schedule"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Run now</DropdownMenuItem>
                      <DropdownMenuItem>View history</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Delete schedule</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {/* Create New Schedule Dialog */}
      <Dialog open={newScheduleDialogOpen} onOpenChange={setNewScheduleDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Scheduled Task</DialogTitle>
            <DialogDescription>Schedule a playbook to run automatically</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="schedule-name">Schedule Name</Label>
              <Input
                id="schedule-name"
                value={newSchedule.name}
                onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                placeholder="Enter a name for this schedule"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="schedule-playbook">Playbook</Label>
              <Select
                value={newSchedule.playbook}
                onValueChange={(value) => setNewSchedule({ ...newSchedule, playbook: value })}
              >
                <SelectTrigger id="schedule-playbook">
                  <SelectValue placeholder="Select a playbook" />
                </SelectTrigger>
                <SelectContent>
                  {playbooks.map((playbook) => (
                    <SelectItem key={playbook.id} value={playbook.name}>
                      {playbook.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="schedule-target">Target Servers</Label>
              <Select
                value={newSchedule.target}
                onValueChange={(value) => setNewSchedule({ ...newSchedule, target: value })}
              >
                <SelectTrigger id="schedule-target">
                  <SelectValue placeholder="Select target servers" />
                </SelectTrigger>
                <SelectContent>
                  {serverGroups.map((group) => (
                    <SelectItem key={group.id} value={group.name}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="schedule-frequency">Frequency</Label>
              <Select
                value={newSchedule.frequency}
                onValueChange={(value) => setNewSchedule({ ...newSchedule, frequency: value })}
              >
                <SelectTrigger id="schedule-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newSchedule.frequency === "weekly" && (
              <div className="grid gap-2">
                <Label htmlFor="schedule-day-of-week">Day of Week</Label>
                <Select
                  value={newSchedule.dayOfWeek}
                  onValueChange={(value) => setNewSchedule({ ...newSchedule, dayOfWeek: value })}
                >
                  <SelectTrigger id="schedule-day-of-week">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sunday</SelectItem>
                    <SelectItem value="1">Monday</SelectItem>
                    <SelectItem value="2">Tuesday</SelectItem>
                    <SelectItem value="3">Wednesday</SelectItem>
                    <SelectItem value="4">Thursday</SelectItem>
                    <SelectItem value="5">Friday</SelectItem>
                    <SelectItem value="6">Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {newSchedule.frequency === "monthly" && (
              <div className="grid gap-2">
                <Label htmlFor="schedule-day-of-month">Day of Month</Label>
                <Select
                  value={newSchedule.dayOfMonth}
                  onValueChange={(value) => setNewSchedule({ ...newSchedule, dayOfMonth: value })}
                >
                  <SelectTrigger id="schedule-day-of-month">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}
                        {getDaySuffix(day)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="schedule-time">Time</Label>
              <Input
                id="schedule-time"
                type="time"
                value={newSchedule.time}
                onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="schedule-active"
                checked={newSchedule.status === "active"}
                onCheckedChange={(checked) => setNewSchedule({ ...newSchedule, status: checked ? "active" : "paused" })}
              />
              <Label htmlFor="schedule-active">Activate schedule immediately</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSchedule}>Create Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Schedule Dialog */}
      <Dialog open={editScheduleDialogOpen} onOpenChange={setEditScheduleDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Scheduled Task</DialogTitle>
            <DialogDescription>Modify schedule settings</DialogDescription>
          </DialogHeader>

          {selectedSchedule && (
            <div className="grid gap-4 py-4">
              {/* Same form fields as create dialog, but with selectedSchedule values */}
              <div className="grid gap-2">
                <Label htmlFor="edit-schedule-name">Schedule Name</Label>
                <Input
                  id="edit-schedule-name"
                  value={selectedSchedule.name}
                  onChange={(e) => setSelectedSchedule({ ...selectedSchedule, name: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-schedule-playbook">Playbook</Label>
                <Select
                  value={selectedSchedule.playbook}
                  onValueChange={(value) => setSelectedSchedule({ ...selectedSchedule, playbook: value })}
                >
                  <SelectTrigger id="edit-schedule-playbook">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {playbooks.map((playbook) => (
                      <SelectItem key={playbook.id} value={playbook.name}>
                        {playbook.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Other form fields follow the same pattern */}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-schedule-active"
                  checked={selectedSchedule.status === "active"}
                  onCheckedChange={(checked) =>
                    setSelectedSchedule({ ...selectedSchedule, status: checked ? "active" : "paused" })
                  }
                />
                <Label htmlFor="edit-schedule-active">Schedule is active</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSchedule}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

