"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function UserDashboard() {
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/')
      } else if (user.role === 'ADMIN') {
        router.push('/admin/dashboard')
      }
    }
  }, [user, isLoading, router])

  const startWorkflow = () => {
    router.push('/user/workflow')
  }

  if (isLoading || !user) return null

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b-2 border-black p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black">Engineer Dashboard</h1>
        <Button
          onClick={logout}
          variant="outline"
          className="border-2 border-black text-black hover:bg-gray-100"
        >
          Logout
        </Button>
      </div>

      <div className="p-6">
        <Card className="border-2 border-black p-6 max-w-md">
          <p className="text-sm text-gray-600 mb-4">Logged in as: <strong>{user.email}</strong></p>
          <Button
            onClick={startWorkflow}
            className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black font-bold h-12 text-lg"
          >
            Start Workflow
          </Button>
        </Card>
      </div>
    </div>
  )
}
