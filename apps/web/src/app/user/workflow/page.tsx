"use client"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import SelectServiceStep from "@/components/workflow/select-service-step"
import StartServiceStep from "@/components/workflow/start-service-step"
import RecordWorkStep from "@/components/workflow/record-work-step"
import SignatureStep from "@/components/workflow/signature-step"
import GenerateReportStep from "@/components/workflow/generate-report-step"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function WorkflowPage() {
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [workflowData, setWorkflowData] = useState<any>({})
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/')
        return
      }

      const savedData = localStorage.getItem("workflowData")
      const savedStep = localStorage.getItem("workflowStep")

      if (savedData) {
        setWorkflowData(JSON.parse(savedData))
      }
      if (savedStep) {
        const parsed = parseInt(savedStep, 10)
        const clamped = Math.max(0, Math.min(parsed, steps.length - 1))
        setCurrentStep(clamped)
        if (clamped !== parsed) {
          localStorage.setItem("workflowStep", String(clamped))
        }
      }

      setIsLoaded(true)
    }
  }, [user, isLoading, router])

  const steps = [
    { name: 'Select Service', component: SelectServiceStep },
    { name: 'Start Service', component: StartServiceStep },
    { name: 'Record Work', component: RecordWorkStep },
    { name: 'Signatures', component: SignatureStep },
    { name: 'Generate Report', component: GenerateReportStep },
  ]

  const safeStepIndex = Math.max(0, Math.min(currentStep, steps.length - 1))
  const CurrentStepComponent = steps[safeStepIndex].component

  const handleNext = (payload: any) => {
    const newData = { ...workflowData, ...payload }
    setWorkflowData(newData)
    localStorage.setItem("workflowData", JSON.stringify(newData))
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      localStorage.setItem("workflowStep", String(currentStep + 1))
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      localStorage.setItem("workflowStep", String(currentStep - 1))
    }
  }

  const handleExit = () => {
    localStorage.removeItem("workflowData")
    localStorage.removeItem("workflowStep")
    router.replace("/")
  }

  const handleLogout = () => {
    localStorage.removeItem("workflowData")
    localStorage.removeItem("workflowStep")
    logout()
    router.replace("/")
  }

  const navigateTo = (path: string) => {
    router.push(path as any)
  }

  if (!isLoaded) {
    return <div className="min-h-screen bg-white" />
  }

  const userInitials = useMemo(() => {
    if (!user) return "U"
    const base = user.name || user.email || "U"
    return base
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("")
  }, [user])

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="border-b-2 border-black p-3 sm:p-4 sticky top-0 bg-white/95 backdrop-blur z-50 w-full">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 sm:h-12 sm:w-12 border-2 border-black rounded-xl overflow-hidden bg-white hidden sm:flex">
              <Image src="/LOGO/Ascomp.png" alt="Ascomp INC" fill className="object-contain p-1.5" sizes="48px" />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Ascomp INC</p>
              <p className="text-sm font-semibold text-black">Service Workflow</p>
              <p className="text-xs text-gray-500 truncate">Stay on track with assigned visits</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="border-2 border-black rounded-full py-2 px-4 focus:outline-none hover:bg-gray-100 transition-colors">
                  <span className="uppercase font-semibold text-sm">{userInitials}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>
                  <div className="text-sm font-medium text-black">{user?.name || "Field Worker"}</div>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigateTo("/user/profile")}>Profile details</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigateTo("/user/services")}>Services</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Progress indicator - responsive */}
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex-1 min-w-[110px] py-2 px-2 sm:px-3 border-2 border-black text-center font-semibold text-xs sm:text-sm transition-colors ${
                index === currentStep ? 'bg-black text-white' : 'bg-white text-black'
              }`}
            >
              {step.name}
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 sm:p-4 md:p-6 w-full">
        <div className="max-w-full md:max-w-4xl mx-auto">
          <CurrentStepComponent
            data={workflowData}
            onNext={handleNext}
            onBack={handleBack}
            user={user}
          />
        </div>
      </div>
    </div>
  )
}
