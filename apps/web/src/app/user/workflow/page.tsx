"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import SelectServiceStep from '@/components/workflow/select-service-step'
import StartServiceStep from '@/components/workflow/start-service-step'
import RecordWorkStep from '@/components/workflow/record-work-step'
import SignatureStep from '@/components/workflow/signature-step'
import GenerateReportStep from '@/components/workflow/generate-report-step'
import { Button } from '@/components/ui/button'

export default function WorkflowPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [workflowData, setWorkflowData] = useState<any>({})
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/')
        return
      }

      const savedData = localStorage.getItem('workflowData')
      const savedStep = localStorage.getItem('workflowStep')

      if (savedData) {
        setWorkflowData(JSON.parse(savedData))
      }
      if (savedStep) {
        const parsed = parseInt(savedStep, 10)
        const clamped = Math.max(0, Math.min(parsed, steps.length - 1))
        setCurrentStep(clamped)
        if (clamped !== parsed) {
          localStorage.setItem('workflowStep', String(clamped))
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

  const handleNext = (data: any) => {
    const newData = { ...workflowData, ...data }
    setWorkflowData(newData)
    localStorage.setItem('workflowData', JSON.stringify(newData))
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      localStorage.setItem('workflowStep', String(currentStep + 1))
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      localStorage.setItem('workflowStep', String(currentStep - 1))
    }
  }

  const handleExit = () => {
    localStorage.removeItem('workflowData')
    localStorage.removeItem('workflowStep')
    router.push('/user/dashboard')
  }

  if (!isLoaded) {
    return <div className="min-h-screen bg-white" />
  }

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="border-b-2 border-black p-3 sm:p-4 sticky top-0 bg-white z-50 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 sm:mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-black">Service Workflow</h1>
          <Button
            onClick={handleExit}
            variant="outline"
            className="border-2 border-black text-black hover:bg-gray-100 w-full sm:w-auto"
          >
            Exit
          </Button>
        </div>

        {/* Progress indicator - responsive */}
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex-1 min-w-max py-2 px-2 sm:px-3 border-2 border-black text-center font-semibold text-xs sm:text-sm ${
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
          />
        </div>
      </div>
    </div>
  )
}
