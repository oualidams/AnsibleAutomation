"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BarChart3, Calendar, Cog, Database, LayoutDashboard, PlaySquare, Server, Terminal } from "lucide-react"

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Servers",
    icon: Server,
    href: "/servers",
  },
  {
    label: "Inventory",
    icon: Database,
    href: "/inventory",
  },
  {
    label: "Playbooks",
    icon: PlaySquare,
    href: "/playbooks",
  },
  {
    label: "Executions",
    icon: Terminal,
    href: "/executions",
  },
  {
    label: "Schedules",
    icon: Calendar,
    href: "/schedules",
  },
  {
    label: "Backend Test",
    icon: Terminal,
    href: "/test-backend",
  },
  {
    label: "Monitoring",
    icon: BarChart3,
    href: "/monitoring",
  },
  {
    label: "Settings",
    icon: Cog,
    href: "/settings",
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden border-r bg-background md:block w-64">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Terminal className="h-6 w-6" />
            <span>Ansible Platform</span>
          </Link>
        </div>
        <ScrollArea className="flex-1 py-2">
          <nav className="grid gap-1 px-2">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={pathname === route.href ? "secondary" : "ghost"}
                className={cn("justify-start gap-2", pathname === route.href && "bg-secondary")}
                asChild
              >
                <Link href={route.href}>
                  <route.icon className="h-4 w-4" />
                  {route.label}
                </Link>
              </Button>
            ))}
          </nav>
        </ScrollArea>
      </div>
    </div>
  )
}

