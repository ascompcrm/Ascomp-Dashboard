'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AppSidebar } from "@/components/app-sidebar"

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/")
      } else if (user.role !== "ADMIN") {
        router.replace("/user/workflow")
      }
    }
  }, [user, isLoading, router])

  if (isLoading || !user || user.role !== "ADMIN") {
    return null
  }

  return (
    <div className="flex w-full h-full overflow-hidden">
      <AppSidebar />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}