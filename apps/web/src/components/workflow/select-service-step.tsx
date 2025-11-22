import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const MOCK_SERVICES = [
  {
    id: '343416015',
    site: 'Chhattisgarh Bhillai Treasure Island Mall',
    type: 'Scheduled Maintenance',
    date: '24/09/2025',
    projector: '343416015',
  },
  {
    id: '253185019',
    site: 'Bihar Patna Ambuja City Centre Mall',
    type: 'Scheduled Maintenance',
    date: '24/09/2025',
    projector: '253185019',
  },
  {
    id: '123456789',
    site: 'Maharashtra Mumbai PVR Phoenix Mall',
    type: 'Emergency Maintenance',
    date: '25/09/2025',
    projector: '123456789',
  },
]

export default function SelectServiceStep({ data, onNext }: any) {
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = (service: any) => {
    setSelected(service.id)
  }

  const handleProceed = () => {
    const service = MOCK_SERVICES.find((s) => s.id === selected)
    if (service) {
      onNext({ selectedService: service })
    }
  }

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold text-black mb-2">Select Service Visit</h2>
      <p className="text-sm text-gray-700 mb-4">Choose the service visit to work on:</p>

      <div className="space-y-2 sm:space-y-3 mb-4">
        {MOCK_SERVICES.map((service) => (
          <Card
            key={service.id}
            onClick={() => handleSelect(service)}
            className={`p-3 sm:p-4 border-2 cursor-pointer transition ${
              selected === service.id
                ? 'border-black bg-black text-white'
                : 'border-black bg-white text-black hover:bg-gray-50'
            }`}
          >
            <div className="font-semibold text-sm sm:text-base">{service.site}</div>
            <div className="text-xs sm:text-sm">Projector: {service.projector}</div>
            <div className="text-xs sm:text-sm">Type: {service.type}</div>
            <div className="text-xs sm:text-sm">Date: {service.date}</div>
          </Card>
        ))}
      </div>

      <Button
        onClick={handleProceed}
        disabled={!selected}
        className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black font-bold disabled:opacity-50"
      >
        Proceed to Start Service
      </Button>
    </div>
  )
}
