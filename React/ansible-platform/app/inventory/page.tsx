import { InventoryManager } from "@/components/inventory-manager"

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">Manage your Ansible inventory groups and servers</p>
      </div>

      <InventoryManager />
    </div>
  )
}
