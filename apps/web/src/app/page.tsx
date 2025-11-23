"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function Home() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else {
        router.push('/user/dashboard')
      }
    }
  }, [user, isLoading, router])

  const handleGoToLogin = () => {
    router.push('/login')
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  // If user is logged in, redirect will happen via useEffect
  if (user) {
    return <div className="flex items-center justify-center h-screen">Redirecting...</div>
  }

  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center w-full p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl">
        <Card className="border-2 border-black shadow-lg">
          <div className="p-6 sm:p-8 md:p-10 lg:p-12">
            <div className="flex justify-center mb-8 sm:mb-10">
              <div className="w-full max-w-[200px] sm:max-w-[240px] border border-dotted decoration-dotted md:max-w-[280px] h-24 sm:h-32 md:h-40 relative bg-white rounded-lg flex items-center justify-center overflow-hidden">
                <Image
                  src="/LOGO/Ascomp.png"
                  alt="Company Logo"
                  fill
                  className="object-contain p-3 sm:p-4 md:p-6"
                  priority
                />
              </div>
            </div>
            <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black leading-tight">
                Service Management System
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 font-medium">
                Internal tool for projector maintenance and service operations
              </p>
            </div>
            <div className="mb-8 sm:mb-10">
              <p className="text-sm sm:text-base text-center text-gray-600 max-w-xl mx-auto leading-relaxed px-2">
                Access your service records, manage maintenance schedules, and coordinate field operations
                through our company portal.
              </p>
            </div>
            <div className="flex justify-center mb-8 sm:mb-10">
              <Button
                onClick={handleGoToLogin}
                className="w-full sm:w-auto bg-black text-white hover:bg-gray-800 border-2 border-black font-bold px-6 sm:px-8 md:px-10 py-5 sm:py-6 text-base sm:text-lg transition-all duration-200 hover:scale-105 active:scale-95"
                size="lg"
              >
                Login
              </Button>
            </div>
            <div className="pt-6 sm:pt-8 border-t-2 border-gray-200">
              <p className="text-xs sm:text-sm text-gray-500 text-center">
                Authorized personnel only
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
