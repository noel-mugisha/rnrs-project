"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api, User, getAuthData, setAuthData, clearAuthData } from './api'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { LogoutConfirmation } from '@/components/auth/logout-confirmation'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (userData: {
    firstName: string
    lastName: string
    email: string
    password: string
    role: 'JOBSEEKER' | 'JOBPROVIDER'
  }) => Promise<{ success: boolean; userId?: string }>
  logout: () => Promise<void>
  requestLogout: () => void
  confirmLogout: () => Promise<void>
  cancelLogout: () => void
  showLogoutConfirmation: boolean
  verifyEmail: (userId: string, otp: string) => Promise<boolean>
  resendOTP: (userId: string) => Promise<void>
  refreshUser: () => Promise<void>
  refreshToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false)
  const router = useRouter()

  const isAuthenticated = !!user

  useEffect(() => {
    initializeAuth()
  }, [])

  // Auto-refresh on page focus to maintain session
  useEffect(() => {
    const handleFocus = async () => {
      if (isAuthenticated && !isLoading) {
        try {
          const response = await api.refreshToken()
          if (response.success && response.data) {
            setAuthData(response.data.accessToken, user!)
          } else {
            // Session expired
            clearAuthData()
            setUser(null)
          }
        } catch (error) {
          console.log('Focus refresh failed:', error)
        }
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [isAuthenticated, isLoading, user])

  const initializeAuth = async () => {
    try {
      const { token, user: userData } = getAuthData()
      
      if (token && userData) {
        // Try to refresh token to ensure session is valid
        const response = await api.refreshToken()
        if (response.success && response.data) {
          // Update stored token and set user
          setAuthData(response.data.accessToken, userData)
          setUser(userData)
        } else {
          // Refresh failed, clear auth data
          clearAuthData()
        }
      } else {
        // No stored auth data, try refresh token from cookie
        try {
          const response = await api.refreshToken()
          if (response.success && response.data) {
            // Get user data with the new token
            if (typeof window !== 'undefined') {
              localStorage.setItem('auth_token', response.data.accessToken)
            }
            
            const userResponse = await api.getMe()
            if (userResponse.success && userResponse.data) {
              setAuthData(response.data.accessToken, userResponse.data)
              setUser(userResponse.data)
            }
          }
        } catch (error) {
          // Silent fail - user will need to login
          console.log('No valid session found')
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      clearAuthData()
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.login(email, password)
      
      if (response.success && response.data) {
        const { accessToken } = response.data
        
        // Store token temporarily to make authenticated requests
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', accessToken)
        }
        
        // Get user data
        const userResponse = await api.getMe()
        if (userResponse.success && userResponse.data) {
          setAuthData(accessToken, userResponse.data)
          setUser(userResponse.data)
          toast.success('Successfully logged in!')
          return true
        }
      }
      
      toast.error('Invalid email or password')
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const signup = async (userData: {
    firstName: string
    lastName: string
    email: string
    password: string
    role: 'JOBSEEKER' | 'JOBPROVIDER'
  }): Promise<{ success: boolean; userId?: string }> => {
    try {
      const response = await api.signup(userData)
      
      if (response.success && response.data) {
        toast.success('Account created successfully! Please check your email for verification.')
        return { success: true, userId: response.data.userId }
      }
      
      return { success: false }
    } catch (error) {
      console.error('Signup error:', error)
      return { success: false }
    }
  }

  const verifyEmail = async (userId: string, otp: string): Promise<boolean> => {
    try {
      const response = await api.verifyEmail(userId, otp)
      
      if (response.success && response.data) {
        const { accessToken } = response.data
        
        // Store token first so api.getMe() can use it
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', accessToken)
        }
        
        // Get user data
        const userResponse = await api.getMe()
        if (userResponse.success && userResponse.data) {
          setAuthData(accessToken, userResponse.data)
          setUser(userResponse.data)
          toast.success('Email verified successfully!')
          return true
        }
      }
      
      toast.error('Invalid or expired OTP')
      return false
    } catch (error) {
      console.error('Email verification error:', error)
      toast.error('An error occurred during verification')
      return false
    }
  }

  const resendOTP = async (userId: string): Promise<void> => {
    try {
      const response = await api.resendOTP(userId)
      
      if (response.success) {
        toast.success('OTP sent successfully!')
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await api.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearAuthData()
      setUser(null)
      toast.success('Logged out successfully!')
      router.push('/')
    }
  }

  const requestLogout = (): void => {
    setShowLogoutConfirmation(true)
  }

  const confirmLogout = async (): Promise<void> => {
    setShowLogoutConfirmation(false)
    await logout()
  }

  const cancelLogout = (): void => {
    setShowLogoutConfirmation(false)
  }

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await api.getMe()
      if (response.success && response.data) {
        const { token } = getAuthData()
        if (token) {
          setAuthData(token, response.data)
          setUser(response.data)
        }
      }
    } catch (error) {
      console.error('Refresh user error:', error)
    }
  }

  const refreshTokenMethod = async (): Promise<boolean> => {
    try {
      const response = await api.refreshToken()
      if (response.success && response.data) {
        // Update stored token
        if (user) {
          setAuthData(response.data.accessToken, user)
        }
        return true
      }
      return false
    } catch (error) {
      console.error('Refresh token error:', error)
      return false
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    requestLogout,
    confirmLogout,
    cancelLogout,
    showLogoutConfirmation,
    verifyEmail,
    resendOTP,
    refreshUser,
    refreshToken: refreshTokenMethod,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LogoutConfirmation
        isOpen={showLogoutConfirmation}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
        userName={user ? `${user.firstName} ${user.lastName}` : undefined}
      />
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}