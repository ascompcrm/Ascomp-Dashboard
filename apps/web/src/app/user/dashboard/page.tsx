"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'

export default function UserDashboard() {
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()
  const [reports, setReports] = useState<any[]>([])
  const [pendingServices, setPendingServices] = useState<any[]>([])
  const [servicesLoading, setServicesLoading] = useState(true)
  const [servicesError, setServicesError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/')
      } else if (user.role === 'ADMIN') {
        router.push('/admin/dashboard')
      }
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const storedReports = localStorage.getItem('serviceReports')
    if (storedReports) {
      try {
        setReports(JSON.parse(storedReports))
      } catch {
        setReports([])
      }
    }
  }, [])

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true)
        setServicesError(null)
        const response = await fetch('/api/user/services')
        if (!response.ok) {
          throw new Error('Failed to load services')
        }
        const result = await response.json()
        setPendingServices(result.services || [])
      } catch (err) {
        setServicesError(err instanceof Error ? err.message : 'Failed to load services')
        setPendingServices([])
      } finally {
        setServicesLoading(false)
      }
    }

    if (user) {
      fetchServices()
    }
  }, [user])

  const startWorkflow = () => {
    router.push('/user/workflow')
  }

  if (isLoading || !user) return null

  const submittedServiceIds = new Set(
    reports
      .map((report) => report.service?.id)
      .filter((id: string | undefined) => Boolean(id))
  )

  const filteredPendingServices = pendingServices.filter(
    (service) => !submittedServiceIds.has(service.id)
  )

  const submittedCount = reports.length
  const pendingCount = filteredPendingServices.length
  const latestReports = [...reports].reverse().slice(0, 3)
  const latestPending = filteredPendingServices.slice(0, 3)

  return (
    <div className="min-h-screen bg-white w-full">
      <div className="border-b-2 border-black px-4 py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Engineer Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Welcome back, {user.name || user.email}</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={startWorkflow}
            className="bg-black text-white hover:bg-gray-800 border-2 border-black font-semibold px-5"
          >
            Start Workflow
          </Button>
          <Button
            onClick={logout}
            variant="outline"
            className="border-2 border-black text-black hover:bg-gray-100"
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="border-2 border-black p-4">
            <p className="text-sm text-gray-600 mb-2">Submitted Reports</p>
            <p className="text-3xl font-bold text-black">{submittedCount}</p>
            <p className="text-xs text-gray-500 mt-1">Total reports submitted to admin</p>
          </div>
          <div className="border-2 border-black p-4">
            <p className="text-sm text-gray-600 mb-2">Pending Services</p>
            <p className="text-3xl font-bold text-black">{pendingCount}</p>
            <p className="text-xs text-gray-500 mt-1">Scheduled services assigned to you</p>
          </div>
          <div className="border-2 border-black p-4">
            <p className="text-sm text-gray-600 mb-2">Current Account</p>
            <p className="text-lg font-semibold text-black">{user.email}</p>
            <p className="text-xs text-gray-500 mt-1">Role: {user.role}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="border-2 border-black p-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h2 className="text-lg font-semibold text-black">Pending Scheduled Services</h2>
                <p className="text-sm text-gray-600">Only services assigned to you are shown</p>
              </div>
              <Button
                variant="outline"
                onClick={startWorkflow}
                className="border-2 border-black text-black hover:bg-gray-100 text-xs"
              >
                Open Workflow
              </Button>
            </div>
            {servicesLoading ? (
              <p className="text-sm text-gray-600">Loading services...</p>
            ) : servicesError ? (
              <p className="text-sm text-red-600">{servicesError}</p>
            ) : latestPending.length === 0 ? (
              <p className="text-sm text-gray-600">No scheduled services pending.</p>
            ) : (
              <div className="space-y-3">
                {latestPending.map((service) => (
                  <div key={service.id} className="border border-gray-300 p-3">
                    <p className="text-sm font-semibold text-black">{service.site}</p>
                    <div className="text-xs text-gray-600 mt-1">
                      <p>Projector: {service.projectorModel}</p>
                      <p>Type: {service.type}</p>
                      <p>Date: {service.date}</p>
                      {service.address && <p className="mt-1">{service.address}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-2 border-black p-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h2 className="text-lg font-semibold text-black">Recent Submitted Reports</h2>
                <p className="text-sm text-gray-600">Latest reports you sent to admin</p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/user/workflow')}
                className="border-2 border-black text-black hover:bg-gray-100 text-xs"
              >
                New Report
              </Button>
            </div>
            {latestReports.length === 0 ? (
              <p className="text-sm text-gray-600">No reports submitted yet.</p>
            ) : (
              <div className="space-y-3">
                {latestReports.map((report) => (
                  <div key={report.id} className="border border-gray-300 p-3">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{new Date(report.timestamp).toLocaleString()}</span>
                      <span>{report.service?.type || 'Service Report'}</span>
                    </div>
                    <p className="text-sm font-semibold text-black mt-2">
                      {report.service?.site || 'Unknown site'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Projector: {report.workDetails?.projectorModel} ({report.workDetails?.projectorSerialNumber})
                    </p>
                    {report.workDetails?.remarks && (
                      <p className="text-xs text-gray-600 mt-2">
                        Remarks: {report.workDetails.remarks}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
