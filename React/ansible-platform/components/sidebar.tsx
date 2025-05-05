"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BarChart3, Calendar, Cog, Database, LayoutDashboard, PlaySquare, Server, Terminal, Menu } from "lucide-react"
import { useState, useEffect } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"

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
    label: "Terminal",
    icon: Terminal,
    href: "/command",
  },
  {
    label: "Inventory",
    icon: Database,
    href: "/inventory",
  },
  {
    label: "Teplates",
    icon: PlaySquare,
    href: "/playbooks",
  },
  {
    label: "Schedules",
    icon: Calendar,
    href: "/schedules",
  },
  {
    label: "Executions",
    icon: Terminal,
    href: "/executions",
  },
  {
    label: "Settings",
    icon: Cog,
    href: "/settings",
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Terminal className="h-6 w-6" />
          <span>Ansible Platform</span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <nav className="grid gap-1 px-2 py-2">
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
  )

  return (
    <>
      {/* Desktop Sidebar - Fixed position with overflow scrolling */}
      <div className="hidden md:block md:fixed md:inset-y-0 md:z-10 md:w-64 md:border-r md:bg-background">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-40 md:hidden"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Content Offset for Desktop */}
      <div className="hidden md:block md:w-64" />
    </>
  )
}
