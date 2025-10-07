"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { LogOut, User } from "lucide-react"

export function LogoutDemo() {
  const { user, requestLogout } = useAuth()

  if (!user) return null

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Logout Confirmation Demo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Currently signed in as:
          </p>
          <p className="font-medium">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-sm text-muted-foreground">
            {user.email}
          </p>
        </div>
        
        <Button 
          onClick={requestLogout} 
          variant="destructive" 
          className="w-full"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Test Logout Confirmation
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          Click the button above to see the logout confirmation dialog
        </p>
      </CardContent>
    </Card>
  )
}