"use client"

import { createContext, useContext, type ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from './auth-client'

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
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  const login = async (email: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      authClient.signIn.email(
        {
          email,
          password,
        },
        {
          onSuccess: () => {
            resolve()
          },
          onError: (error) => {
            reject(new Error(error.error.message || 'Login failed'))
          },
        }
      )
    })
  }

  const logout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/')
        },
      },
    })
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

  // Handle redirect after login based on role
  useEffect(() => {
    if (user && !isPending) {
      const currentPath = window.location.pathname
      // Only redirect if we're on login or home page
      if (currentPath === '/login' || currentPath === '/') {
        if (user.role === 'ADMIN') {
          router.push('/admin/dashboard')
        } else {
          router.push('/user/workflow')
        }
      }
    }
  }, [user, isPending, router])

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
