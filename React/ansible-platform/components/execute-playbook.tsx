"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PlayCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ExecutionMonitor } from "@/components/execution-monitor";
import { useWebSocket } from "@/contexts/websocket-context";
import { Skeleton } from "@/components/ui/skeleton";
import { mockServerList } from "@/lib/mock-data";

export function ExecutePlaybook({ playbook }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedServers, setSelectedServers] = useState([]);
  const [availableServers, setAvailableServers] = useState([]);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [monitorOpen, setMonitorOpen] = useState(false);
  const { toast } = useToast();
  const { isConnected, sendMessage, lastMessage, mockMode } = useWebSocket();

  // Fetch available servers when dialog opens
  useEffect(() => {
    if (open) {
      setIsLoading(true);

      if (mockMode) {
        // Use mock data in mock mode
        setTimeout(() => {
          setAvailableServers(mockServerList);
          setIsLoading(false);
        }, 500);
      } else if (isConnected) {
        // Request server list from WebSocket
        sendMessage({
          action: "get-servers",
        });
      } else {
        // Not connected and not in mock mode yet
        setAvailableServers([]);
        setIsLoading(false);
      }
    }
  }, [open, isConnected, sendMessage, mockMode]);

  // Process incoming WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === "server-list") {
        setAvailableServers(lastMessage.data || []);
        setIsLoading(false);
      } else if (lastMessage.type === "execution-started") {
        setExecutionId(lastMessage.data.executionId);
        toast({
          title: "Playbook Execution Started",
          description: `Executing "${playbook.name}" on ${selectedServers.length} servers.`,
        });
        setOpen(false);
        setMonitorOpen(true);
        setSelectedServers([]);
      }
    }
  }, [lastMessage, playbook.name, selectedServers.length, toast]);

  const handleServerToggle = (serverId) => {
    setSelectedServers((prevSelected) => {
      if (prevSelected.includes(serverId)) {
        return prevSelected.filter((id) => id !== serverId);
      } else {
        return [...prevSelected, serverId];
      }
    });
  };

  const handleExecute = async () => {
    if (selectedServers.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least one server.",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Send execution request via WebSocket or use mock mode
      sendMessage({
        action: "execute-playbook",
        playbookId: playbook.id,
        targetServers: selectedServers,
        extraVars: {},
      });
    } catch (error) {
      console.error("Error executing playbook:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to execute playbook. Please try again.",
      });
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full gap-1" variant="default">
            <PlayCircle className="h-4 w-4" />
            Run Template
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Execute</DialogTitle>
            <DialogDescription>
              Select target servers to run "{playbook.name}" playbook.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="mb-4">
              <Label>Environment Filter</Label>
              <Select defaultValue="all">
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Environments</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mb-4">
              <Label className="mb-2 block">Target Servers</Label>
              <div className="border rounded-md p-3 max-h-60 overflow-y-auto space-y-2">
                {isLoading
                  ? // Loading skeletons
                    Array(4)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 w-40" />
                        </div>
                      ))
                  : availableServers.map((server) => (
                      <div
                        key={server.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`server-${server.id}`}
                          checked={selectedServers.includes(server.id)}
                          onCheckedChange={() => handleServerToggle(server.id)}
                        />
                        <Label
                          htmlFor={`server-${server.id}`}
                          className="flex-1"
                        >
                          {server.name}
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({server.environment})
                          </span>
                        </Label>
                      </div>
                    ))}
                {!isLoading && availableServers.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No servers available.
                  </p>
                )}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {selectedServers.length} server(s) selected
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExecute} disabled={isLoading}>
              {isLoading ? "Running..." : "Execute Playbook"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {executionId && (
        <ExecutionMonitor
          executionId={executionId}
          open={monitorOpen}
          onClose={() => setMonitorOpen(false)}
        />
      )}
    </>
  );
}
