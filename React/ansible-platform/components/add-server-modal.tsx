"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface AddServerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddServerModal({ open, onOpenChange }: AddServerModalProps) {
  const [serverName, setServerName] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [environment, setEnvironment] = useState("production");
  const [osType, setOsType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [backendMessage, setBackendMessage] = useState(""); // State to store the backend message
  const { toast } = useToast();

  // Handle final submission
  const handleFinalSubmit = async () => {
    if (!serverName || !ipAddress || !osType) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields.",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Send server creation request to the backend
      const response = await fetch("http://localhost:8000/servers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: serverName,
          ip_adress: ipAddress,
          environment: environment,
          os: osType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create server");
      }

      const data = await response.json();
      setBackendMessage(data); // Store the backend message
      toast({
        title: "Server Created",
        description: data,
      });

      setIsLoading(false);
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding server:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add server. Please try again.",
      });
      setIsLoading(false);
    }
  };

  // Reset form state
  const resetForm = () => {
    setServerName("");
    setIpAddress("");
    setEnvironment("production");
    setOsType("");
    setBackendMessage("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Server</DialogTitle>
          <DialogDescription>Enter server details to create a new server.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="server-name">Server Name</Label>
              <Input
                id="server-name"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                placeholder="web-server-01"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ip-address">IP Address</Label>
              <Input
                id="ip-address"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="192.168.1.100"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <Select value={environment} onValueChange={setEnvironment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="os-type">Operating System</Label>
              <Select value={osType} onValueChange={setOsType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select OS" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ubuntu">Ubuntu</SelectItem>
                  <SelectItem value="centos">CentOS</SelectItem>
                  <SelectItem value="debian">Debian</SelectItem>
                  <SelectItem value="rhel">RHEL</SelectItem>
                  <SelectItem value="windows">Windows</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleFinalSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Server...
                </>
              ) : (
                "Add Server"
              )}
            </Button>
          </DialogFooter>
        </form>

        {backendMessage && (
          <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-md">
            <p>{backendMessage}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
