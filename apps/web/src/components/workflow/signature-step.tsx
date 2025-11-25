'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Maximize2, X } from 'lucide-react'

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
  const [fullscreenCanvas, setFullscreenCanvas] = useState<'site' | 'engineer' | null>(null)
  const siteInChargeCanvasRef = useRef<HTMLCanvasElement>(null)
  const engineerCanvasRef = useRef<HTMLCanvasElement>(null)
  const fullscreenCanvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)

  useEffect(() => {
    const savedSiteSignature = localStorage.getItem('siteInChargeSignature')
    const savedEngineerSignature = localStorage.getItem('engineerSignature')

    if (savedSiteSignature) setSiteInChargeSignature(savedSiteSignature)
    if (savedEngineerSignature) setEngineerSignature(savedEngineerSignature)
  }, [])

  useEffect(() => {
    // Initialize canvas context settings
    const initCanvas = (canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }

    if (siteInChargeCanvasRef.current) {
      initCanvas(siteInChargeCanvasRef.current)
    }
    if (engineerCanvasRef.current) {
      initCanvas(engineerCanvasRef.current)
    }
  }, [])

  useEffect(() => {
    // Initialize fullscreen canvas when opened
    if (fullscreenCanvas && fullscreenCanvasRef.current) {
      const ctx = fullscreenCanvasRef.current.getContext('2d')
      if (ctx) {
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 4
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
      }
    }
  }, [fullscreenCanvas])

  const getCoordinates = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ('touches' in e && e.touches.length > 0 && e.touches[0]) {
      const touch = e.touches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      }
    } else if ('clientX' in e) {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      }
    }
    return { x: 0, y: 0 }
  }

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    isEngineer: boolean,
    isFullscreen = false
  ) => {
    e.preventDefault()
    const canvas = isFullscreen
      ? fullscreenCanvasRef.current
      : isEngineer
        ? engineerCanvasRef.current
        : siteInChargeCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    isDrawingRef.current = true
    const coords = getCoordinates(e.nativeEvent, canvas)
    ctx.beginPath()
    ctx.moveTo(coords.x, coords.y)

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!isDrawingRef.current) return
      moveEvent.preventDefault()
      const moveCoords = getCoordinates(moveEvent, canvas)
      ctx.lineTo(moveCoords.x, moveCoords.y)
      ctx.stroke()
    }

    const handleEnd = () => {
      isDrawingRef.current = false
      document.removeEventListener('mousemove', handleMove as EventListener)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchmove', handleMove as EventListener)
      document.removeEventListener('touchend', handleEnd)
    }

    document.addEventListener('mousemove', handleMove as EventListener)
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchmove', handleMove as EventListener, { passive: false })
    document.addEventListener('touchend', handleEnd)
  }

  const clearSignature = (isEngineer: boolean, isFullscreen = false) => {
    const canvas = isFullscreen
      ? fullscreenCanvasRef.current
      : isEngineer
        ? engineerCanvasRef.current
        : siteInChargeCanvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
    if (!isFullscreen) {
      if (isEngineer) {
        setEngineerSignature(null)
        localStorage.removeItem('engineerSignature')
      } else {
        setSiteInChargeSignature(null)
        localStorage.removeItem('siteInChargeSignature')
      }
    }
  }

  const copyFullscreenToMain = (isEngineer: boolean) => {
    const fullscreenCanvas = fullscreenCanvasRef.current
    const mainCanvas = isEngineer ? engineerCanvasRef.current : siteInChargeCanvasRef.current
    if (fullscreenCanvas && mainCanvas) {
      const fullscreenCtx = fullscreenCanvas.getContext('2d')
      const mainCtx = mainCanvas.getContext('2d')
      if (fullscreenCtx && mainCtx) {
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height)
        mainCtx.drawImage(fullscreenCanvas, 0, 0, mainCanvas.width, mainCanvas.height)
      }
    }
  }

  const saveSignature = async (isEngineer: boolean, fromFullscreen = false) => {
    const canvas = fromFullscreen
      ? fullscreenCanvasRef.current
      : isEngineer
        ? engineerCanvasRef.current
        : siteInChargeCanvasRef.current
    if (canvas) {
      const signature = canvas.toDataURL()
      try {
        setUploading(true)
        if (fromFullscreen) {
          copyFullscreenToMain(isEngineer)
        }
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
        if (fromFullscreen) {
          setFullscreenCanvas(null)
        }
      } catch (error) {
        console.error('Signature upload failed:', error)
      } finally {
        setUploading(false)
      }
    }
  }

  const openFullscreen = (isEngineer: boolean) => {
    setFullscreenCanvas(isEngineer ? 'engineer' : 'site')
    // Copy existing signature to fullscreen canvas if available
    setTimeout(() => {
      const mainCanvas = isEngineer ? engineerCanvasRef.current : siteInChargeCanvasRef.current
      const fullscreenCanvas = fullscreenCanvasRef.current
      if (mainCanvas && fullscreenCanvas) {
        const mainCtx = mainCanvas.getContext('2d')
        const fullscreenCtx = fullscreenCanvas.getContext('2d')
        if (mainCtx && fullscreenCtx) {
          fullscreenCtx.clearRect(0, 0, fullscreenCanvas.width, fullscreenCanvas.height)
          fullscreenCtx.drawImage(mainCanvas, 0, 0, fullscreenCanvas.width, fullscreenCanvas.height)
        }
      }
    }, 100)
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
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-black text-sm sm:text-base">Site In-charge Signature</h3>
            <button
              onClick={() => openFullscreen(false)}
              className="p-1.5 hover:bg-gray-100 rounded border border-black"
              aria-label="Expand signature canvas"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
          <div className="relative">
            <canvas
              ref={siteInChargeCanvasRef}
              width={400}
              height={200}
              onMouseDown={(e) => startDrawing(e, false)}
              onTouchStart={(e) => startDrawing(e, false)}
              className="border-2 border-black bg-white cursor-crosshair w-full h-32 sm:h-40 touch-none"
              style={{ touchAction: 'none' }}
            />
          </div>
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
              disabled={uploading}
              className="flex-1 bg-black text-white hover:bg-gray-800 border-2 border-black text-xs sm:text-sm disabled:opacity-50"
            >
              {uploading ? 'Saving...' : 'Save'}
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
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-black text-sm sm:text-base">Engineer Signature</h3>
            <button
              onClick={() => openFullscreen(true)}
              className="p-1.5 hover:bg-gray-100 rounded border border-black"
              aria-label="Expand signature canvas"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
          <div className="relative">
            <canvas
              ref={engineerCanvasRef}
              width={400}
              height={200}
              onMouseDown={(e) => startDrawing(e, true)}
              onTouchStart={(e) => startDrawing(e, true)}
              className="border-2 border-black bg-white cursor-crosshair w-full h-32 sm:h-40 touch-none"
              style={{ touchAction: 'none' }}
            />
          </div>
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
              disabled={uploading}
              className="flex-1 bg-black text-white hover:bg-gray-800 border-2 border-black text-xs sm:text-sm disabled:opacity-50"
            >
              {uploading ? 'Saving...' : 'Save'}
            </Button>
          </div>
          {engineerSignatureUrl && (
            <div className="mt-2 border border-gray-200 p-2">
              <img src={engineerSignatureUrl} alt="Engineer Signature" className="w-full h-20 object-contain" />
            </div>
          )}
        </Card>
      </div>

      {/* Fullscreen Signature Modal */}
      {fullscreenCanvas && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-black">
                {fullscreenCanvas === 'engineer' ? 'Engineer Signature' : 'Site In-charge Signature'}
              </h3>
              <button
                onClick={() => setFullscreenCanvas(null)}
                className="p-2 hover:bg-gray-100 rounded"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center mb-4 bg-gray-50 rounded-lg p-4 overflow-hidden">
              <canvas
                ref={fullscreenCanvasRef}
                width={800}
                height={400}
                onMouseDown={(e) => startDrawing(e, fullscreenCanvas === 'engineer', true)}
                onTouchStart={(e) => startDrawing(e, fullscreenCanvas === 'engineer', true)}
                className="border-2 border-black bg-white cursor-crosshair w-full max-w-3xl h-64 sm:h-80 md:h-96 touch-none"
                style={{ touchAction: 'none' }}
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => clearSignature(fullscreenCanvas === 'engineer', true)}
                variant="outline"
                className="flex-1 border-2 border-black text-black hover:bg-gray-100"
              >
                Clear
              </Button>
              <Button
                onClick={() => saveSignature(fullscreenCanvas === 'engineer', true)}
                disabled={uploading}
                className="flex-1 bg-black text-white hover:bg-gray-800 border-2 border-black disabled:opacity-50"
              >
                {uploading ? 'Saving...' : 'Save & Close'}
              </Button>
            </div>
          </div>
        </div>
      )}

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
