import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { generateMaintenanceReport, type MaintenanceReportData } from '@/components/PDFGenerator'

export default function GenerateReportStep({ data, onBack }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const hasImageEvidence = useMemo(() => {
    if (!data?.workImages) return false
    if (Array.isArray(data.workImages)) {
      return data.workImages.length > 0
    }
    return Boolean((data.workImages.broken || []).length && (data.workImages.other || []).length)
  }, [data])

  const getIssueEntries = () => {
    const workDetails = data.workDetails || {}
    const statusFields = [
      { key: 'reflector', label: 'Reflector' },
      { key: 'uvFilter', label: 'UV Filter' },
      { key: 'integratorRod', label: 'Integrator Rod' },
      { key: 'coldMirror', label: 'Cold Mirror' },
      { key: 'foldMirror', label: 'Fold Mirror' },
      { key: 'touchPanel', label: 'Touch Panel' },
      { key: 'evbImcbBoard', label: 'EVB/IMCB Board' },
      { key: 'pibIcpBoard', label: 'PIB/ICP Board' },
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
      { key: 'disposableConsumables', label: 'Disposable Consumables' },
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
        return { broken: [], other: [] }
      }
      if (Array.isArray(data.workImages)) {
        return {
          broken: [],
          other: data.workImages,
        }
      }
      return {
        broken: data.workImages.broken || [],
        other: data.workImages.other || [],
      }
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

  const buildPdfPayload = (): MaintenanceReportData => {
    const workDetails = data.workDetails || {}
    const service = data.selectedService || {}
    const safe = (value: unknown) => (value ?? '').toString()
    const toStatus = (value: unknown) => ({ status: safe(value) })
    const formatDateTime = (value?: string) => {
      if (!value) return ''
      const date = new Date(value)
      return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
    }

    const issueNotesEntries =
      workDetails.issueNotes && typeof workDetails.issueNotes === 'object'
        ? Object.entries(workDetails.issueNotes).map(([label, note]) => ({
            label,
            note: String(note ?? ''),
          }))
        : []

    const recommendedParts =
      Array.isArray(workDetails.recommendedParts) && workDetails.recommendedParts.length > 0
        ? workDetails.recommendedParts.map((part: any) => ({
            description: safe(part.description),
            partNumber: safe(part.part_number ?? part.partNumber),
          }))
        : []

    const detectedIssues = getIssueEntries().map((issue) => ({
      label: issue.label,
      value: issue.value,
    }))

    return {
      cinemaName: safe(workDetails.cinemaName || service.site),
      date: safe(workDetails.date || service.date),
      address: safe(workDetails.address || service.address),
      contactDetails: safe(workDetails.contactDetails || service.contactDetails),
      location: safe(workDetails.location),
      screenNo: safe(workDetails.screenNumber),
      serviceVisit: safe(workDetails.serviceVisitType || service.type),
      projectorModel: safe(workDetails.projectorModel || service.projector),
      serialNo: safe(workDetails.projectorSerialNumber),
      runningHours: safe(workDetails.projectorRunningHours),
      projectorEnvironment: safe(workDetails.projectorPlacementEnvironment),
      startTime: formatDateTime(workDetails.startTime),
      endTime: formatDateTime(workDetails.endTime),
      opticals: {
        reflector: toStatus(workDetails.reflector),
        uvFilter: toStatus(workDetails.uvFilter),
        integratorRod: toStatus(workDetails.integratorRod),
        coldMirror: toStatus(workDetails.coldMirror),
        foldMirror: toStatus(workDetails.foldMirror),
      },
      electronics: {
        touchPanel: toStatus(workDetails.touchPanel),
        evbImcb: toStatus(workDetails.evbImcbBoard),
        pibIcp: toStatus(workDetails.pibIcpBoard),
        imbS: toStatus(workDetails.imbSBoard),
      },
      serialVerified: toStatus(workDetails.serialNumberVerified),
      disposableConsumables: toStatus(workDetails.disposableConsumables),
      coolant: toStatus(workDetails.coolantLevelColor),
      lightEngineTest: {
        white: toStatus(workDetails.lightEngineWhite),
        red: toStatus(workDetails.lightEngineRed),
        green: toStatus(workDetails.lightEngineGreen),
        blue: toStatus(workDetails.lightEngineBlue),
        black: toStatus(workDetails.lightEngineBlack),
      },
      mechanical: {
        acBlower: toStatus(workDetails.acBlowerVane),
        extractor: toStatus(workDetails.extractorVane),
        exhaustCFM: toStatus(workDetails.exhaustCfm),
        lightEngine4Fans: toStatus(workDetails.lightEngineFans),
        cardCageFans: toStatus(workDetails.cardCageFans),
        radiatorFan: toStatus(workDetails.radiatorFanPump),
        connectorHose: toStatus(workDetails.pumpConnectorHose),
        securityLock: toStatus(workDetails.securityLampHouseLock),
      },
      lampLOC: toStatus(workDetails.lampLocMechanism),
      lampMake: safe(workDetails.lampMakeModel),
      lampHours: safe(workDetails.lampTotalRunningHours),
      currentLampHours: safe(workDetails.lampCurrentRunningHours),
      voltageParams: {
        pvn: safe(workDetails.pvVsN),
        pve: safe(workDetails.pvVsE),
        nve: safe(workDetails.nvVsE),
      },
      flMeasurements: [
        `Center: ${safe(workDetails.flCenter)}`,
        `Left: ${safe(workDetails.flLeft)}`,
        `Right: ${safe(workDetails.flRight)}`,
      ]
        .filter(Boolean)
        .join(' | '),
      contentPlayer: safe(workDetails.contentPlayerModel),
      acStatus: safe(workDetails.acStatus),
      leStatus: safe(workDetails.leStatus),
      remarks: safe(workDetails.remarks),
      leSerialNo: safe(workDetails.lightEngineSerialNumber),
      mcgdData: {
        w2k4k: { fl: safe(workDetails.whiteFl), x: safe(workDetails.whiteX), y: safe(workDetails.whiteY) },
        r2k4k: { fl: safe(workDetails.redFl), x: safe(workDetails.redX), y: safe(workDetails.redY) },
        g2k4k: { fl: safe(workDetails.greenFl), x: safe(workDetails.greenX), y: safe(workDetails.greenY) },
        b2k4k: { fl: safe(workDetails.blueFl), x: safe(workDetails.blueX), y: safe(workDetails.blueY) },
      },
      cieXyz: {
        x: safe(workDetails.whiteX),
        y: safe(workDetails.whiteY),
        fl: safe(workDetails.whiteFl),
      },
      softwareVersion: safe(workDetails.softwareVersion),
      screenInfo: {
        scope: {
          height: safe(workDetails.screenHeight),
          width: safe(workDetails.screenWidth),
          gain: safe(workDetails.screenGain),
        },
        flat: {
          height: safe(workDetails.screenHeight),
          width: safe(workDetails.screenWidth),
          gain: safe(workDetails.screenGain),
        },
        make: safe(workDetails.screenMake),
      },
      throwDistance: safe(workDetails.throwDistance),
      imageEvaluation: {
        focusBoresite: safe(workDetails.focusBoresight),
        integratorPosition: safe(workDetails.integratorPosition),
        spotOnScreen: safe(workDetails.spotsOnScreen),
        screenCropping: safe(workDetails.screenCroppingOk),
        convergence: safe(workDetails.convergenceOk),
        channelsChecked: safe(workDetails.channelsCheckedOk),
        pixelDefects: safe(workDetails.pixelDefects),
        imageVibration: safe(workDetails.imageVibration),
        liteLOC: safe(workDetails.liteloc),
      },
      airPollution: {
        hcho: safe(workDetails.hcho),
        tvoc: safe(workDetails.tvoc),
        pm10: safe(workDetails.pm10),
        pm25: safe(workDetails.pm2_5),
        pm100: safe(workDetails.pm1),
        temperature: safe(workDetails.temperature),
        humidity: safe(workDetails.humidity),
      },
      recommendedParts,
      issueNotes: issueNotesEntries,
      detectedIssues,
      reportGenerated: Boolean(workDetails.reportGenerated),
      reportUrl: safe(workDetails.reportUrl),
    }
  }

  const generatePDF = async () => {
    const pdfData = buildPdfPayload()
    const pdfBytes = await generateMaintenanceReport(pdfData)
    const typedArray = new Uint8Array(pdfBytes)
    const blob = new Blob([typedArray], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Service_Report_${pdfData.projectorModel.replace(/\s+/g, '_')}_${Date.now()}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const submitServiceRecord = async () => {
    if (!data.selectedService?.id) {
      throw new Error('Service record ID is missing')
    }

    const summarizeImages = () => {
      if (!data.workImages) {
        return { broken: [], other: [] }
      }
      if (Array.isArray(data.workImages)) {
        return {
          broken: [],
          other: data.workImages,
        }
      }
      return {
        broken: data.workImages.broken || [],
        other: data.workImages.other || [],
      }
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
        images: images.other,
        brokenImages: images.broken,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Submission failed' }))
      throw new Error(errorData.error || 'Failed to submit service record')
    }

    return response.json()
  }

  const handleGenerateAndSubmit = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    setSubmitError(null)
    try {
      if (!hasImageEvidence) {
        throw new Error('Please upload required images before generating the report.')
      }
      const issues = getIssueEntries()
      
      // Generate PDF first
      await generatePDF()
      
      // Submit to database
      await submitServiceRecord()
      
      // Save to localStorage for backup
      saveReportToLocalStorage(issues)
      
      // Clear workflow data and reset to first step BEFORE redirecting
      localStorage.removeItem('workflowData')
      localStorage.removeItem('workflowStep')
      localStorage.removeItem('siteInChargeSignature')
      localStorage.removeItem('engineerSignature')
      
      // Small delay to ensure PDF download starts, then redirect immediately
      setTimeout(() => {
        window.location.href = '/user/workflow'
      }, 200)
    } catch (error) {
      console.error('Error generating or submitting report:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to generate or submit report. Please try again.')
      setIsSubmitting(false)
    }
  }

  const issues = getIssueEntries()

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold text-black mb-2">Generate Report</h2>
      <p className="text-sm text-gray-700 mb-4">Fill the values and generate a PDF report</p>

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
        {!hasImageEvidence && (
          <div className="p-3 border-2 border-amber-500 bg-amber-50 text-amber-800 text-sm">
            Images are required before you can submit the report. Please return to Record Work and upload them.
          </div>
        )}

        <Button
          onClick={handleGenerateAndSubmit}
          disabled={isSubmitting}
          className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black font-bold py-2 text-sm disabled:opacity-50"
        >
          {isSubmitting ? 'Generating PDF...' : 'Generate PDF Report and Submit'}
        </Button>
      </Card>

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
    </div>
  )
}
