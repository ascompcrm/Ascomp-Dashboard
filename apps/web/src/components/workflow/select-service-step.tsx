"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Service {
  id: string
  serviceNumber: number
  site: string
  siteId: string
  address: string
  contactDetails: string
  projector: string
  projectorId: string
  projectorModel: string
  type: string
  date: string
  rawDate: string | null
  status: string
}

export default function SelectServiceStep({ data, onNext }: any) {
  const [selected, setSelected] = useState<string | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch("/api/user/services")
        if (!response.ok) {
          throw new Error("Failed to fetch services")
        }
        const result = await response.json()
        setServices(result.services || [])
      } catch (err) {
        console.error("Error fetching services:", err)
        setError(err instanceof Error ? err.message : "Failed to load services")
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  const handleSelect = (service: Service) => {
    setSelected((prev) => (prev === service.id ? null : service.id))
  }

  const handleProceed = () => {
    const service = services.find((s) => s.id === selected)
    if (service) {
      onNext({ selectedService: service })
    }
  }

  if (loading) {
    return (
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-black mb-2">Select Service Visit</h2>
        <p className="text-sm text-gray-700 mb-6">Loading your scheduled services...</p>
        <div className="space-y-3 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border-2 border-gray-200 bg-gray-50 animate-pulse">
              <div className="h-5 bg-gray-300 rounded mb-3 w-3/4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-black mb-2">Select Service Visit</h2>
        <div className="p-4 border-2 border-red-500 bg-red-50 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
        <Button
          onClick={() => window.location.reload()}
          className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black font-bold"
        >
          Retry
        </Button>
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-black mb-2">Select Service Visit</h2>
        <div className="p-8 border-2 border-gray-300 text-center">
          <p className="text-base text-gray-700 mb-2 font-medium">No scheduled services found.</p>
          <p className="text-sm text-gray-500">Contact your administrator to get assigned to a service.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold text-black mb-2">Select Service Visit</h2>
      <p className="text-sm text-gray-700 mb-6">Choose the service visit to work on:</p>

      <div className="space-y-3 mb-6">
        {services.map((service) => (
          <div
            key={service.id}
            onClick={() => handleSelect(service)}
            className={`relative p-4 border-2 cursor-pointer transition-all duration-200 ${
              selected === service.id
                ? 'border-black bg-gray-50 text-black shadow-md'
                : 'border-gray-300 bg-white text-black hover:border-gray-400 hover:shadow-sm'
            }`}
          >
            {selected === service.id && (
              <div className="absolute top-3 right-3 w-5 h-5 border-2 border-black rounded-full flex items-center justify-center bg-white">
                <div className="w-2 h-2 bg-black rounded-full"></div>
              </div>
            )}
            <div className="pr-8">
              <div className="font-semibold text-base mb-2">{service.site}</div>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-start justify-between">
                  <span className="text-gray-600">Projector</span>
                  <span className="font-medium">{service.projector}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-gray-600">Model</span>
                  <span className="font-medium">{service.projectorModel}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium">{service.type}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium">{service.date}</span>
                </div>
                {service.address && (
                  <div className={`pt-2 mt-2 border-t ${selected === service.id ? 'border-gray-300' : 'border-gray-200'}`}>
                    <div className="text-xs text-gray-600">{service.address}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={handleProceed}
        disabled={!selected}
        className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black font-semibold py-3 text-base disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        {selected ? 'Proceed to Start Service' : 'Select a service to continue'}
      </Button>
    </div>
  )
}
