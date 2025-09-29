"use client"

export interface User {
  id: number
  email: string
  name: string
  role: "JOBSEEKER" | "JOBPROVIDER"
  company?: string
  emailVerified?: boolean
}

export const getStoredAuth = (): { user: User | null; token: string | null } => {
  if (typeof window === "undefined") {
    return { user: null, token: null }
  }

  const token = localStorage.getItem("auth_token")
  const userStr = localStorage.getItem("auth_user")

  if (!token || !userStr) {
    return { user: null, token: null }
  }

  try {
    const user = JSON.parse(userStr)
    return { user, token }
  } catch {
    return { user: null, token: null }
  }
}

export const setStoredAuth = (user: User, token: string) => {
  if (typeof window === "undefined") return

  localStorage.setItem("auth_token", token)
  localStorage.setItem("auth_user", JSON.stringify(user))
}

export const clearStoredAuth = () => {
  if (typeof window === "undefined") return

  localStorage.removeItem("auth_token")
  localStorage.removeItem("auth_user")
}

export const isAuthenticated = (): boolean => {
  const { token } = getStoredAuth()
  return !!token
}

export const getCurrentUser = (): User | null => {
  const { user } = getStoredAuth()
  return user
}

export const getUserRole = (): "JOBSEEKER" | "JOBPROVIDER" | null => {
  const user = getCurrentUser()
  return user?.role || null
}
