"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PlusCircle, MoreHorizontal } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Sample roles and permissions
const defaultRoles = [
  {
    id: 1,
    name: "Administrator",
    description: "Full access to all features",
    users: 2,
    permissions: {
      servers: { view: true, create: true, edit: true, delete: true },
      playbooks: { view: true, create: true, edit: true, delete: true, execute: true },
      executions: { view: true, cancel: true },
      users: { view: true, create: true, edit: true, delete: true },
      settings: { view: true, edit: true },
    },
  },
  {
    id: 2,
    name: "Operator",
    description: "Can manage servers and run playbooks",
    users: 5,
    permissions: {
      servers: { view: true, create: true, edit: true, delete: false },
      playbooks: { view: true, create: false, edit: false, delete: false, execute: true },
      executions: { view: true, cancel: true },
      users: { view: false, create: false, edit: false, delete: false },
      settings: { view: false, edit: false },
    },
  },
  {
    id: 3,
    name: "Viewer",
    description: "Read-only access to servers and executions",
    users: 8,
    permissions: {
      servers: { view: true, create: false, edit: false, delete: false },
      playbooks: { view: true, create: false, edit: false, delete: false, execute: false },
      executions: { view: true, cancel: false },
      users: { view: false, create: false, edit: false, delete: false },
      settings: { view: false, edit: false },
    },
  },
]

