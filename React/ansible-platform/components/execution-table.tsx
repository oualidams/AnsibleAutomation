"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MoreHorizontal, PlayCircle, FileText, AlertCircle, CheckCircle, SkipForward } from "lucide-react"

export function ExecutionTable({ executions }) {
  const [selectedExecution, setSelectedExecution] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleViewDetails = (execution) => {
    setSelectedExecution(execution)
    setDialogOpen(true)
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Playbook</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {executions.map((execution) => (
              <TableRow key={execution.id}>
                <TableCell className="font-medium">{execution.playbook}</TableCell>
                <TableCell>{execution.target}</TableCell>
                <TableCell>{execution.user}</TableCell>
                <TableCell>{execution.startTime}</TableCell>
                <TableCell>{execution.duration}</TableCell>
                <TableCell>
                  <Badge variant={execution.status === "success" ? "default" : "destructive"}>{execution.status}</Badge>
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
                      <DropdownMenuItem onClick={() => handleViewDetails(execution)}>View details</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>View logs</DropdownMenuItem>
                      <DropdownMenuItem>Rerun playbook</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Execution Details</DialogTitle>
            <DialogDescription>Detailed information about the playbook execution</DialogDescription>
          </DialogHeader>
          {selectedExecution && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Execution Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Playbook:</span>
                      <span>{selectedExecution.playbook}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Target:</span>
                      <span>{selectedExecution.target}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">User:</span>
                      <span>{selectedExecution.user}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Time:</span>
                      <span>{selectedExecution.startTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{selectedExecution.duration}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Task Summary</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div className="flex justify-between flex-1">
                        <span>Successful:</span>
                        <span>
                          {selectedExecution.tasks.success} of {selectedExecution.tasks.total}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <div className="flex justify-between flex-1">
                        <span>Failed:</span>
                        <span>
                          {selectedExecution.tasks.failed} of {selectedExecution.tasks.total}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <SkipForward className="h-4 w-4 text-yellow-500" />
                      <div className="flex justify-between flex-1">
                        <span>Skipped:</span>
                        <span>
                          {selectedExecution.tasks.skipped} of {selectedExecution.tasks.total}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button className="gap-2" size="sm">
                  <FileText className="h-4 w-4" />
                  View Logs
                </Button>
                <Button className="gap-2" size="sm" variant="outline">
                  <PlayCircle className="h-4 w-4" />
                  Rerun Playbook
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
