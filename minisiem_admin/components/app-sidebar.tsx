"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import {
  LayoutDashboard,
  LogOut,
  User2,
  ShieldAlert,
  TerminalSquare,
  BotMessageSquare,
  AtomIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { useEffect, useState } from "react"
import LogoutAlert from "./LogoutAlert"
import Logo from "./Logo"
import { requireAuth } from "@/app/utils/AuthValidator"
import { is } from "date-fns/locale"

export function AppSidebar() {
  useEffect(() => {
    requireAuth()
  }, [])

  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    // Clear auth token and any other relevant data
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    // Redirect to login page
    router.push("/login")
  }

  const [userObj, setUserObj] = useState<any>(null)

  useEffect(() => {
    const userRaw = localStorage.getItem("user")
    if (userRaw) {
      try {
        setUserObj(JSON.parse(userRaw))
      } catch (e) {}
    }
  }, [])

  const user_name = userObj && userObj.fullname ? userObj.fullname : "User"
  const user_email = userObj && userObj.email ? userObj.email : ""

  const pathname = usePathname()
  const isDashboard = pathname === "/dashboard"
  const isLogs = pathname === "/logs"
  const isAlerts = pathname === "/alerts"
  const isChat = pathname === "/chat"
  const isSimulation = pathname === "/simulation"

  return (
    <>
      <Sidebar className="border-r border-sidebar-border bg-sidebar-DEFAULT">
        {/* Header / Logo */}
        <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
          <Logo />
        </SidebarHeader>

        {/* Main Navigation */}
        <SidebarContent className="px-2 py-3">
          <SidebarMenu>
            {/* Dashboard */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link
                  href="/dashboard"
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
                    isDashboard
                      ? "bg-primary/15 text-primary ring-1 ring-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-cardForeground",
                  )}
                >
                  <LayoutDashboard
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isDashboard
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-cardForeground",
                    )}
                  />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Alerts */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link
                  href="/alerts"
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
                    isAlerts
                      ? "bg-primary/15 text-primary ring-1 ring-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-cardForeground",
                  )}
                >
                  <ShieldAlert
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isAlerts
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-cardForeground",
                    )}
                  />
                  <span>Alerts</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Logs */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link
                  href="/logs"
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
                    isLogs
                      ? "bg-primary/15 text-primary ring-1 ring-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-cardForeground",
                  )}
                >
                  <TerminalSquare
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isLogs
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-cardForeground",
                    )}
                  />
                  <span>Logs</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Chat Assistant */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link
                  href="/chat"
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
                    isChat
                      ? "bg-primary/15 text-primary ring-1 ring-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-cardForeground",
                  )}
                >
                  <BotMessageSquare
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isChat
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-cardForeground",
                    )}
                  />
                  <span>Chat</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* SImulation */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link
                  href="/simulation"
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150 mt-4",
                    isSimulation
                      ? "bg-primary/15 text-primary ring-1 ring-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-cardForeground",
                  )}
                >
                  <AtomIcon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isSimulation
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-cardForeground",
                    )}
                  />
                  <span>Simulation</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        {/* Footer / User */}
        <SidebarFooter className="border-t border-sidebar-border px-3 py-3 flex flex-col gap-3">
          {/* System status */}
          <div className="flex items-center justify-between rounded-md bg-card px-3 py-1.5 ring-1 ring-border">
            <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              System
            </span>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              <span className="flex gap-2 justify-between items-center text-[10px] font-semibold text-success">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Online
              </span>
            </div>
          </div>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* User row */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-cardForeground transition-all duration-150">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted ring-1 ring-muted">
                  <User2 className="h-3.5 w-3.5 text-cardForeground" />
                </div>

                <div className="flex flex-col leading-none">
                  <span className="text-xs font-medium text-cardForeground">
                    {user_name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {user_email}
                  </span>
                </div>
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => setOpen(true)}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      {/* ALERT DIALOG COMPOENT RENDER  */}
      <LogoutAlert
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  )
}
