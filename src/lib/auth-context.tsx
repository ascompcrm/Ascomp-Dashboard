"use client"

import { createContext, useContext, type ReactNode } from "react"
import { authClient } from "./auth-client"

interface User {
  id: string
  email: string
  name: string
  image?: string | null
  role?: 'ADMIN' | 'FIELD_WORKER'
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession()

  const login = async (email: string, password: string) => {
    const { data, error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: user?.role === "ADMIN" ? "/admin/dashboard" : "/user/workflow",
    })

    if (error) {
      throw error
    }
  }



    console.log("session here", session)

  const logout = async () => {
    try {
      await authClient.signOut()
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const user: User | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        role: (session.user as any).role as 'ADMIN' | 'FIELD_WORKER' | undefined,
      }
    : null

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isPending,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
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
