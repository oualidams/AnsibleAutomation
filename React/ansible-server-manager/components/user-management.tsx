"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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
import { Search, Plus, Edit, Trash2, UserPlus, Key, Users, UserCog, Shield } from "lucide-react"

export default function UserManagement() {
  const [users, setUsers] = useState([
    {
      id: "user-001",
      username: "admin",
      fullname: "Administrator",
      uid: 1000,
      group: "admin",
      lastActive: "2023-10-25 10:30:15",
      servers: ["srv-web-01", "srv-web-02", "srv-db-01", "srv-app-01", "srv-storage-01", "srv-backup-01"],
    },
    {
      id: "user-002",
      username: "devops",
      fullname: "DevOps User",
      uid: 1001,
      group: "devops",
      lastActive: "2023-10-25 09:15:22",
      servers: ["srv-web-01", "srv-web-02", "srv-app-01"],
    },
    {
      id: "user-003",
      username: "developer",
      fullname: "Developer User",
      uid: 1002,
      group: "developers",
      lastActive: "2023-10-24 16:45:30",
      servers: ["srv-app-01"],
    },
    {
      id: "user-004",
      username: "dbadmin",
      fullname: "Database Administrator",
      uid: 1003,
      group: "dbadmin",
      lastActive: "2023-10-24 14:20:10",
      servers: ["srv-db-01"],
    },
    {
      id: "user-005",
      username: "backup",
      fullname: "Backup User",
      uid: 1004,
      group: "backup",
      lastActive: "2023-10-23 22:10:45",
      servers: ["srv-backup-01", "srv-storage-01"],
    },
  ])

  const [groups, setGroups] = useState([
    {
      id: "group-001",
      name: "admin",
      description: "Administrator group with full access",
      gid: 1000,
      members: ["admin"],
    },
    {
      id: "group-002",
      name: "devops",
      description: "DevOps team with deployment access",
      gid: 1001,
      members: ["devops"],
    },
    {
      id: "group-003",
      name: "developers",
      description: "Development team with limited access",
      gid: 1002,
      members: ["developer"],
    },
    {
      id: "group-004",
      name: "dbadmin",
      description: "Database administrators",
      gid: 1003,
      members: ["dbadmin"],
    },
    {
      id: "group-005",
      name: "backup",
      description: "Backup service accounts",
      gid: 1004,
      members: ["backup"],
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.group.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const selectedUserData = users.find((user) => user.id === selectedUser)
  const selectedGroupData = groups.find((group) => group.id === selectedGroup)

  return (
    <Tabs defaultValue="users" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="users" onClick={() => setSelectedGroup(null)}>
          Users
        </TabsTrigger>
        <TabsTrigger value="groups" onClick={() => setSelectedUser(null)}>
          Groups
        </TabsTrigger>
      </TabsList>

      <TabsContent value="users" className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                New User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>Add a new user to be provisioned on servers</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Username
                  </Label>
                  <Input id="username" placeholder="e.g., jsmith" className="col-span-3" />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fullname" className="text-right">
                    Full Name
                  </Label>
                  <Input id="fullname" placeholder="e.g., John Smith" className="col-span-3" />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="group" className="text-right">
                    Primary Group
                  </Label>
                  <select
                    id="group"
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {groups.map((group) => (
                      <option key={group.id} value={group.name}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="servers" className="text-right">
                    Servers
                  </Label>
                  <div className="col-span-3 flex flex-wrap gap-2">
                    <Badge variant="outline">srv-web-01</Badge>
                    <Badge variant="outline">srv-web-02</Badge>
                    <Badge variant="outline">srv-app-01</Badge>
                    <Badge
                      variant="outline"
                      className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
                    >
                      + Add More
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ssh-key" className="text-right">
                    SSH Key
                  </Label>
                  <div className="col-span-3">
                    <Button variant="outline" className="w-full">
                      <Key className="h-4 w-4 mr-2" />
                      Generate SSH Key
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="submit">Create User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="border rounded-md">
              {filteredUsers.length > 0 ? (
                <div className="divide-y">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`p-3 cursor-pointer hover:bg-muted/50 ${selectedUser === user.id ? "bg-muted" : ""}`}
                      onClick={() => setSelectedUser(user.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 p-2 rounded-full text-primary">
                          <Users className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-sm text-muted-foreground">{user.fullname}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">No users found</div>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            {selectedUserData ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <CardTitle>{selectedUserData.username}</CardTitle>
                      <Badge variant="outline">{selectedUserData.group}</Badge>
                    </div>
                    <CardDescription>{selectedUserData.fullname}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-500">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="details">
                    <TabsList className="grid grid-cols-3 mb-4">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="servers">Servers</TabsTrigger>
                      <TabsTrigger value="ssh-keys">SSH Keys</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">Username</div>
                          <div>{selectedUserData.username}</div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-sm font-medium">Full Name</div>
                          <div>{selectedUserData.fullname}</div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-sm font-medium">User ID</div>
                          <div>{selectedUserData.uid}</div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-sm font-medium">Primary Group</div>
                          <div>{selectedUserData.group}</div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-sm font-medium">Last Active</div>
                          <div>{selectedUserData.lastActive}</div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-sm font-medium">Server Access</div>
                          <div>{selectedUserData.servers.length} servers</div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="servers">
                      <div className="border rounded-md">
                        <div className="p-3 font-medium border-b">Server Access</div>
                        <div className="divide-y">
                          {selectedUserData.servers.map((server, i) => (
                            <div key={i} className="p-3 flex items-center justify-between">
                              <div>{server}</div>
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-500">
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="ssh-keys">
                      <div className="space-y-4">
                        <div className="border rounded-md">
                          <div className="p-3 font-medium border-b flex justify-between items-center">
                            <div>SSH Keys</div>
                            <Button variant="outline" size="sm">
                              <Key className="h-4 w-4 mr-2" />
                              Add Key
                            </Button>
                          </div>
                          <div className="divide-y">
                            <div className="p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium">id_rsa (2048-bit RSA)</div>
                                  <div className="text-sm text-muted-foreground mt-1">
                                    Added: 2023-10-01 • Last used: 2023-10-25
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-500">
                                  Remove
                                </Button>
                              </div>
                              <div className="mt-2 bg-muted p-2 rounded-md font-mono text-xs overflow-x-auto">
                                ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC6o...truncated...
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Reset Password</Button>
                  <Button>Apply Changes</Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="h-full flex items-center justify-center border rounded-md p-8">
                <div className="text-center">
                  <UserCog className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No User Selected</h3>
                  <p className="text-muted-foreground">Select a user from the list to view their details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="groups" className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search groups..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Group
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
                <DialogDescription>Add a new user group to be provisioned on servers</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="groupname" className="text-right">
                    Group Name
                  </Label>
                  <Input id="groupname" placeholder="e.g., developers" className="col-span-3" />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Input id="description" placeholder="e.g., Development team" className="col-span-3" />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="members" className="text-right">
                    Members
                  </Label>
                  <div className="col-span-3 flex flex-wrap gap-2">
                    <Badge variant="outline">developer</Badge>
                    <Badge
                      variant="outline"
                      className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
                    >
                      + Add User
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="servers" className="text-right">
                    Servers
                  </Label>
                  <div className="col-span-3 flex flex-wrap gap-2">
                    <Badge variant="outline">srv-app-01</Badge>
                    <Badge
                      variant="outline"
                      className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
                    >
                      + Add More
                    </Badge>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="submit">Create Group</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="border rounded-md">
              {filteredGroups.length > 0 ? (
                <div className="divide-y">
                  {filteredGroups.map((group) => (
                    <div
                      key={group.id}
                      className={`p-3 cursor-pointer hover:bg-muted/50 ${selectedGroup === group.id ? "bg-muted" : ""}`}
                      onClick={() => setSelectedGroup(group.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 p-2 rounded-full text-primary">
                          <Shield className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{group.name}</div>
                          <div className="text-sm text-muted-foreground">{group.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">No groups found</div>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            {selectedGroupData ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{selectedGroupData.name}</CardTitle>
                    <CardDescription>{selectedGroupData.description}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-500">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="details">
                    <TabsList className="grid grid-cols-2 mb-4">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="members">Members</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">Group Name</div>
                          <div>{selectedGroupData.name}</div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-sm font-medium">Group ID</div>
                          <div>{selectedGroupData.gid}</div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-sm font-medium">Description</div>
                          <div>{selectedGroupData.description}</div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-sm font-medium">Members</div>
                          <div>{selectedGroupData.members.length} users</div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="members">
                      <div className="border rounded-md">
                        <div className="p-3 font-medium border-b flex justify-between items-center">
                          <div>Group Members</div>
                          <Button variant="outline" size="sm">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Member
                          </Button>
                        </div>
                        <div className="divide-y">
                          {selectedGroupData.members.map((member, i) => (
                            <div key={i} className="p-3 flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <div>{member}</div>
                              </div>
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-500">
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button>Apply Changes</Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="h-full flex items-center justify-center border rounded-md p-8">
                <div className="text-center">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Group Selected</h3>
                  <p className="text-muted-foreground">Select a group from the list to view its details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}

