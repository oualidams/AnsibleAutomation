"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlaybookCard } from "@/components/playbook-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { MoreVertical, Search } from "lucide-react";
import { CardFooter } from "@/components/ui/card";
import { ExecutePlaybook } from "@/components/execute-playbook";

export function PlaybookEditor({
  onCreate,
}: {
  onCreate: (template: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [configurations, setConfigurations] = useState<any[]>([]);
  const [selectedConfigurations, setSelectedConfigurations] = useState<
    Map<number, boolean>
  >(new Map());
  const [templateData, setTemplateData] = useState({
    name: "",
    description: "",
  });

  // Fetch available configurations
  const fetchConfigurations = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/configurations/getConfigs"
      );
      if (!response.ok) throw new Error("Failed to fetch configurations");

      const data = await response.json();
      setConfigurations(data);
    } catch (error) {
      console.error("Error fetching configurations:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch configurations. Please try again.",
      });
    }
  };

  useEffect(() => {
    if (open) {
      fetchConfigurations();
    }
  }, [open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTemplateData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (id: number, checked: boolean) => {
    setSelectedConfigurations((prev) => new Map(prev).set(id, checked));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedConfigIds = Array.from(selectedConfigurations.entries())
      .filter(([_, checked]) => checked)
      .map(([id]) => id);

    if (
      !templateData.name ||
      !templateData.description ||
      selectedConfigIds.length === 0
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Please fill in all fields and select at least one configuration.",
      });
      return;
    }

    const template = {
      ...templateData,
      configurations: selectedConfigIds.map((id, index) => ({
        id: id,
        position: index + 1,
      })),
    };

    setIsLoading(true);
    try {
      await onCreate(template);
      setOpen(false);
      setTemplateData({ name: "", description: "" });
      setSelectedConfigurations(new Map());
    } catch (error) {
      console.error("Error creating template:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Create Template</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                name="name"
                value={templateData.name}
                onChange={handleInputChange}
                placeholder="Enter template name"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={templateData.description}
                onChange={handleInputChange}
                placeholder="Enter template description"
                required
              />
            </div>
            <div>
              <Label>Configurations</Label>
              <div className="space-y-2">
                {configurations.map((config) => (
                  <div key={config.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`config-${config.id}`}
                      checked={selectedConfigurations.get(config.id) || false}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(config.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={`config-${config.id}`}>{config.name}</Label>
                  </div>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Template"}
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
  const [selectedPlaybook, setSelectedPlaybook] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [configNames, setConfigNames] = useState<Map<number, string>>(
    new Map()
  );
  const [search, setSearch] = useState(""); // <-- Add this


  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8000/templates/getTemplates"
      );
      if (!response.ok) throw new Error("Failed to fetch templates");

      const data = await response.json();
      setPlaybooks(data);
      toast({
        title: "Templates Fetched",
        description: "Successfully retrieved templates from the backend.",
      });
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch templates. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async (template: any) => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/templates/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
      });
      if (!response.ok) throw new Error("Failed to create template");

      const data = await response.json();
      toast({
        title: "Template Created",
        description:
          typeof data === "string"
            ? data
            : data.message || "Template successfully created.",
      });
      fetchTemplates(); // Refresh the templates after creation
    } catch (error) {
      console.error("Error creating template:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create template. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get the configuration name by ID and store it in state
  const getConfigNameById = async (id: number) => {
    if (configNames.has(id)) return configNames.get(id);

    try {
      const response = await fetch(
        `http://localhost:8000/configurations/getConfigById/${id}`
      );
      if (!response.ok) throw new Error("Failed to fetch configuration name");

      const data = await response.json();
      const name = data.name; // Assuming the backend returns { name: "Configuration Name" }

      setConfigNames((prev) => new Map(prev).set(id, name));
      return name;
    } catch (error) {
      console.error(`Error fetching configuration name for ID ${id}:`, error);
      return `Unknown Configuration (ID: ${id})`;
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    const loadConfigNames = async () => {
      if (!selectedPlaybook?.configurations) return;
  
      for (const config of selectedPlaybook.configurations) {
        if (!configNames.has(config.id)) {
          const name = await getConfigNameById(config.id);
          setConfigNames((prev) => new Map(prev).set(config.id, name));
        }
      }
    };
  
    loadConfigNames();
  }, [selectedPlaybook]);

  const handleDeleteTemplate = async (template: any) => {
    if (!window.confirm(`Are you sure you want to delete the template "${template.name}"?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/templates/delete/${template.id}`, {
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

  const handleCardClick = (playbook: any) => {
    setSelectedPlaybook(playbook);
    setIsDialogOpen(true);
  };

  const filteredPlaybooks = playbooks.filter((playbook) =>
    playbook.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Ansible Templates
          </h1>
          <p className="text-muted-foreground">
            Manage and execute your automation templates
          </p>
        </div>
        <PlaybookEditor onCreate={handleCreateTemplate} />
      </div>
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search templates by name..."
            className="pl-8 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          /></div>
        <Button variant="outline">Filter</Button>
      </div>

      <Tabs defaultValue="all">
        

        <TabsContent value="all" className="mt-6">
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {filteredPlaybooks.map((playbook) => (
      <div key={playbook.id} className="relative group border rounded-lg p-4 bg-white shadow">
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleCardClick(playbook)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteTemplate(playbook)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <h2 className="font-semibold">{playbook.name}</h2>
          <p className="text-sm text-gray-500">{playbook.description}</p>
          <p className="text-xs mt-2 text-gray-400">
            {playbook.configurations?.length || 0} configurations
          </p>
        </div>
        <br/>
        <CardFooter>
        <ExecutePlaybook playbook={playbook} />
      </CardFooter>
      </div>
    ))}
  </div>
</TabsContent>

        <TabsContent value="recent" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {playbooks
              .filter((p) => p.lastRun)
              .slice(0, 3)
              .map((playbook) => (
                <div
                  key={playbook.id}
                  onClick={() => handleCardClick(playbook)}
                >
                  <PlaybookCard playbook={playbook} />
                </div>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {playbooks
              .filter((p) => p.favorite)
              .map((playbook) => (
                <div
                  key={playbook.id}
                  onClick={() => handleCardClick(playbook)}
                >
                  <PlaybookCard playbook={playbook} />
                </div>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog for Playbook Details */}
<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <DialogContent className="sm:max-w-[600px]">
    {selectedPlaybook && (
      <div className="relative group border rounded-lg p-4 bg-white shadow">
        
        <DialogHeader>
          <DialogTitle>{selectedPlaybook.name}</DialogTitle>
          <DialogDescription>
            <div>
              <strong>Description:</strong> {selectedPlaybook.description}
            </div>
            <div className="mt-2">
              <strong>Configurations:</strong>
              <ul className="space-y-3 pl-5 mt-2">
                {selectedPlaybook.configurations
                  .sort((a: any, b: any) => a.position - b.position)
                  .map((config: any) => (
                    <li key={config.configuration.id} className="flex items-center space-x-3">
                      <span className="text-gray-600 font-semibold">{config.position}.</span>
                      <span>{config.configuration.name}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </DialogDescription>
        </DialogHeader>
      </div>
    )}
  </DialogContent>
</Dialog>

    </div>
  );
}
