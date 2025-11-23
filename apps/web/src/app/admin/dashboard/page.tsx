'use client'

import AdminDashboardd from '@/components/admin-dashboard'
import { useAdminDashboard } from './layout'

export default function AdminDashboard() {
  const { activeView, setActiveView } = useAdminDashboard()

  return (
    <AdminDashboardd activeView={activeView} onViewChange={setActiveView} />
  )
}
