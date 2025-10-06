"use client"

import { Loader2 } from "lucide-react"

interface AuthLoadingProps {
  message?: string
}

export function AuthLoading({ message = "Checking authentication..." }: AuthLoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}