"use client"

import { useState } from "react"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  User,
  FileText,
  Briefcase,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  BarChart3,
  ChevronLeft,
  LucideProps,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import React from "react"

// Define the type for navigation items
interface NavItem {
  href: string
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>
  label: string
  badge?: string // Make badge optional
}

interface SidebarProps {
  userRole: "JOBSEEKER" | "JOBPROVIDER" | "ADMIN"
}

export function Sidebar({ userRole }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const jobSeekerNavItems: NavItem[] = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/profile", icon: User, label: "My Profile" },
    { href: "/dashboard/applications", icon: Briefcase, label: "Applications", badge: "3" },
    { href: "/dashboard/resumes", icon: FileText, label: "Resumes" },
    { href: "/dashboard/notifications", icon: Bell, label: "Notifications", badge: "2" },
  ]

  const jobProviderNavItems: NavItem[] = [
    { href: "/dashboard/employer", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/employer/jobs", icon: Briefcase, label: "Manage Jobs" },
    { href: "/dashboard/employer/jobs/new", icon: FileText, label: "Post Job" },
    { href: "/dashboard/applications", icon: Users, label: "Applications" },
    { href: "/dashboard/notifications", icon: Bell, label: "Notifications" },
  ]

  const navItems = userRole === "JOBSEEKER" ? jobSeekerNavItems : jobProviderNavItems

  const handleLogout = () => {
    logout()
  }

  if (!user) return null

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <div className={cn("transition-all duration-300", isCollapsed && "w-0 overflow-hidden opacity-0")}>
          <Logo />
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="hidden lg:flex">
          <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300", isCollapsed && "rotate-180")} />
        </Button>
      </div>

      <div className="p-4 border-b border-border/50">
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div className={cn("flex-1 min-w-0 transition-all duration-300", isCollapsed && "w-0 overflow-hidden opacity-0")}>
            <p className="text-sm font-semibold truncate">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-muted-foreground truncate">
              {userRole === 'JOBSEEKER' ? 'Looking for opportunities' : 'Hiring Manager'}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        <TooltipProvider>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const linkContent = (
              <>
                <item.icon className="h-4 w-4" />
                <span className={cn("flex-1", isCollapsed && "hidden")}>{item.label}</span>
                {item.badge && (
                  <Badge
                    variant={isActive ? "secondary" : "default"}
                    className={cn("text-xs", isCollapsed && "hidden", isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary")}
                  >
                    {item.badge}
                  </Badge>
                )}
              </>
            )

            const linkClasses = cn(
              "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-gradient-to-r from-primary to-blue-600 text-white shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              isCollapsed && "justify-center"
            )

            if (isCollapsed) {
              return (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link href={item.href} className={linkClasses}>
                      {linkContent}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="flex items-center gap-4">
                    {item.label}
                    {item.badge && <Badge variant="secondary">{item.badge}</Badge>}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return (
              <Link key={item.href} href={item.href} className={linkClasses}>
                {linkContent}
              </Link>
            )
          })}
        </TooltipProvider>
      </nav>

      <div className="p-2 border-t border-border/50 space-y-1">
        <div className={cn(!isCollapsed && "hidden")}>
          <ThemeToggle />
        </div>
        <div className={cn("items-center justify-between px-3", isCollapsed ? "hidden" : "flex")}>
          <p className="text-sm text-muted-foreground">Theme</p>
          <ThemeToggle />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/dashboard/settings"
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  pathname === '/dashboard/settings'
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  isCollapsed && "justify-center"
                )}
              >
                <Settings className="h-4 w-4" />
                <span className={cn(isCollapsed && "hidden")}>Settings</span>
              </Link>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">
                Settings
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className={cn(
                  "w-full justify-start text-muted-foreground hover:text-red-600 hover:bg-red-500/10 gap-3 px-3 py-2.5 h-auto",
                  isCollapsed && "justify-center"
                )}
              >
                <LogOut className="h-4 w-4" />
                <span className={cn(isCollapsed && "hidden")}>Sign Out</span>
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">
                Sign Out
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="bg-background">
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 bg-card/95 backdrop-blur-md border-r border-border/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0 lg:transition-[width]",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "lg:w-20" : "lg:w-64"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}