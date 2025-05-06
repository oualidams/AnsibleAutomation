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
import { MoreHorizontal, PlayCircle, Terminal, BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Server {
  id: string;
  name: string;
  ip_address: string;
  status: string;
  environment: string;
  os: string;
  project: string;
}

export function ServerTable({ servers }: { servers: Server[] }) {
  const [selectedServer, setSelectedServer] = useState<Server | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const router = useRouter(); 

  const handleViewDetails = (server: Server) => {
    setSelectedServer(server)
    setDialogOpen(true)
  }

  
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Environment</TableHead>
              <TableHead>OS</TableHead>
              <TableHead>Project</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {servers.map((server) => (
              <TableRow key={server.id}>
                <TableCell className="font-medium">{server.name}</TableCell>
                <TableCell>{server.ip_address}</TableCell>
                <TableCell>
                  <Badge variant={server.status === "online" ? "default" : "destructive"}>{server.status}</Badge>
                </TableCell>
                <TableCell>{server.environment}</TableCell>
                <TableCell>{server.os}</TableCell>
                <TableCell>{server.project}</TableCell>
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
                      <DropdownMenuItem onClick={() => handleViewDetails(server)}>View details</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Run playbook</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push("/command")}>SSH terminal</DropdownMenuItem>
                      <DropdownMenuItem>View metrics</DropdownMenuItem>
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
            <DialogTitle>Server Details</DialogTitle>
            <DialogDescription>Detailed information about the selected server</DialogDescription>
          </DialogHeader>
          {selectedServer && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">General Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span>{selectedServer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IP Address:</span>
                      <span>{selectedServer.ip_address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={selectedServer.status === "online" ? "default" : "destructive"}>
                        {selectedServer.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Environment:</span>
                      <span>{selectedServer.environment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">OS:</span>
                      <span>{selectedServer.os}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Project:</span>
                      <span>{selectedServer.project}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button className="gap-2" size="sm">
                  <PlayCircle className="h-4 w-4" />
                  Run Playbook
                </Button>
                <Button className="gap-2" size="sm" variant="outline" onClick={() => router.push("/command")}>
                  <Terminal className="h-4 w-4" />
                  SSH Terminal
                </Button>
                <Button className="gap-2" size="sm" variant="outline">
                  <BarChart3 className="h-4 w-4" />
                  View Metrics
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
