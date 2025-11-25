'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const uploadSignature = async (dataUrl: string, role: 'engineer' | 'site') => {
  const formData = new FormData()
  formData.append('file', dataUrlToFile(dataUrl, `${role}-signature.png`))
  formData.append('folder', 'signatures')

  const res = await fetch('/api/blob/upload', {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({ error: 'Upload failed' }))
    throw new Error(detail.error || 'Upload failed')
  }
  return res.json()
}

const dataUrlToFile = (dataUrl: string, filename: string) => {
  const [metaPart, dataPart] = dataUrl.split(',')
  if (!metaPart || !dataPart) {
    throw new Error('Invalid data URL')
  }
  const mimeMatch = metaPart.match(/:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/png'
  const bstr = atob(dataPart)
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

export default function SignatureStep({ data, onNext, onBack }: any) {
  const [siteInChargeSignature, setSiteInChargeSignature] = useState<string | null>(null)
  const [engineerSignature, setEngineerSignature] = useState<string | null>(null)
  const [siteSignatureUrl, setSiteSignatureUrl] = useState<string | null>(data.siteSignatureUrl || null)
  const [engineerSignatureUrl, setEngineerSignatureUrl] = useState<string | null>(data.engineerSignatureUrl || null)
  const [uploading, setUploading] = useState(false)
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

  const saveSignature = async (isEngineer: boolean) => {
    const canvas = isEngineer ? engineerCanvasRef.current : siteInChargeCanvasRef.current
    if (canvas) {
      const signature = canvas.toDataURL()
      try {
        setUploading(true)
        const uploaded = await uploadSignature(signature, isEngineer ? 'engineer' : 'site')
        if (isEngineer) {
          setEngineerSignature(signature)
          setEngineerSignatureUrl(uploaded.url)
          localStorage.setItem('engineerSignature', signature)
        } else {
          setSiteInChargeSignature(signature)
          setSiteSignatureUrl(uploaded.url)
          localStorage.setItem('siteInChargeSignature', signature)
        }
      } catch (error) {
        console.error('Signature upload failed:', error)
      } finally {
        setUploading(false)
      }
    }
  }

  const handleNext = () => {
    if (siteSignatureUrl && engineerSignatureUrl) {
      onNext({
        siteInChargeSignature,
        engineerSignature,
        siteSignatureUrl,
        engineerSignatureUrl,
      })
    }
  }

  const hasImageEvidence = useMemo(() => {
    if (!data?.workImages) return false
    if (Array.isArray(data.workImages)) {
      return data.workImages.length > 0
    }
    return Boolean((data.workImages.broken || []).length && (data.workImages.other || []).length)
  }, [data])

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
          {siteSignatureUrl && (
            <div className="mt-2 border border-gray-200 p-2">
              <img src={siteSignatureUrl} alt="Site Signature" className="w-full h-20 object-contain" />
            </div>
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
          {engineerSignatureUrl && (
            <div className="mt-2 border border-gray-200 p-2">
              <img src={engineerSignatureUrl} alt="Engineer Signature" className="w-full h-20 object-contain" />
            </div>
          )}
        </Card>
      </div>

      {!hasImageEvidence && (
        <div className="p-3 border-2 border-amber-500 bg-amber-50 text-amber-800 text-sm mb-4">
          Please attach required images in the Record Work step before submitting signatures.
        </div>
      )}

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
          disabled={!siteSignatureUrl || !engineerSignatureUrl || !hasImageEvidence || uploading}
          className="bg-black text-white hover:bg-gray-800 border-2 border-black font-bold disabled:opacity-50 flex-1"
        >
          Continue to Report
        </Button>
      </div>
    </div>
  )
}
