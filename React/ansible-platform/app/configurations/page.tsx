"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

export function PlaybookEditor({ onCreate }: { onCreate: (template: any) => void }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [configData, setConfigData] = useState({
    name: "",
    description: "",
    module: "",
    configuration: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfigData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configData.name || !configData.description || !configData.module || !configData.configuration) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields.",
      });
      return;
    }
    setIsLoading(true);
    try {
      await onCreate(configData);
      setOpen(false);
    } catch (error) {
      console.error("Creation failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Create Configuration</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Configuration</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {["name", "description", "module", "configuration"].map((field) => (
              <div key={field}>
                <Label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                <Input
                  id={field}
                  name={field}
                  value={configData[field as keyof typeof configData]}
                  onChange={handleInputChange}
                  placeholder={`Enter ${field}`}
                  required
                />
              </div>
            ))}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<any | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/configurations/getConfigs");
      if (!response.ok) throw new Error("Fetch failed");

      const data = await response.json();
      setPlaybooks(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch templates.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async (template: any) => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/configurations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
      });
      if (!response.ok) throw new Error("Creation failed");

      toast({ title: "Created", description: "Configuration created successfully." });
      fetchTemplates();
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Creation failed." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (config: any) => {
    setSelectedConfig(config);
    setIsConfigDialogOpen(true);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDeleteConfig = async (config: any) => {
    if (!window.confirm(`Are you sure you want to delete the configuration "${config.name}"?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/configurations/delete/${config.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Deletion failed");

      toast({ title: "Deleted", description: "Configuration deleted successfully." });
      fetchTemplates();
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Deletion failed." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Ansible Configurations</h1>
          <p className="text-muted-foreground">Manage your automations</p>
        </div>
        <PlaybookEditor onCreate={handleCreateTemplate} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {playbooks.map((config) => (
          <div key={config.id} className="relative group border rounded-lg p-4 bg-white shadow">
            <div className="absolute top-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleViewDetails(config)}>
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDeleteConfig(config)}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div>
              <h2 className="font-semibold">{config.name}</h2>
              <p className="text-sm text-gray-500">{config.description}</p>
              <p className="text-xs mt-2 text-gray-400">Module: {config.module}</p>
              <p className="text-xs text-gray-400">Command: {config.configuration}</p>
            </div>
          </div>
        ))}
      </div>

      {/* View Details Dialog */}
      {selectedConfig && (
        <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedConfig.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              <p><strong>Description:</strong> {selectedConfig.description}</p>
              <p><strong>Module:</strong> {selectedConfig.module}</p>
              <p><strong>Command:</strong> {selectedConfig.configuration}</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
