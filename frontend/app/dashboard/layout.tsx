"use client"

import type React from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/lib/auth-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <DashboardContent>{children}</DashboardContent>
    </ProtectedRoute>
  )
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="min-h-screen w-full bg-background flex">
      <Sidebar userRole={user.role} />
      <div className="flex-1">
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}