"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, Copy, Server, Database, Globe, HardDrive, Activity } from "lucide-react"

export default function Templates() {
  const [templates, setTemplates] = useState([
    {
      id: "web-server",
      name: "Web Server",
      description: "NGINX with PHP-FPM and Let's Encrypt",
      type: "web",
      lastModified: "2023-10-15",
      usageCount: 5,
    },
    {
      id: "db-server",
      name: "Database Server",
      description: "PostgreSQL with automated backups",
      type: "database",
      lastModified: "2023-09-20",
      usageCount: 3,
    },
    {
      id: "app-server",
      name: "Application Server",
      description: "Node.js with PM2 process manager",
      type: "application",
      lastModified: "2023-10-05",
      usageCount: 2,
    },
    {
      id: "storage-server",
      name: "Storage Server",
      description: "NFS with LVM for scalable storage",
      type: "storage",
      lastModified: "2023-08-12",
      usageCount: 1,
    },
    {
      id: "monitoring-server",
      name: "Monitoring Server",
      description: "Prometheus, Grafana, and Node Exporter",
      type: "monitoring",
      lastModified: "2023-10-10",
      usageCount: 4,
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    type: "web",
    playbook:
      "---\n# Ansible Playbook for Web Server\n- hosts: all\n  become: yes\n  tasks:\n    - name: Update apt cache\n      apt:\n        update_cache: yes\n\n    - name: Install Nginx\n      apt:\n        name: nginx\n        state: present\n\n    - name: Start Nginx\n      service:\n        name: nginx\n        state: started\n        enabled: yes",
  })

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case "web":
        return <Globe className="h-5 w-5" />
      case "database":
        return <Database className="h-5 w-5" />
      case "application":
        return <Server className="h-5 w-5" />
      case "storage":
        return <HardDrive className="h-5 w-5" />
      case "monitoring":
        return <Activity className="h-5 w-5" />
      default:
        return <Server className="h-5 w-5" />
    }
  }

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const selectedTemplateData = templates.find((template) => template.id === selectedTemplate)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>Create a new server template with Ansible playbook</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Web Server"
                  className="col-span-3"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <select
                  id="type"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newTemplate.type}
                  onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value })}
                >
                  <option value="web">Web Server</option>
                  <option value="database">Database Server</option>
                  <option value="application">Application Server</option>
                  <option value="storage">Storage Server</option>
                  <option value="monitoring">Monitoring Server</option>
                </select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  placeholder="Brief description of the template"
                  className="col-span-3"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="playbook" className="text-right pt-2">
                  Ansible Playbook
                </Label>
                <Textarea
                  id="playbook"
                  className="col-span-3 font-mono text-sm h-64"
                  value={newTemplate.playbook}
                  onChange={(e) => setNewTemplate({ ...newTemplate, playbook: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">Save Template</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="border rounded-md">
            {filteredTemplates.length > 0 ? (
              <div className="divide-y">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 cursor-pointer hover:bg-muted/50 ${selectedTemplate === template.id ? "bg-muted" : ""}`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 p-2 rounded-md text-primary">{getTemplateIcon(template.type)}</div>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-muted-foreground">{template.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">No templates found</div>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          {selectedTemplateData ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <CardTitle>{selectedTemplateData.name}</CardTitle>
                    <Badge variant="outline" className="ml-2">
                      {selectedTemplateData.type}
                    </Badge>
                  </div>
                  <CardDescription>{selectedTemplateData.description}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="playbook">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="playbook">Ansible Playbook</TabsTrigger>
                    <TabsTrigger value="variables">Variables</TabsTrigger>
                    <TabsTrigger value="usage">Usage</TabsTrigger>
                  </TabsList>

                  <TabsContent value="playbook">
                    <div className="bg-muted p-4 rounded-md font-mono text-sm whitespace-pre overflow-auto h-96">
                      {selectedTemplateData.id === "web-server"
                        ? `---
# Ansible Playbook for Web Server
- hosts: all
  become: yes
  tasks:
    - name: Update apt cache
      apt:
        update_cache: yes

    - name: Install Nginx and PHP
      apt:
        name:
          - nginx
          - php-fpm
          - php-mysql
        state: present

    - name: Start Nginx
      service:
        name: nginx
        state: started
        enabled: yes

    - name: Start PHP-FPM
      service:
        name: php7.4-fpm
        state: started
        enabled: yes

    - name: Install Certbot
      apt:
        name:
          - certbot
          - python3-certbot-nginx
        state: present

    - name: Copy Nginx virtual host configuration
      template:
        src: templates/nginx-vhost.conf.j2
        dest: /etc/nginx/sites-available/{{ domain }}
        owner: root
        group: root
        mode: '0644'
      notify: Reload Nginx

    - name: Enable Nginx virtual host
      file:
        src: /etc/nginx/sites-available/{{ domain }}
        dest: /etc/nginx/sites-enabled/{{ domain }}
        state: link
      notify: Reload Nginx

  handlers:
    - name: Reload Nginx
      service:
        name: nginx
        state: reloaded`
                        : selectedTemplateData.id === "db-server"
                          ? `---
# Ansible Playbook for Database Server
- hosts: all
  become: yes
  tasks:
    - name: Update apt cache
      apt:
        update_cache: yes

    - name: Install PostgreSQL
      apt:
        name:
          - postgresql
          - postgresql-contrib
          - python3-psycopg2
        state: present

    - name: Ensure PostgreSQL is started and enabled
      service:
        name: postgresql
        state: started
        enabled: yes

    - name: Create PostgreSQL user
      postgresql_user:
        name: "{{ db_user }}"
        password: "{{ db_password }}"
        role_attr_flags: CREATEDB,SUPERUSER
      become: yes
      become_user: postgres

    - name: Create PostgreSQL database
      postgresql_db:
        name: "{{ db_name }}"
        owner: "{{ db_user }}"
      become: yes
      become_user: postgres

    - name: Configure PostgreSQL to listen on all interfaces
      lineinfile:
        path: /etc/postgresql/12/main/postgresql.conf
        regexp: "^#listen_addresses"
        line: "listen_addresses = '*'"
      notify: Restart PostgreSQL

    - name: Configure PostgreSQL client authentication
      template:
        src: templates/pg_hba.conf.j2
        dest: /etc/postgresql/12/main/pg_hba.conf
        owner: postgres
        group: postgres
        mode: '0640'
      notify: Restart PostgreSQL

    - name: Set up automated backups
      cron:
        name: "PostgreSQL backup"
        hour: "2"
        minute: "0"
        job: "pg_dump -U postgres {{ db_name }} | gzip > /var/backups/postgresql/{{ db_name }}_$(date +\\%Y\\%m\\%d).sql.gz"
        user: postgres

    - name: Create backup directory
      file:
        path: /var/backups/postgresql
        state: directory
        owner: postgres
        group: postgres
        mode: '0750'

  handlers:
    - name: Restart PostgreSQL
      service:
        name: postgresql
        state: restarted`
                          : `---
# Ansible Playbook
- hosts: all
  become: yes
  tasks:
    - name: Update package cache
      apt:
        update_cache: yes
        cache_valid_time: 3600

    - name: Install required packages
      apt:
        name: "{{ item }}"
        state: present
      loop: "{{ required_packages }}"

    - name: Configure service
      template:
        src: templates/service.conf.j2
        dest: "/etc/{{ service_name }}/{{ service_name }}.conf"
        owner: root
        group: root
        mode: '0644'
      notify: Restart service

    - name: Ensure service is running and enabled
      service:
        name: "{{ service_name }}"
        state: started
        enabled: yes

  handlers:
    - name: Restart service
      service:
        name: "{{ service_name }}"
        state: restarted`}
                    </div>
                  </TabsContent>

                  <TabsContent value="variables">
                    <div className="border rounded-md">
                      <div className="p-3 font-medium border-b">Template Variables</div>
                      <div className="divide-y">
                        {selectedTemplateData.id === "web-server"
                          ? [
                              { name: "domain", description: "Domain name for the website", default: "example.com" },
                              { name: "webroot", description: "Web root directory", default: "/var/www/html" },
                              { name: "php_version", description: "PHP version to install", default: "7.4" },
                              { name: "enable_ssl", description: "Enable HTTPS with Let's Encrypt", default: "true" },
                            ].map((variable, i) => (
                              <div key={i} className="p-3 grid grid-cols-3">
                                <div className="font-mono text-sm">{variable.name}</div>
                                <div className="text-sm">{variable.description}</div>
                                <div className="text-sm text-muted-foreground">{variable.default}</div>
                              </div>
                            ))
                          : selectedTemplateData.id === "db-server"
                            ? [
                                { name: "db_user", description: "Database username", default: "dbuser" },
                                { name: "db_password", description: "Database password", default: "generated" },
                                { name: "db_name", description: "Database name", default: "application" },
                                { name: "backup_retention", description: "Days to keep backups", default: "7" },
                              ].map((variable, i) => (
                                <div key={i} className="p-3 grid grid-cols-3">
                                  <div className="font-mono text-sm">{variable.name}</div>
                                  <div className="text-sm">{variable.description}</div>
                                  <div className="text-sm text-muted-foreground">{variable.default}</div>
                                </div>
                              ))
                            : [
                                { name: "service_name", description: "Name of the service", default: "application" },
                                {
                                  name: "required_packages",
                                  description: "List of packages to install",
                                  default: "[]",
                                },
                                {
                                  name: "config_template",
                                  description: "Configuration template",
                                  default: "default.j2",
                                },
                              ].map((variable, i) => (
                                <div key={i} className="p-3 grid grid-cols-3">
                                  <div className="font-mono text-sm">{variable.name}</div>
                                  <div className="text-sm">{variable.description}</div>
                                  <div className="text-sm text-muted-foreground">{variable.default}</div>
                                </div>
                              ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="usage">
                    <div className="space-y-4">
                      <div className="bg-muted/50 p-4 rounded-md">
                        <div className="text-sm">
                          <p className="font-medium">Usage Information</p>
                          <p className="mt-2">
                            This template has been used on {selectedTemplateData.usageCount} servers.
                          </p>
                          <p className="mt-1">Last modified: {selectedTemplateData.lastModified}</p>
                        </div>
                      </div>

                      <div className="border rounded-md">
                        <div className="p-3 font-medium border-b">Servers Using This Template</div>
                        <div className="divide-y">
                          {selectedTemplateData.id === "web-server"
                            ? [
                                { name: "Web Server 01", ip: "10.0.1.10", applied: "2023-10-01" },
                                { name: "Web Server 02", ip: "10.0.1.11", applied: "2023-10-05" },
                                { name: "Web Server 03", ip: "10.0.1.12", applied: "2023-10-10" },
                                { name: "Web Server 04", ip: "10.0.1.13", applied: "2023-10-12" },
                                { name: "Web Server 05", ip: "10.0.1.14", applied: "2023-10-15" },
                              ].map((server, i) => (
                                <div key={i} className="p-3 grid grid-cols-3">
                                  <div>{server.name}</div>
                                  <div>{server.ip}</div>
                                  <div className="text-muted-foreground">Applied: {server.applied}</div>
                                </div>
                              ))
                            : selectedTemplateData.id === "db-server"
                              ? [
                                  { name: "Database Server 01", ip: "10.0.2.10", applied: "2023-09-15" },
                                  { name: "Database Server 02", ip: "10.0.2.11", applied: "2023-09-20" },
                                  { name: "Database Server 03", ip: "10.0.2.12", applied: "2023-09-25" },
                                ].map((server, i) => (
                                  <div key={i} className="p-3 grid grid-cols-3">
                                    <div>{server.name}</div>
                                    <div>{server.ip}</div>
                                    <div className="text-muted-foreground">Applied: {server.applied}</div>
                                  </div>
                                ))
                              : [
                                  { name: "Server 01", ip: "10.0.3.10", applied: "2023-10-01" },
                                  { name: "Server 02", ip: "10.0.3.11", applied: "2023-10-05" },
                                ].map((server, i) => (
                                  <div key={i} className="p-3 grid grid-cols-3">
                                    <div>{server.name}</div>
                                    <div>{server.ip}</div>
                                    <div className="text-muted-foreground">Applied: {server.applied}</div>
                                  </div>
                                ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Export Template</Button>
                <Button>Apply to Server</Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center border rounded-md p-8">
              <div className="text-center">
                <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Template Selected</h3>
                <p className="text-muted-foreground">Select a template from the list to view its details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

