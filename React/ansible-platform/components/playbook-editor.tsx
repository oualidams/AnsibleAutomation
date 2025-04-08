"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Upload, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Sample templates for different server types
const serverTemplates = {
  web: `---
# Web Server Setup Playbook
- name: Configure Web Server
  hosts: all
  become: yes
  tasks:
    - name: Update apt cache
      apt:
        update_cache: yes
        cache_valid_time: 3600

    - name: Install Nginx
      apt:
        name: nginx
        state: present

    - name: Start Nginx service
      service:
        name: nginx
        state: started
        enabled: yes

    - name: Configure firewall
      ufw:
        rule: allow
        name: Nginx Full
        state: enabled`,

  database: `---
# Database Server Setup Playbook
- name: Configure Database Server
  hosts: all
  become: yes
  tasks:
    - name: Update apt cache
      apt:
        update_cache: yes
        cache_valid_time: 3600

    - name: Install PostgreSQL
      apt:
        name: 
          - postgresql
          - postgresql-contrib
          - python3-psycopg2
        state: present

    - name: Ensure PostgreSQL is started
      service:
        name: postgresql
        state: started
        enabled: yes`,

  monitoring: `---
# Monitoring Server Setup Playbook
- name: Configure Monitoring Server
  hosts: all
  become: yes
  tasks:
    - name: Update apt cache
      apt:
        update_cache: yes
        cache_valid_time: 3600

    - name: Install Prometheus
      apt:
        name: prometheus
        state: present

    - name: Install Node Exporter
      apt:
        name: prometheus-node-exporter
        state: present

    - name: Ensure services are started
      service:
        name: "{{ item }}"
        state: started
        enabled: yes
      loop:
        - prometheus
        - prometheus-node-exporter`,
}

export function PlaybookEditor() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("create")
  const [playbook, setPlaybook] = useState({
    name: "",
    description: "",
    content: "",
    serverType: "",
  })
  const [file, setFile] = useState<File | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)

      // Read file content
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setPlaybook((prev) => ({
            ...prev,
            content: event.target?.result as string,
          }))
        }
      }
      reader.readAsText(selectedFile)
    }
  }

  const handleTemplateSelect = (type: string) => {
    setPlaybook((prev) => ({
      ...prev,
      serverType: type,
      content: serverTemplates[type] || "",
    }))
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPlaybook((prev) => ({
      ...prev,
      content: e.target.value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!playbook.name) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Playbook name is required",
      })
      return
    }

    if (!playbook.content) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Playbook content is required",
      })
      return
    }

    // In a real app, this would send the playbook to your FastAPI backend
    toast({
      title: "Playbook saved",
      description: `Successfully saved playbook: ${playbook.name}`,
    })

    setOpen(false)

    // Reset form
    setPlaybook({
      name: "",
      description: "",
      content: "",
      serverType: "",
    })
    setFile(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Create Playbook
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Ansible Playbook</DialogTitle>
          <DialogDescription>Create a new playbook or upload an existing one</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create New</TabsTrigger>
            <TabsTrigger value="upload">Upload File</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-4">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Playbook Name</Label>
                  <Input
                    id="name"
                    value={playbook.name}
                    onChange={(e) => setPlaybook((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter a name for this playbook"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={playbook.description}
                    onChange={(e) => setPlaybook((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this playbook does"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="template">Server Template</Label>
                  <Select value={playbook.serverType} onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a server template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web">Web Server</SelectItem>
                      <SelectItem value="database">Database Server</SelectItem>
                      <SelectItem value="monitoring">Monitoring Server</SelectItem>
                      <SelectItem value="custom">Custom (Blank)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Select a template or start from scratch with "Custom"</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="content">Playbook Content (YAML)</Label>
                  <Textarea
                    id="content"
                    value={playbook.content}
                    onChange={handleContentChange}
                    placeholder="# Enter your Ansible playbook YAML here"
                    className="font-mono text-sm h-80"
                  />
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button type="submit" className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Playbook
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="upload-name">Playbook Name</Label>
                  <Input
                    id="upload-name"
                    value={playbook.name}
                    onChange={(e) => setPlaybook((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter a name for this playbook"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="upload-description">Description</Label>
                  <Textarea
                    id="upload-description"
                    value={playbook.description}
                    onChange={(e) => setPlaybook((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this playbook does"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="file">Playbook File (YAML)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="file"
                      type="file"
                      accept=".yml,.yaml"
                      onChange={handleFileChange}
                      required={!playbook.content}
                    />
                    <Button type="button" variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  {file && (
                    <p className="text-xs text-muted-foreground">
                      Selected: {file.name} ({Math.round(file.size / 1024)} KB)
                    </p>
                  )}
                </div>

                {playbook.content && (
                  <div className="grid gap-2">
                    <Label htmlFor="preview">File Preview</Label>
                    <Textarea
                      id="preview"
                      value={playbook.content}
                      readOnly
                      className="font-mono text-sm h-60 bg-muted"
                    />
                  </div>
                )}
              </div>

              <DialogFooter className="mt-6">
                <Button type="submit" className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Playbook
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

