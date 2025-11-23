'use client'

import { useEffect, useState, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { AppSidebar } from '@/components/app-sidebar'

type ViewType = "overview" | "sites" | "fieldworkers" | "site-detail" | "projector-detail"

interface AdminDashboardContextType {
  activeView: ViewType
  setActiveView: (view: ViewType) => void
}

const AdminDashboardContext = createContext<AdminDashboardContextType | undefined>(undefined)

export function useAdminDashboard() {
  const context = useContext(AdminDashboardContext)
  if (!context) {
    throw new Error('useAdminDashboard must be used within AdminDashboardLayout')
  }
  return context
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [activeView, setActiveView] = useState<ViewType>("overview")

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/')
      } else if (user.role !== 'ADMIN') {
        router.push('/user/dashboard')
      }
    }
  }, [user, isLoading, router])

  const handleSidebarSelection = (view: ViewType) => {
    setActiveView(view)
  }

  if (isLoading || !user || user.role !== 'ADMIN') {
    return null
  }

  return (
    <AdminDashboardContext.Provider value={{ activeView, setActiveView }}>
      <div className='flex w-full h-full overflow-hidden'>
        <AppSidebar onSelectionChange={handleSidebarSelection} />
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </AdminDashboardContext.Provider>
  )
}

