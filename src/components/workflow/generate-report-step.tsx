import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'


export default function GenerateReportStep({ data, onBack }: any) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)


  const getIssueEntries = () => {
    const workDetails = data.workDetails || {}
    const statusFields = [
      { key: 'reflector', label: 'Reflector' },
      { key: 'uvFilter', label: 'UV Filter' },
      { key: 'integratorRod', label: 'Integrator Rod' },
      { key: 'coldMirror', label: 'Cold Mirror' },
      { key: 'foldMirror', label: 'Fold Mirror' },
      { key: 'touchPanel', label: 'Touch Panel' },
      { key: 'evbBoard', label: 'EVB Board' },
      { key: 'ImcbBoard', label: 'IMCB Board' },
      { key: 'pibBoard', label: 'PIB Board' },
      { key: 'IcpBoard', label: 'ICP Board' },
      { key: 'imbSBoard', label: 'IMB-S Board' },
      { key: 'coolantLevelColor', label: 'Coolant Level & Color' },
      { key: 'acBlowerVane', label: 'AC Blower Vane' },
      { key: 'extractorVane', label: 'Extractor Vane' },
      { key: 'lightEngineFans', label: 'Light Engine Fans' },
      { key: 'cardCageFans', label: 'Card Cage Fans' },
      { key: 'radiatorFanPump', label: 'Radiator Fan Pump' },
      { key: 'pumpConnectorHose', label: 'Pump Connector & Hose' },
      { key: 'securityLampHouseLock', label: 'Security Lamp House Lock' },
      { key: 'lampLocMechanism', label: 'Lamp LOC Mechanism' },
      { key: 'acStatus', label: 'AC Status' },
      { key: 'leStatus', label: 'LE Status' },
      { key: 'AirIntakeLadRad', label: 'Disposable Consumables' },
      { key: 'pixelDefects', label: 'Pixel Defects' },
      { key: 'imageVibration', label: 'Image Vibration' },
      { key: 'liteloc', label: 'LiteLOC Status' },
    ]

    const issues: { label: string; value: string }[] = []
    const notes = workDetails.issueNotes || {}

    statusFields.forEach(({ key, label }) => {
      const raw = (workDetails[key] || '').toString()
      if (!raw) return
      const normalized = raw.trim().toLowerCase()
      const okValues = new Set(['ok', 'working', 'none', 'not available', 'yes'])
      if (!okValues.has(normalized)) {
        issues.push({ label, value: raw })
        if (notes[key]) {
          issues.push({ label: `${label} Note`, value: notes[key] })
        }
      }
    })

    return issues
  }

  const saveReportToLocalStorage = (issues: { label: string; value: string }[]) => {
    const reports = JSON.parse(localStorage.getItem('serviceReports') || '[]')

    const summarizeImages = () => {
      if (!data.workImages) {
        return { before: [], after: [], broken: [] }
      }

      // Legacy shape: array of images (treat as generic \"before\")
      if (Array.isArray(data.workImages)) {
        return {
          before: data.workImages,
          after: [],
          broken: [],
        }
      }

      // Current workflow shape coming from RecordWorkStep
      const before = data.workImages.images || data.workImages.before || []
      const after = data.workImages.afterImages || data.workImages.after || []
      const broken = data.workImages.brokenImages || data.workImages.broken || []

      return { before, after, broken }
    }

    reports.push({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      service: data.selectedService,
      workDetails: data.workDetails,
      issues,
      remarks: data.workDetails?.remarks || '',
      engineer: localStorage.getItem('user'),
      images: summarizeImages(),
      signatures: {
        engineer: data.engineerSignatureUrl,
        site: data.siteSignatureUrl,
      },
    })
    localStorage.setItem('serviceReports', JSON.stringify(reports))
  }

  const [isSubmitted, setIsSubmitted] = useState(false)

  const submitServiceRecord = async () => {
    if (!data.selectedService?.id) {
      throw new Error('Service record ID is missing')
    }

    const summarizeImages = () => {
      if (!data.workImages) {
        return { before: [], after: [], broken: [] }
      }

      if (Array.isArray(data.workImages)) {
        return {
          before: data.workImages,
          after: [],
          broken: [],
        }
      }

      const before = data.workImages.images || data.workImages.before || []
      const after = data.workImages.afterImages || data.workImages.after || []
      const broken = data.workImages.brokenImages || data.workImages.broken || []

      return { before, after, broken }
    }

    const images = summarizeImages()

    const response = await fetch('/api/user/services/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        serviceRecordId: data.selectedService.id,
        workDetails: data.workDetails || {},
        signatures: {
          engineer: data.engineerSignatureUrl,
          site: data.siteSignatureUrl,
        },
        // Map to Prisma arrays: before -> images, after -> afterImages, broken -> brokenImages
        images: images.before,
        afterImages: images.after,
        brokenImages: images.broken,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Submission failed' }))
      throw new Error(errorData.error || 'Failed to submit service record')
    }

    return response.json()
  }

  const handleSubmit = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    setProgress(10)
    setSubmitError(null)
    try {
      // Submit to database
      await submitServiceRecord()
      setProgress(100)
      setIsSubmitted(true)
    } catch (error) {
      console.error('Error submitting report:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownloadAndFinish = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      // Import the helper dynamically
      const { constructAndGeneratePDF } = await import('@/lib/pdf-helper')

      const serviceId = data.selectedService?.id
      if (!serviceId) throw new Error("Service ID missing")

      // Use the global helper to fetch data and generate PDF
      const pdfBytes = await constructAndGeneratePDF(serviceId)

      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${data.workDetails?.projectorSerialNumber || 'Service_Report'}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Save summary to local storage (keep existing logic)
      const issues = getIssueEntries()
      saveReportToLocalStorage(issues)

      // Clear workflow data and reset to first step BEFORE redirecting
      localStorage.removeItem('workflowData')
      localStorage.removeItem('workflowStep')
      localStorage.removeItem('siteInChargeSignature')
      localStorage.removeItem('engineerSignature')

      // Small delay to ensure PDF download starts, then navigate smoothly
      setTimeout(() => {
        router.replace('/user/workflow')
      }, 500)
    } catch (error) {
      console.error('Error generating PDF:', error)
      setSubmitError('Failed to generate PDF. You can try again.')
      setIsSubmitting(false)
    }
  }

  const issues = getIssueEntries()

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold text-black mb-2">Generate Report</h2>
      <p className="text-sm text-gray-700 mb-4">
        {isSubmitted
          ? "Report submitted successfully! Please download the PDF to finish."
          : "Review the details and submit the report."}
      </p>

      {(isSubmitting || progress > 0 || isSubmitted) && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1 text-xs text-gray-600">
            <span>{isSubmitted ? "Save complete" : "Saving data & images..."}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-2 bg-black transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      <Card className="border-2 border-black p-4 mb-4 space-y-4">
        <div>
          <h3 className="font-bold text-black mb-3 text-sm sm:text-base">Site Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
            <div>
              <span className="font-semibold">Site:</span>{' '}
              <span className="wrap-break-word">{data.selectedService?.site || '—'}</span>
            </div>
            <div>
              <span className="font-semibold">Address:</span>{' '}
              <span className="wrap-break-word">{data.selectedService?.address || data.workDetails?.address || '—'}</span>
            </div>
            <div>
              <span className="font-semibold">Contact:</span> {data.selectedService?.contactDetails || data.workDetails?.contactDetails || '—'}
            </div>
            <div>
              <span className="font-semibold">Projector:</span>{' '}
              {data.workDetails?.projectorModel} ({data.workDetails?.projectorSerialNumber})
            </div>
            <div>
              <span className="font-semibold">Running Hours:</span> {data.workDetails?.projectorRunningHours || '—'}
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-black mb-3 text-sm sm:text-base">Issues & Actions</h3>
          <div className="space-y-2 border border-gray-200 p-3 bg-gray-50 text-xs sm:text-sm">
            {issues.length > 0 ? (
              issues.map((issue) => (
                <div key={`${issue.label}-${issue.value}`} className="flex justify-between gap-4">
                  <span className="font-semibold">{issue.label}</span>
                  <span className="text-gray-700">{issue.value}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-600">All components reported as OK.</p>
            )}
            {data.workDetails?.remarks && (
              <div className="pt-2 border-t border-gray-300">
                <p className="font-semibold mb-1">Remarks</p>
                <p className="text-gray-700">{data.workDetails.remarks}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border-2 border-dashed border-black p-3 text-center">
            <p className="font-semibold text-sm mb-3">Engineer Signature</p>
            <div className="h-24 flex items-center justify-center">
              {data.engineerSignatureUrl ? (
                <img src={data.engineerSignatureUrl} alt="Engineer Signature" className="max-h-20 object-contain" />
              ) : (
                <span className="text-xs text-gray-500">Not captured</span>
              )}
            </div>
          </div>
          <div className="border-2 border-dashed border-black p-3 text-center">
            <p className="font-semibold text-sm mb-3">Site Incharge Signature</p>
            <div className="h-24 flex items-center justify-center">
              {data.siteSignatureUrl ? (
                <img src={data.siteSignatureUrl} alt="Site Signature" className="max-h-20 object-contain" />
              ) : (
                <span className="text-xs text-gray-500">Not captured</span>
              )}
            </div>
          </div>
        </div>

        {submitError && (
          <div className="p-3 border-2 border-red-500 bg-red-50 text-red-700 text-sm">
            {submitError}
          </div>
        )}


        {!isSubmitted ? (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black font-bold py-2 text-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        ) : (
          <Button
            onClick={handleDownloadAndFinish}
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white hover:bg-green-700 border-2 border-green-800 font-bold py-2 text-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Generating PDF...' : 'Download PDF & Finish'}
          </Button>
        )}
      </Card>

      {!isSubmitted && (
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            onClick={onBack}
            variant="outline"
            className="border-2 border-black text-black hover:bg-gray-100 flex-1"
            disabled={isSubmitting}
          >
            Back
          </Button>
        </div>
      )}
    </div>
  )
}
