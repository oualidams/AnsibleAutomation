"use client";

import React, { useEffect, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Upload, Save } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";

// Templates prédéfinis
const serverTemplates = {
  web: `...`, // comme avant
  database: `...`,
  monitoring: `...`,
};

export function PlaybookEditor() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  const [configurations, setConfigurations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const [playbook, setPlaybook] = useState({
    name: "",
    description: "",
    content: "",
    serverType: "",
    configurations: [] as number[],
  });

  const resetTemplateForm = () => {
    setPlaybook({
      name: "",
      description: "",
      content: "",
      serverType: "",
      configurations: [],
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPlaybook((prev) => ({
          ...prev,
          content: event.target?.result as string,
        }));
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleTemplateSelect = (type: string) => {
    setPlaybook((prev) => ({
      ...prev,
      serverType: type,
      content: serverTemplates[type] || "",
    }));
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPlaybook((prev) => ({
      ...prev,
      content: e.target.value,
    }));
  };

  const handleCreateTemplate = async () => {
    const { name, serverType, content, description } = playbook;

    if (!name || !serverType || !content) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/templates/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type: serverType,
          content,
          description,
        }),
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

      resetTemplateForm();
      setOpen(false);
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleCreateTemplate();
  };

  useEffect(() => {
    if (open && configurations.length === 0) {
      fetchConfigurations();
    }
  }, [open]);

  const fetchConfigurations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8000/configurations/getConfigs"
      );
      if (!response.ok) throw new Error("Failed to fetch configurations");

      const data = await response.json();
      setConfigurations(data);
      toast({
        title: "Configurations Fetched",
        description: "Successfully retrieved configurations from the backend.",
      });
    } catch (error) {
      console.error("Error fetching configurations:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch configurations. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Create Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Template</DialogTitle>
          <DialogDescription>Create a new template</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create New</TabsTrigger>
            <TabsTrigger value="upload">Upload File</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-4">
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={playbook.name}
                  onChange={(e) =>
                    setPlaybook((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={playbook.description}
                  onChange={(e) =>
                    setPlaybook((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label>Environment</Label>
                <Select
                  value={playbook.serverType}
                  onValueChange={handleTemplateSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a server environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">Web Server</SelectItem>
                    <SelectItem value="database">Database Server</SelectItem>
                    <SelectItem value="monitoring">
                      Monitoring Server
                    </SelectItem>
                    <SelectItem value="custom">Custom (Blank)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Configurations</Label>
                {configurations.map((config) => (
                  <div key={config.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`config-${config.id}`}
                      checked={playbook.configurations.includes(config.id)}
                      onCheckedChange={(checked) => {
                        setPlaybook((prev) => {
                          const updated = checked
                            ? [...prev.configurations, config.id]
                            : prev.configurations.filter(
                                (id) => id !== config.id
                              );
                          return { ...prev, configurations: updated };
                        });
                      }}
                    />
                    <Label htmlFor={`config-${config.id}`}>{config.name}</Label>
                  </div>
                ))}
              </div>

              <DialogFooter className="mt-4">
                <Button type="submit" disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Template
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <div className="grid gap-4">
              <Label htmlFor="upload">Upload Playbook File</Label>
              <Input
                type="file"
                accept=".yml,.yaml,.txt"
                onChange={handleFileChange}
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
