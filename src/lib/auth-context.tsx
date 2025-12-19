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
    return new Promise<void>((resolve, reject) => {
      authClient.signIn.email(
        {
          email,
          password,
        },
        {
          onSuccess: async () => {
            try {
              // Fetch session to get the role (sign-in response doesn't include it)
              const sessionResponse = await fetch("/api/session", {
                credentials: "include",
              })
              if (!sessionResponse.ok) {
                throw new Error("Unable to fetch active session")
              }
              const sessionData = await sessionResponse.json()
              const role = (sessionData?.user as User | undefined)?.role
              console.log("Role:", role)
              if (!role) {
                throw new Error("Role not found")
              }
              resolve(role as any);
            } catch (error) {
              console.error("Failed to fetch session after login:", error)
              resolve()
            }
          },
          onError: (error) => {
            const message =
              error?.error?.message ||
              error?.error?.statusText ||
              "Login failed. Please check your credentials."
            reject(new Error(message))
          },
        },
      )
    })
  }

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

  // Middleware handles redirects - no client-side redirect logic needed

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
