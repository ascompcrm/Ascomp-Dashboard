'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function StartServiceStep({ data, onNext, onBack }: any) {
  const [startTime, setStartTime] = useState<string>('')
  const service = data?.selectedService

  useEffect(() => {
    const now = new Date()
    setStartTime(now.toISOString().slice(0, 16))
  }, [])

  if (!service) {
    return (
      <div className="border-2 border-gray-300 p-4 text-sm text-gray-700">
        No service selected. Please go back and choose a service visit.
      </div>
    )
  }

  const infoRows = [
    { label: 'Site', value: service.site },
    { label: 'Address', value: service.address || '—' },
    { label: 'Contact', value: service.contactDetails || '—' },
    {
      label: 'Projector',
      value: `${service.projector} ${service.projectorModel ? `(${service.projectorModel})` : ''}`.trim(),
    },
    { label: 'Service #', value: service.serviceNumber ?? '—' },
    { label: 'Type', value: service.type },
    { label: 'Status', value: service.status?.replace(/_/g, ' ') || '—' },
    { label: 'Scheduled Date', value: service.date || '—' },
  ]

  const handleStart = () => {
    onNext({ startTime, selectedService: service })
  }

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold text-black mb-2">Start Service</h2>
      <p className="text-sm text-gray-700 mb-4">Confirm site details and record the start time.</p>

      <div className="border-2 border-black p-4 mb-5">
        <h3 className="font-semibold text-black mb-3 text-sm sm:text-base">Service Visit Details</h3>
        <div className="divide-y divide-gray-200 text-xs sm:text-sm">
          {infoRows.map((row) => (
            <div key={row.label} className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <span className="text-gray-600 font-medium">{row.label}</span>
              <span className="text-black">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

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
