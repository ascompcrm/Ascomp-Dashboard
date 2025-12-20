"use client"
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useEffect } from 'react'
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
      } else if (user.role === 'FIELD_WORKER') {
        router.push('/user/workflow')
      }
    }
  }, [user, isLoading, router])

  const handleGoToLogin = () => {
    router.push('/login')
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center w-full p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-4xl">
        <Card className="border-2 border-black shadow-xl backdrop-blur bg-white/90">
          <div className="p-6 sm:p-8 md:p-10 lg:p-14">
            <div className="flex flex-col items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="w-full max-w-[220px] sm:max-w-[260px] md:max-w-[320px] h-24 sm:h-32 md:h-40 relative bg-white rounded-2xl border-2 border-dashed border-black flex items-center justify-center overflow-hidden shadow-sm">
                <Image
                  src="/LOGO/Ascomp.png"
                  alt="Ascomp INC"
                  fill
                  className="object-contain p-4 sm:p-6"
                  priority
                />
              </div>
              <div className="text-center">
                <p className="tracking-[0.4em] text-xs sm:text-sm uppercase text-gray-500">Ascomp INC</p>
              </div>
            </div>
            <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black leading-tight">
                Field Service Operations Portal
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 font-medium max-w-2xl mx-auto">
                Coordinating projector maintenance, diagnostics, and reporting for every Ascomp INC auditorium.
              </p>
            </div>
            <div className="mb-8 sm:mb-10">
              <p className="text-sm sm:text-base text-center text-gray-600 max-w-xl mx-auto leading-relaxed px-2">
                Access service records, capture on-site data, and automate reports—all optimized for technicians
                working from any device.
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
                Authorized Ascomp INC personnel only
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
