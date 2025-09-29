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
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface SidebarProps {
  userRole: "JOBSEEKER" | "JOBPROVIDER"
}

export function Sidebar({ userRole }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { logout } = useAuth()

  const jobSeekerNavItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/profile", icon: User, label: "My Profile" },
    { href: "/dashboard/applications", icon: Briefcase, label: "Applications", badge: "3" },
    { href: "/dashboard/resumes", icon: FileText, label: "Resumes" },
    { href: "/dashboard/notifications", icon: Bell, label: "Notifications", badge: "2" },
  ]

  const jobProviderNavItems = [
    { href: "/dashboard/employer", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/jobs", icon: Briefcase, label: "Manage Jobs" },
    { href: "/dashboard/jobs/new", icon: FileText, label: "Post Job" },
    { href: "/dashboard/candidates", icon: Users, label: "Candidates", badge: "12" },
    { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/dashboard/notifications", icon: Bell, label: "Notifications" },
  ]

  const navItems = userRole === "JOBSEEKER" ? jobSeekerNavItems : jobProviderNavItems

  const handleLogout = () => {
    logout()
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)} className="bg-background">
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 bg-card/95 backdrop-blur-md border-r border-border/50 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0 shadow-lg lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-blue-500/5">
            <div className="flex items-center justify-between">
              <Logo />
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <div className="w-8 h-8 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-lg flex items-center justify-center lg:hidden">
                  <button onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {/* This should come from user context */}
                JS
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">Job Seeker</p>
                <p className="text-xs text-muted-foreground truncate">
                  {userRole === 'JOBSEEKER' ? 'Looking for opportunities' : 'Hiring manager'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[0.98] active:scale-[0.96]",
                    isActive
                      ? "bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 hover:border-primary/20",
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    isActive 
                      ? "bg-white/20" 
                      : "bg-muted/50 group-hover:bg-primary/10"
                  )}>
                    <item.icon className={cn(
                      "h-4 w-4 transition-colors",
                      isActive ? "text-white" : "text-muted-foreground group-hover:text-primary"
                    )} />
                  </div>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <Badge 
                      variant={isActive ? "secondary" : "outline"} 
                      className={cn(
                        "text-xs transition-colors",
                        isActive 
                          ? "bg-white/20 text-white border-white/30" 
                          : "border-primary/20 text-primary group-hover:bg-primary/10"
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border/50 space-y-2 bg-gradient-to-r from-muted/30 to-muted/10">
            <Link
              href="/dashboard/settings"
              className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[0.98]",
                pathname === '/dashboard/settings'
                  ? "bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                pathname === '/dashboard/settings'
                  ? "bg-white/20" 
                  : "bg-muted/50 group-hover:bg-primary/10"
              )}>
                <Settings className={cn(
                  "h-4 w-4 transition-colors",
                  pathname === '/dashboard/settings' ? "text-white" : "text-muted-foreground group-hover:text-primary"
                )} />
              </div>
              <span className="flex-1">Settings</span>
            </Link>
            
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 rounded-xl px-4 py-3 h-auto"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted/50 group-hover:bg-red-100 dark:group-hover:bg-red-950/30 transition-colors mr-3">
                <LogOut className="h-4 w-4" />
              </div>
              <span className="flex-1 text-left">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
