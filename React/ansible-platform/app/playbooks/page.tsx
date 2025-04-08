import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlaybookCard } from "@/components/playbook-card"
import { PlaybookEditor } from "@/components/playbook-editor"

export default function PlaybooksPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ansible Playbooks</h1>
          <p className="text-muted-foreground">Manage and execute your automation playbooks</p>
        </div>
        <PlaybookEditor />
      </div>

      <Tabs defaultValue="all">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">All Playbooks</TabsTrigger>
            <TabsTrigger value="recent">Recently Run</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {playbooks.map((playbook) => (
              <PlaybookCard key={playbook.id} playbook={playbook} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {playbooks
              .filter((p) => p.lastRun)
              .slice(0, 3)
              .map((playbook) => (
                <PlaybookCard key={playbook.id} playbook={playbook} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {playbooks
              .filter((p) => p.favorite)
              .map((playbook) => (
                <PlaybookCard key={playbook.id} playbook={playbook} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

const playbooks = [
  {
    id: 1,
    name: "Web Server Setup",
    description: "Installs and configures Nginx, PHP, and related packages for web servers",
    tasks: 12,
    lastRun: "2 hours ago",
    status: "success",
    favorite: true,
  },
  {
    id: 2,
    name: "Database Backup",
    description: "Creates scheduled backups of PostgreSQL databases and uploads to S3",
    tasks: 8,
    lastRun: "1 day ago",
    status: "success",
    favorite: true,
  },
  {
    id: 3,
    name: "Security Updates",
    description: "Applies latest security patches and updates to all servers",
    tasks: 6,
    lastRun: "3 days ago",
    status: "failed",
    favorite: false,
  },
  {
    id: 4,
    name: "Load Balancer Configuration",
    description: "Sets up HAProxy load balancer with SSL termination",
    tasks: 15,
    lastRun: null,
    status: null,
    favorite: false,
  },
  {
    id: 5,
    name: "Docker Deployment",
    description: "Deploys containerized applications to Docker hosts",
    tasks: 10,
    lastRun: "1 week ago",
    status: "success",
    favorite: true,
  },
  {
    id: 6,
    name: "Monitoring Setup",
    description: "Installs and configures Prometheus and Grafana for monitoring",
    tasks: 18,
    lastRun: null,
    status: null,
    favorite: false,
  },
]

