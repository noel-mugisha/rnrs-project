"use client"

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: ('JOBSEEKER' | 'JOBPROVIDER' | 'ADMIN')[]
  requireProfileSetup?: boolean
}

export function ProtectedRoute({ 
  children, 
  allowedRoles, 
  requireProfileSetup = false 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login')
        return
      }

      if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        router.push('/dashboard')
        return
      }

      // Check if profile setup is required for job seekers
      if (requireProfileSetup && user?.role === 'JOBSEEKER') {
        // Check if basic profile information is missing
        // This would typically check if phone, desiredTitle, etc. are filled
        // For now, we'll assume they need to complete profile setup
        const needsProfileSetup = !user.phone
        if (needsProfileSetup) {
          router.push('/dashboard/profile/setup')
          return
        }
      }
    }
  }, [isLoading, isAuthenticated, user, router, allowedRoles, requireProfileSetup])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}