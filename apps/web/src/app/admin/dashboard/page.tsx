'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [reports, setReports] = useState<any[]>([])
  const [selectedReport, setSelectedReport] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/')
    } else {
      const parsed = JSON.parse(userData)
      if (parsed.role !== 'admin') {
        router.push('/user/dashboard')
      }
      setUser(parsed)
      loadReports()
    }
  }, [router])

  const loadReports = () => {
    const savedReports = JSON.parse(localStorage.getItem('serviceReports') || '[]')
    setReports(savedReports)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b-2 border-black p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black">Admin Dashboard</h1>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="border-2 border-black text-black hover:bg-gray-100"
        >
          Logout
        </Button>
      </div>

      <div className="p-6">
        <p className="text-sm text-gray-600 mb-6">Logged in as: <strong>{user.email}</strong></p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="border-2 border-black p-4 text-center">
            <div className="text-3xl font-bold text-black">{reports.length}</div>
            <div className="text-sm text-gray-600">Total Reports</div>
          </Card>
          <Card className="border-2 border-black p-4 text-center">
            <div className="text-3xl font-bold text-black">{reports.length}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </Card>
          <Card className="border-2 border-black p-4 text-center">
            <div className="text-3xl font-bold text-black">0</div>
            <div className="text-sm text-gray-600">Pending</div>
          </Card>
        </div>

        <h2 className="text-xl font-bold text-black mb-4">Service Reports</h2>

        <div className="grid grid-cols-1 gap-4 mb-8">
          {reports.length === 0 ? (
            <Card className="border-2 border-black p-6 text-center text-gray-600">
              No service reports yet
            </Card>
          ) : (
            reports.map((report) => (
              <Card
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={`p-4 border-2 cursor-pointer transition ${
                  selectedReport?.id === report.id
                    ? 'border-black bg-black text-white'
                    : 'border-black bg-white text-black hover:bg-gray-50'
                }`}
              >
                <div className="font-semibold">{report.service.site}</div>
                <div className="text-sm">Projector: {report.service.projector}</div>
                <div className="text-sm">Engineer: {JSON.parse(report.engineer).email}</div>
                <div className="text-sm">Submitted: {report.timestamp}</div>
              </Card>
            ))
          )}
        </div>

        {selectedReport && (
          <div className="border-2 border-black p-6">
            <h3 className="text-lg font-bold text-black mb-4">Report Details</h3>

            <div className="space-y-4 text-sm">
              <div>
                <span className="font-semibold">Site:</span> {selectedReport.service.site}
              </div>
              <div>
                <span className="font-semibold">Projector:</span>{' '}
                {selectedReport.workDetails.projectorModel}
              </div>
              <div>
                <span className="font-semibold">Serial No:</span>{' '}
                {selectedReport.workDetails.serialNo}
              </div>
              <div>
                <span className="font-semibold">Running Hours:</span>{' '}
                {selectedReport.workDetails.runningHours}
              </div>
              <div>
                <span className="font-semibold">Issues Found:</span>{' '}
                {selectedReport.workDetails.issuesFound}
              </div>
              <div>
                <span className="font-semibold">Parts Used:</span>{' '}
                {selectedReport.workDetails.partsUsed}
              </div>
              <div>
                <span className="font-semibold">Engineer:</span>{' '}
                {JSON.parse(selectedReport.engineer).email}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// @page.tsx (1-137) 

// now lets go to admin dashboard. admin should have a option 