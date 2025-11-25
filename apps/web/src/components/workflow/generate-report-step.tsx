import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import jsPDF from 'jspdf'

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

  const generatePDF = async (issues: { label: string; value: string }[]) => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    let yPosition = 10

    // Header
    pdf.setFontSize(16)
    pdf.text('EW - Preventive Maintenance Report', pageWidth / 2, yPosition, {
      align: 'center',
    })
    yPosition += 8

    pdf.setFontSize(9)
    pdf.text('ASCOMP INC', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 5
    pdf.text('Address: 9, Community Centre, 2nd Floor, Phase I, Mayapuri, New Delhi', pageWidth / 2, yPosition, {
      align: 'center',
    })
    yPosition += 5
    pdf.text('Phone: 011-45501226 | Mobile: 8882475207 | Email: helpdesk@ascompinc.in', pageWidth / 2, yPosition, {
      align: 'center',
    })
    yPosition += 10

    // Service Details
    const service = data.selectedService
    pdf.setFontSize(11)
    pdf.text('SERVICE DETAILS', 10, yPosition)
    yPosition += 6

    pdf.setFontSize(9)
    const details = [
      `Site: ${service.site}`,
      `Projector: ${service.projector}`,
      `Type: ${service.type}`,
      `Date: ${service.date}`,
    ]

    details.forEach((detail) => {
      pdf.text(detail, 15, yPosition)
      yPosition += 5
    })
    yPosition += 5

    // Projector Information
    const workDetails = data.workDetails
    pdf.text('PROJECTOR INFORMATION', 10, yPosition)
    yPosition += 6

    const projectorInfo = [
      `Model: ${workDetails.projectorModel}`,
      `Serial No.: ${workDetails.projectorSerialNumber}`,
      `Running Hours: ${workDetails.projectorRunningHours}`,
    ]

    projectorInfo.forEach((info) => {
      pdf.text(info, 15, yPosition)
      yPosition += 5
    })
    yPosition += 5

    // Cinema Details
    if (yPosition > pageHeight - 50) {
      pdf.addPage()
      yPosition = 10
    }
    pdf.text('CINEMA DETAILS', 10, yPosition)
    yPosition += 6

    const cinemaInfo = [
      `Cinema Name: ${workDetails.cinemaName}`,
      `Address: ${workDetails.address}`,
      `Location: ${workDetails.location}`,
      `Screen No: ${workDetails.screenNumber}`,
      `Contact: ${workDetails.contactDetails}`,
      `Service Type: ${workDetails.serviceVisitType}`,
    ]

    cinemaInfo.forEach((info) => {
      pdf.text(info, 15, yPosition)
      yPosition += 5
    })
    yPosition += 5

    // Opticals Status
    if (yPosition > pageHeight - 50) {
      pdf.addPage()
      yPosition = 10
    }
    pdf.text('COMPONENTS STATUS', 10, yPosition)
    yPosition += 6

    const componentsStatus = [
      `Reflector: ${workDetails.reflector}`,
      `UV Filter: ${workDetails.uvFilter}`,
      `Integrator Rod: ${workDetails.integratorRod}`,
      `Cold Mirror: ${workDetails.coldMirror}`,
      `Fold Mirror: ${workDetails.foldMirror}`,
      `Touch Panel: ${workDetails.touchPanel}`,
      `Coolant Level: ${workDetails.coolantLevelColor}`,
    ]

    componentsStatus.forEach((component) => {
      if (yPosition > pageHeight - 10) {
        pdf.addPage()
        yPosition = 10
      }
      pdf.text(component, 15, yPosition)
      yPosition += 5
    })
    yPosition += 5

    // Light Engine Tests
    if (yPosition > pageHeight - 40) {
      pdf.addPage()
      yPosition = 10
    }
    pdf.text('LIGHT ENGINE TEST RESULTS', 10, yPosition)
    yPosition += 6

    const lightEngineTests = [
      `White: ${workDetails.lightEngineWhite}`,
      `Red: ${workDetails.lightEngineRed}`,
      `Green: ${workDetails.lightEngineGreen}`,
      `Blue: ${workDetails.lightEngineBlue}`,
      `Black: ${workDetails.lightEngineBlack}`,
    ]

    lightEngineTests.forEach((test) => {
      pdf.text(test, 15, yPosition)
      yPosition += 5
    })
    yPosition += 5

    // Additional Details
    if (yPosition > pageHeight - 40) {
      pdf.addPage()
      yPosition = 10
    }
    pdf.text('ADDITIONAL DETAILS', 10, yPosition)
    yPosition += 6

    const additionalInfo = [
      `Software Version: ${workDetails.softwareVersion}`,
      `Lamp Make/Model: ${workDetails.lampMakeModel}`,
      `Screen Make: ${workDetails.screenMake}`,
      `AC Status: ${workDetails.acStatus}`,
    ]

    additionalInfo.forEach((info) => {
      pdf.text(info, 15, yPosition)
      yPosition += 5
    })
    yPosition += 5

    // Issues & Remarks
    if (yPosition > pageHeight - 30) {
      pdf.addPage()
      yPosition = 10
    }
    pdf.text('ISSUES & REMARKS', 10, yPosition)
    yPosition += 6
    if (issues.length > 0) {
      issues.forEach((issue) => {
        if (yPosition > pageHeight - 10) {
          pdf.addPage()
          yPosition = 10
        }
        pdf.text(`• ${issue.label}: ${issue.value}`, 15, yPosition)
        yPosition += 5
      })
    } else {
      pdf.text('No issues reported. All components OK.', 15, yPosition)
      yPosition += 5
    }
    const remarksText = pdf.splitTextToSize(workDetails.remarks || 'No remarks provided.', pageWidth - 20)
    remarksText.forEach((line: string) => {
      if (yPosition > pageHeight - 10) {
        pdf.addPage()
        yPosition = 10
      }
      pdf.text(line, 15, yPosition)
      yPosition += 5
    })

    // Signatures
    if (yPosition > pageHeight - 40) {
      pdf.addPage()
      yPosition = 10
    }
    pdf.text('SIGNATURES', 10, yPosition)
    yPosition += 8
    pdf.rect(10, yPosition, pageWidth / 2 - 15, 20)
    pdf.text('Engineer Signature', 15, yPosition + 15)
    pdf.rect(pageWidth / 2 + 5, yPosition, pageWidth / 2 - 15, 20)
    pdf.text('Site Incharge Signature', pageWidth / 2 + 10, yPosition + 15)
    yPosition += 28

    // Footer
    if (yPosition > pageHeight - 20) {
      pdf.addPage()
      yPosition = pageHeight - 25
    }

    pdf.setFontSize(10)
    pdf.text('SERVICE REPORT GENERATED', 10, yPosition)
    pdf.text(`Date: ${new Date().toLocaleString()}`, 10, yPosition + 5)

    pdf.save(`Service_Report_${service.projector}_${new Date().getTime()}.pdf`)
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
      await generatePDF(issues)
      
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
