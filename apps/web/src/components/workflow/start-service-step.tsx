'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function StartServiceStep({ data, onNext, onBack }: any) {
  const [startTime, setStartTime] = useState<string>('')

  useEffect(() => {
    const now = new Date()
    setStartTime(now.toISOString().slice(0, 16))
  }, [])

  const handleStart = () => {
    onNext({ startTime })
  }

  const service = data.selectedService

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold text-black mb-2">Start Service</h2>
      <p className="text-sm text-gray-700 mb-4">Begin the service work and record start time.</p>

      <Card className="border-2 border-black p-3 sm:p-4 mb-4">
        <h3 className="font-bold text-black mb-3 text-sm sm:text-base">Service Visit Details</h3>
        <div className="space-y-2 text-xs sm:text-sm">
          <div>
            <span className="font-semibold">Site:</span> {service.site}
          </div>
          <div>
            <span className="font-semibold">Projector:</span> {service.projector}
          </div>
          <div>
            <span className="font-semibold">Type:</span> {service.type}
          </div>
          <div>
            <span className="font-semibold">Priority:</span> Medium
          </div>
          <div>
            <span className="font-semibold">Description:</span> Service for CP2220
          </div>
        </div>
      </Card>

      <div className="mb-4">
        <label className="block font-semibold text-black mb-2 text-sm">Start Time</label>
        <Input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="w-full border-2 border-black p-2 text-black text-sm"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Button
          onClick={onBack}
          variant="outline"
          className="border-2 border-black text-black hover:bg-gray-100 flex-1"
        >
          Back
        </Button>
        <Button
          onClick={handleStart}
          className="bg-black text-white hover:bg-gray-800 border-2 border-black font-bold flex-1"
        >
          Start Service
        </Button>
      </div>
    </div>
  )
}
