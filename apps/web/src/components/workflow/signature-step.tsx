'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function SignatureStep({ data, onNext, onBack }: any) {
  const [siteInChargeSignature, setSiteInChargeSignature] = useState<string | null>(null)
  const [engineerSignature, setEngineerSignature] = useState<string | null>(null)
  const siteInChargeCanvasRef = useRef<HTMLCanvasElement>(null)
  const engineerCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const savedSiteSignature = localStorage.getItem('siteInChargeSignature')
    const savedEngineerSignature = localStorage.getItem('engineerSignature')

    if (savedSiteSignature) setSiteInChargeSignature(savedSiteSignature)
    if (savedEngineerSignature) setEngineerSignature(savedEngineerSignature)
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>, isEngineer: boolean) => {
    const canvas = isEngineer ? engineerCanvasRef.current : siteInChargeCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)

    const handleMouseMove = (moveEvent: MouseEvent) => {
      ctx.lineTo(moveEvent.clientX - rect.left, moveEvent.clientY - rect.top)
      ctx.stroke()
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const clearSignature = (isEngineer: boolean) => {
    const canvas = isEngineer ? engineerCanvasRef.current : siteInChargeCanvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
    if (isEngineer) {
      setEngineerSignature(null)
      localStorage.removeItem('engineerSignature')
    } else {
      setSiteInChargeSignature(null)
      localStorage.removeItem('siteInChargeSignature')
    }
  }

  const saveSignature = (isEngineer: boolean) => {
    const canvas = isEngineer ? engineerCanvasRef.current : siteInChargeCanvasRef.current
    if (canvas) {
      const signature = canvas.toDataURL()
      if (isEngineer) {
        setEngineerSignature(signature)
        localStorage.setItem('engineerSignature', signature)
      } else {
        setSiteInChargeSignature(signature)
        localStorage.setItem('siteInChargeSignature', signature)
      }
    }
  }

  const handleNext = () => {
    if (siteInChargeSignature && engineerSignature) {
      onNext({ siteInChargeSignature, engineerSignature })
    }
  }

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold text-black mb-2">Site In-charge & Engineer Signature</h2>
      <p className="text-sm text-gray-700 mb-4">Get signature from site in-charge and Engineer</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4">
        {/* Site In-charge Signature */}
        <Card className="border-2 border-black p-3 sm:p-4">
          <h3 className="font-bold text-black mb-2 text-sm sm:text-base">Site In-charge Signature</h3>
          <canvas
            ref={siteInChargeCanvasRef}
            width={200}
            height={100}
            onMouseDown={(e) => startDrawing(e, false)}
            className="border-2 border-black bg-white cursor-crosshair w-full h-24 sm:h-28"
          />
          <div className="flex gap-2 mt-2">
            <Button
              onClick={() => clearSignature(false)}
              variant="outline"
              className="flex-1 border-2 border-black text-black hover:bg-gray-100 text-xs sm:text-sm"
            >
              Clear
            </Button>
            <Button
              onClick={() => saveSignature(false)}
              className="flex-1 bg-black text-white hover:bg-gray-800 border-2 border-black text-xs sm:text-sm"
            >
              Save
            </Button>
          </div>
          {siteInChargeSignature && (
            <p className="text-xs sm:text-sm text-green-600 mt-2">✓ Signature saved</p>
          )}
        </Card>

        {/* Engineer Signature */}
        <Card className="border-2 border-black p-3 sm:p-4">
          <h3 className="font-bold text-black mb-2 text-sm sm:text-base">Engineer Signature</h3>
          <canvas
            ref={engineerCanvasRef}
            width={200}
            height={100}
            onMouseDown={(e) => startDrawing(e, true)}
            className="border-2 border-black bg-white cursor-crosshair w-full h-24 sm:h-28"
          />
          <div className="flex gap-2 mt-2">
            <Button
              onClick={() => clearSignature(true)}
              variant="outline"
              className="flex-1 border-2 border-black text-black hover:bg-gray-100 text-xs sm:text-sm"
            >
              Clear
            </Button>
            <Button
              onClick={() => saveSignature(true)}
              className="flex-1 bg-black text-white hover:bg-gray-800 border-2 border-black text-xs sm:text-sm"
            >
              Save
            </Button>
          </div>
          {engineerSignature && (
            <p className="text-xs sm:text-sm text-green-600 mt-2">✓ Signature saved</p>
          )}
        </Card>
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
          onClick={handleNext}
          disabled={!siteInChargeSignature || !engineerSignature}
          className="bg-black text-white hover:bg-gray-800 border-2 border-black font-bold disabled:opacity-50 flex-1"
        >
          Continue to Report
        </Button>
      </div>
    </div>
  )
}
