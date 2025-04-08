import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Dashboard from "@/components/dashboard"
import ServerList from "@/components/server-list"
import NewServer from "@/components/new-server"
import Templates from "@/components/templates"
import Configurations from "@/components/configurations"
import Logs from "@/components/logs"
import UserManagement from "@/components/user-management"

export default function Home() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Ansible Server Management Platform</h1>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid grid-cols-7 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="servers">Servers</TabsTrigger>
          <TabsTrigger value="new-server">New Server</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="configurations">Configurations</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Dashboard />
        </TabsContent>

        <TabsContent value="servers">
          <ServerList />
        </TabsContent>

        <TabsContent value="new-server">
          <NewServer />
        </TabsContent>

        <TabsContent value="templates">
          <Templates />
        </TabsContent>

        <TabsContent value="configurations">
          <Configurations />
        </TabsContent>

        <TabsContent value="logs">
          <Logs />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}

