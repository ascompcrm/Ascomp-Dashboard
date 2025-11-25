'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useState } from 'react'

export default function CompleteStep({ data, onBack }: any) {
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    // Save to localStorage for admin to view
    const reports = JSON.parse(localStorage.getItem('serviceReports') || '[]')
    reports.push({
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      service: data.selectedService,
      workDetails: data.workDetails,
      signatures: { siteInCharge: data.siteInChargeSignature, engineer: data.engineerSignature },
      engineer: localStorage.getItem('user'),
    })
    localStorage.setItem('serviceReports', JSON.stringify(reports))
    setSubmitted(true)
  }

  const handleDone = () => {
    router.push('/user/workflow')
  }

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold text-black mb-2">Complete Service</h2>
      <p className="text-sm text-gray-700 mb-4">Finalize and submit the service report</p>

      <Card className="border-2 border-black p-3 sm:p-4 mb-4">
        <h3 className="font-bold text-black mb-3 text-sm sm:text-base">Service Completion Summary</h3>

        <div className="space-y-3 text-xs sm:text-sm mb-4">
          <div className="pb-3 border-b-2 border-black">
            <div className="font-semibold text-black">Site Information</div>
            <div className="mt-2 break-words">{data.selectedService?.site}</div>
            <div>{data.selectedService?.type}</div>
          </div>

          <div className="pb-3 border-b-2 border-black">
            <div className="font-semibold text-black">Projector Details</div>
            <div className="mt-2">Model: {data.workDetails?.projectorModel}</div>
            <div>Serial: {data.workDetails?.projectorSerialNumber}</div>
            <div>Hours: {data.workDetails?.projectorRunningHours}</div>
          </div>

          <div className="pb-3 border-b-2 border-black">
            <div className="font-semibold text-black">Cinema</div>
            <div className="mt-2">{data.workDetails?.cinemaName}</div>
            <div className="text-xs break-words">{data.workDetails?.address}</div>
          </div>

          <div>
            <div className="font-semibold text-black">Completion Status</div>
            <div className="mt-2">✓ All details verified</div>
            <div>✓ Signatures collected</div>
            <div>✓ Report generated</div>
          </div>
        </div>

        {!submitted ? (
          <Button
            onClick={handleSubmit}
            className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black font-bold py-2 text-sm"
          >
            Submit Service Report to Admin
          </Button>
        ) : (
          <div className="p-3 bg-black text-white border-2 border-black text-center font-bold text-sm">
            ✓ Service Report Submitted Successfully
          </div>
        )}
      </Card>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Button
          onClick={onBack}
          variant="outline"
          className="border-2 border-black text-black hover:bg-gray-100 flex-1"
        >
          Back
        </Button>
        {submitted && (
          <Button
            onClick={handleDone}
            className="bg-black text-white hover:bg-gray-800 border-2 border-black font-bold flex-1"
          >
            Return to Dashboard
          </Button>
        )}
      </div>
    </div>
  )
}