export function RoleManagement() {
  const [roles, setRoles] = useState(defaultRoles)
  const [selectedRole, setSelectedRole] = useState(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [newRoleDialogOpen, setNewRoleDialogOpen] = useState(false)
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: {
      servers: { view: false, create: false, edit: false, delete: false },
      playbooks: { view: false, create: false, edit: false, delete: false, execute: false },
      executions: { view: false, cancel: false },
      users: { view: false, create: false, edit: false, delete: false },
      settings: { view: false, edit: false },
    },
  })
  const { toast } = useToast()

  const handleEditRole = (role) => {
    setSelectedRole(role)
    setEditDialogOpen(true)
  }

  const handleSaveRole = () => {
    if (selectedRole) {
      setRoles(roles.map((r) => (r.id === selectedRole.id ? selectedRole : r)))
      toast({
        title: "Role updated",
        description: `Successfully updated role: ${selectedRole.name}`,
      })
      setEditDialogOpen(false)
    }
  }

  const handleCreateRole = () => {
    if (!newRole.name) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Role name is required",
      })
      return
    }

    const newId = Math.max(...roles.map((r) => r.id)) + 1
    setRoles([...roles, { ...newRole, id: newId, users: 0 }])
    toast({
      title: "Role created",
      description: `Successfully created role: ${newRole.name}`,
    })
    setNewRoleDialogOpen(false)
    setNewRole({
      name: "",
      description: "",
      permissions: {
        servers: { view: false, create: false, edit: false, delete: false },
        playbooks: { view: false, create: false, edit: false, delete: false, execute: false },
        executions: { view: false, cancel: false },
        users: { view: false, create: false, edit: false, delete: false },
        settings: { view: false, edit: false },
      },
    })
  }

  const togglePermission = (role, category, permission) => {
    const updatedRole = {
      ...role,
      permissions: {
        ...role.permissions,
        [category]: {
          ...role.permissions[category],
          [permission]: !role.permissions[category][permission],
        },
      },
    }

    if (selectedRole) {
      setSelectedRole(updatedRole)
    } else {
      setNewRole(updatedRole)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl">Role Management</CardTitle>
          <CardDescription>Manage user roles and permissions</CardDescription>
        </div>
        <Button onClick={() => setNewRoleDialogOpen(true)} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Create Role
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>{role.users}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.servers.view && (
                      <Badge variant="outline" className="text-xs">
                        Servers
                      </Badge>
                    )}
                    {role.permissions.playbooks.view && (
                      <Badge variant="outline" className="text-xs">
                        Playbooks
                      </Badge>
                    )}
                    {role.permissions.playbooks.execute && (
                      <Badge variant="outline" className="text-xs">
                        Execute
                      </Badge>
                    )}
                    {role.permissions.users.view && (
                      <Badge variant="outline" className="text-xs">
                        Users
                      </Badge>
                    )}
                    {role.permissions.settings.view && (
                      <Badge variant="outline" className="text-xs">
                        Settings
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEditRole(role)}>Edit role</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>View users</DropdownMenuItem>
                      <DropdownMenuItem>Clone role</DropdownMenuItem>
                      {role.id > 3 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">Delete role</DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Modify role details and permissions</DialogDescription>
          </DialogHeader>

          {selectedRole && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="role-name">Role Name</Label>
                <Input
                  id="role-name"
                  value={selectedRole.name}
                  onChange={(e) => setSelectedRole({ ...selectedRole, name: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role-description">Description</Label>
                <Input
                  id="role-description"
                  value={selectedRole.description}
                  onChange={(e) => setSelectedRole({ ...selectedRole, description: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label>Permissions</Label>
                <div className="border rounded-md p-4 space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Servers</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="servers-view"
                          checked={selectedRole.permissions.servers.view}
                          onCheckedChange={() => togglePermission(selectedRole, "servers", "view")}
                        />
                        <Label htmlFor="servers-view">View</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="servers-create"
                          checked={selectedRole.permissions.servers.create}
                          onCheckedChange={() => togglePermission(selectedRole, "servers", "create")}
                        />
                        <Label htmlFor="servers-create">Create</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="servers-edit"
                          checked={selectedRole.permissions.servers.edit}
                          onCheckedChange={() => togglePermission(selectedRole, "servers", "edit")}
                        />
                        <Label htmlFor="servers-edit">Edit</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="servers-delete"
                          checked={selectedRole.permissions.servers.delete}
                          onCheckedChange={() => togglePermission(selectedRole, "servers", "delete")}
                        />
                        <Label htmlFor="servers-delete">Delete</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Playbooks</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="playbooks-view"
                          checked={selectedRole.permissions.playbooks.view}
                          onCheckedChange={() => togglePermission(selectedRole, "playbooks", "view")}
                        />
                        <Label htmlFor="playbooks-view">View</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="playbooks-create"
                          checked={selectedRole.permissions.playbooks.create}
                          onCheckedChange={() => togglePermission(selectedRole, "playbooks", "create")}
                        />
                        <Label htmlFor="playbooks-create">Create</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="playbooks-edit"
                          checked={selectedRole.permissions.playbooks.edit}
                          onCheckedChange={() => togglePermission(selectedRole, "playbooks", "edit")}
                        />
                        <Label htmlFor="playbooks-edit">Edit</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="playbooks-delete"
                          checked={selectedRole.permissions.playbooks.delete}
                          onCheckedChange={() => togglePermission(selectedRole, "playbooks", "delete")}
                        />
                        <Label htmlFor="playbooks-delete">Delete</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="playbooks-execute"
                          checked={selectedRole.permissions.playbooks.execute}
                          onCheckedChange={() => togglePermission(selectedRole, "playbooks", "execute")}
                        />
                        <Label htmlFor="playbooks-execute">Execute</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Executions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="executions-view"
                          checked={selectedRole.permissions.executions.view}
                          onCheckedChange={() => togglePermission(selectedRole, "executions", "view")}
                        />
                        <Label htmlFor="executions-view">View</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="executions-cancel"
                          checked={selectedRole.permissions.executions.cancel}
                          onCheckedChange={() => togglePermission(selectedRole, "executions", "cancel")}
                        />
                        <Label htmlFor="executions-cancel">Cancel</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Users & Roles</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="users-view"
                          checked={selectedRole.permissions.users.view}
                          onCheckedChange={() => togglePermission(selectedRole, "users", "view")}
                        />
                        <Label htmlFor="users-view">View</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="users-create"
                          checked={selectedRole.permissions.users.create}
                          onCheckedChange={() => togglePermission(selectedRole, "users", "create")}
                        />
                        <Label htmlFor="users-create">Create</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="users-edit"
                          checked={selectedRole.permissions.users.edit}
                          onCheckedChange={() => togglePermission(selectedRole, "users", "edit")}
                        />
                        <Label htmlFor="users-edit">Edit</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="users-delete"
                          checked={selectedRole.permissions.users.delete}
                          onCheckedChange={() => togglePermission(selectedRole, "users", "delete")}
                        />
                        <Label htmlFor="users-delete">Delete</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Settings</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="settings-view"
                          checked={selectedRole.permissions.settings.view}
                          onCheckedChange={() => togglePermission(selectedRole, "settings", "view")}
                        />
                        <Label htmlFor="settings-view">View</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="settings-edit"
                          checked={selectedRole.permissions.settings.edit}
                          onCheckedChange={() => togglePermission(selectedRole, "settings", "edit")}
                        />
                        <Label htmlFor="settings-edit">Edit</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRole}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create New Role Dialog */}
      <Dialog open={newRoleDialogOpen} onOpenChange={setNewRoleDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>Define a new role with custom permissions</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-role-name">Role Name</Label>
              <Input
                id="new-role-name"
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                placeholder="Enter role name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new-role-description">Description</Label>
              <Input
                id="new-role-description"
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                placeholder="Describe this role's purpose"
              />
            </div>

            <div className="grid gap-2">
              <Label>Permissions</Label>
              <div className="border rounded-md p-4 space-y-4">
                {/* Same permission structure as edit dialog */}
                <div>
                  <h4 className="font-medium mb-2">Servers</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="new-servers-view"
                        checked={newRole.permissions.servers.view}
                        onCheckedChange={() => togglePermission(newRole, "servers", "view")}
                      />
                      <Label htmlFor="new-servers-view">View</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="new-servers-create"
                        checked={newRole.permissions.servers.create}
                        onCheckedChange={() => togglePermission(newRole, "servers", "create")}
                      />
                      <Label htmlFor="new-servers-create">Create</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="new-servers-edit"
                        checked={newRole.permissions.servers.edit}
                        onCheckedChange={() => togglePermission(newRole, "servers", "edit")}
                      />
                      <Label htmlFor="new-servers-edit">Edit</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="new-servers-delete"
                        checked={newRole.permissions.servers.delete}
                        onCheckedChange={() => togglePermission(newRole, "servers", "delete")}
                      />
                      <Label htmlFor="new-servers-delete">Delete</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Playbooks</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="new-playbooks-view"
                        checked={newRole.permissions.playbooks.view}
                        onCheckedChange={() => togglePermission(newRole, "playbooks", "view")}
                      />
                      <Label htmlFor="new-playbooks-view">View</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="new-playbooks-create"
                        checked={newRole.permissions.playbooks.create}
                        onCheckedChange={() => togglePermission(newRole, "playbooks", "create")}
                      />
                      <Label htmlFor="new-playbooks-create">Create</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="new-playbooks-edit"
                        checked={newRole.permissions.playbooks.edit}
                        onCheckedChange={() => togglePermission(newRole, "playbooks", "edit")}
                      />
                      <Label htmlFor="new-playbooks-edit">Edit</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="new-playbooks-delete"
                        checked={newRole.permissions.playbooks.delete}
                        onCheckedChange={() => togglePermission(newRole, "playbooks", "delete")}
                      />
                      <Label htmlFor="new-playbooks-delete">Delete</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="new-playbooks-execute"
                        checked={newRole.permissions.playbooks.execute}
                        onCheckedChange={() => togglePermission(newRole, "playbooks", "execute")}
                      />
                      <Label htmlFor="new-playbooks-execute">Execute</Label>
                    </div>
                  </div>
                </div>

                {/* Other permission sections follow the same pattern */}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRole}>Create Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
