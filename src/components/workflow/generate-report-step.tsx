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

  const safe = (value: unknown) => (value ?? '').toString()

  const buildPdfPayloadFromWorkflow = (): MaintenanceReportData => {
    // Build PDF data from in-memory workflow state (used as a fallback)
    const workDetails = data.workDetails || {}
    const service = data.selectedService || {}

    // Map DB/workflow fields into StatusItem:
    // - yesNo: raw DB value (e.g. OK / YES / NO)
    // - status: corresponding note text (or empty string)
    const toStatus = (value: unknown, noteField?: string) => {
      const rawValue = safe(value).trim()
      const note = noteField ? safe(workDetails[noteField]) : ''
      return { 
        status: note,
        yesNo: rawValue,
      }
    }
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
            name: safe(part.name ?? part.description ?? ''),
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
        reflector: toStatus(workDetails.reflector, 'reflectorNote'),
        uvFilter: toStatus(workDetails.uvFilter, 'uvFilterNote'),
        integratorRod: toStatus(workDetails.integratorRod, 'integratorRodNote'),
        coldMirror: toStatus(workDetails.coldMirror, 'coldMirrorNote'),
        foldMirror: toStatus(workDetails.foldMirror, 'foldMirrorNote'),
      },
      electronics: {
        touchPanel: toStatus(workDetails.touchPanel, 'touchPanelNote'),
        evbBoard: toStatus(workDetails.evbBoard, 'evbBoardNote'),
        ImcbBoard: toStatus(workDetails.ImcbBoard, 'ImcbBoardNote'),
        pibBoard: toStatus(workDetails.pibBoard, 'pibBoardNote'),
        IcpBoard: toStatus(workDetails.IcpBoard, 'IcpBoardNote'),
        imbSBoard: toStatus(workDetails.imbSBoard, 'imbSBoardNote'),
      },
      serialVerified: toStatus(workDetails.serialNumberVerified, 'serialNumberVerifiedNote'),
      AirIntakeLadRad: toStatus(workDetails.AirIntakeLadRad, 'AirIntakeLadRadNote'),
      coolant: toStatus(workDetails.coolantLevelColor, 'coolantLevelColorNote'),
      lightEngineTest: {
        white: toStatus(workDetails.lightEngineWhite, 'lightEngineWhiteNote'),
        red: toStatus(workDetails.lightEngineRed, 'lightEngineRedNote'),
        green: toStatus(workDetails.lightEngineGreen, 'lightEngineGreenNote'),
        blue: toStatus(workDetails.lightEngineBlue, 'lightEngineBlueNote'),
        black: toStatus(workDetails.lightEngineBlack, 'lightEngineBlackNote'),
      },
      mechanical: {
        acBlower: toStatus(workDetails.acBlowerVane, 'acBlowerVaneNote'),
        extractor: toStatus(workDetails.extractorVane, 'extractorVaneNote'),
        exhaustCFM: toStatus(workDetails.exhaustCfm, 'exhaustCfmNote'),
        lightEngine4Fans: toStatus(workDetails.lightEngineFans, 'lightEngineFansNote'),
        cardCageFans: toStatus(workDetails.cardCageFans, 'cardCageFansNote'),
        radiatorFan: toStatus(workDetails.radiatorFanPump, 'radiatorFanPumpNote'),
        connectorHose: toStatus(workDetails.pumpConnectorHose, 'pumpConnectorHoseNote'),
        securityLock: toStatus(workDetails.securityLampHouseLock, 'securityLampHouseLockNote'),
      },
      lampLOC: toStatus(workDetails.lampLocMechanism, 'lampLocMechanismNote'),
      lampMake: safe(workDetails.lampMakeModel),
      lampHours: safe(workDetails.lampTotalRunningHours),
      currentLampHours: safe(workDetails.lampCurrentRunningHours),
      voltageParams: {
        pvn: safe(workDetails.pvVsN),
        pve: safe(workDetails.pvVsE),
        nve: safe(workDetails.nvVsE),
      },
      flBefore: safe(workDetails.flLeft),
      flAfter: safe(workDetails.flRight),
      contentPlayer: safe(workDetails.contentPlayerModel),
      acStatus: safe(workDetails.acStatus),
      leStatus: safe(workDetails.leStatus),
      remarks: safe(workDetails.remarks),
      leSerialNo: safe(workDetails.lightEngineSerialNumber),
      mcgdData: {
        white2K: { fl: safe(workDetails.white2Kfl), x: safe(workDetails.white2Kx), y: safe(workDetails.white2Ky) },
        white4K: { fl: safe(workDetails.white4Kfl), x: safe(workDetails.white4Kx), y: safe(workDetails.white4Ky) },
        red2K: { fl: safe(workDetails.red2Kfl), x: safe(workDetails.red2Kx), y: safe(workDetails.red2Ky) },
        red4K: { fl: safe(workDetails.red4Kfl), x: safe(workDetails.red4Kx), y: safe(workDetails.red4Ky) },
        green2K: { fl: safe(workDetails.green2Kfl), x: safe(workDetails.green2Kx), y: safe(workDetails.green2Ky) },
        green4K: { fl: safe(workDetails.green4Kfl), x: safe(workDetails.green4Kx), y: safe(workDetails.green4Ky) },
        blue2K: { fl: safe(workDetails.blue2Kfl), x: safe(workDetails.blue2Kx), y: safe(workDetails.blue2Ky) },
        blue4K: { fl: safe(workDetails.blue4Kfl), x: safe(workDetails.blue4Kx), y: safe(workDetails.blue4Ky) },
      },
      cieXyz2K: {
        x: safe(workDetails.BW_Step_10_2Kx),
        y: safe(workDetails.BW_Step_10_2Ky),
        fl: safe(workDetails.BW_Step_10_2Kfl),
      },
      cieXyz4K: {
        x: safe(workDetails.BW_Step_10_4Kx),
        y: safe(workDetails.BW_Step_10_4Ky),
        fl: safe(workDetails.BW_Step_10_4Kfl),
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
        airPollutionLevel: safe(workDetails.airPollutionLevel),
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
      engineerSignatureUrl: data.engineerSignatureUrl || '',
      siteSignatureUrl: data.siteSignatureUrl || '',
    }
  }

  // Build MaintenanceReportData from a completed service fetched from the database
  const buildPdfPayloadFromService = (service: any): MaintenanceReportData => {
    const mapStatus = (
      value: string | undefined | null,
      note?: string | undefined | null
    ) => {
      return {
        status: note ? note.toString() : '',
        yesNo: value ? value.toString() : '',
      }
    }

    return {
      cinemaName: service.cinemaName || service.site.name || '',
      date: service.date ? new Date(service.date).toLocaleDateString() : '',
      address: service.address || service.site.address || '',
      contactDetails: service.contactDetails || service.site.contactDetails || '',
      location: service.location || '',
      screenNo: service.screenNumber || service.site.screenNo || '',
      serviceVisit: service.serviceNumber.toString(),
      projectorModel: service.projector.model,
      serialNo: service.projector.serialNo,
      runningHours: service.projectorRunningHours?.toString() || '',
      projectorEnvironment: service.workDetails?.projectorPlacementEnvironment || '',
      startTime: service.workDetails?.startTime,
      endTime: service.workDetails?.endTime,

      opticals: {
        reflector: mapStatus(service.workDetails?.reflector, service.workDetails?.reflectorNote),
        uvFilter: mapStatus(service.workDetails?.uvFilter, service.workDetails?.uvFilterNote),
        integratorRod: mapStatus(service.workDetails?.integratorRod, service.workDetails?.integratorRodNote),
        coldMirror: mapStatus(service.workDetails?.coldMirror, service.workDetails?.coldMirrorNote),
        foldMirror: mapStatus(service.workDetails?.foldMirror, service.workDetails?.foldMirrorNote),
      },

      electronics: {
        touchPanel: mapStatus(service.workDetails?.touchPanel, service.workDetails?.touchPanelNote),
        evbBoard: mapStatus(service.workDetails?.evbBoard, service.workDetails?.evbBoardNote),
        ImcbBoard: mapStatus(service.workDetails?.ImcbBoard, service.workDetails?.ImcbBoardNote),
        pibBoard: mapStatus(service.workDetails?.pibBoard, service.workDetails?.pibBoardNote),
        IcpBoard: mapStatus(service.workDetails?.IcpBoard, service.workDetails?.IcpBoardNote),
        imbSBoard: mapStatus(service.workDetails?.imbSBoard, service.workDetails?.imbSBoardNote),
      },

      serialVerified: mapStatus(service.workDetails?.serialNumberVerified, service.workDetails?.serialNumberVerifiedNote),
      AirIntakeLadRad: mapStatus(service.workDetails?.AirIntakeLadRad, service.workDetails?.AirIntakeLadRadNote),
      coolant: mapStatus(service.workDetails?.coolantLevelColor, service.workDetails?.coolantLevelColorNote),

      lightEngineTest: {
        white: mapStatus(service.workDetails?.lightEngineWhite, service.workDetails?.lightEngineWhiteNote),
        red: mapStatus(service.workDetails?.lightEngineRed, service.workDetails?.lightEngineRedNote),
        green: mapStatus(service.workDetails?.lightEngineGreen, service.workDetails?.lightEngineGreenNote),
        blue: mapStatus(service.workDetails?.lightEngineBlue, service.workDetails?.lightEngineBlueNote),
        black: mapStatus(service.workDetails?.lightEngineBlack, service.workDetails?.lightEngineBlackNote),
      },

      mechanical: {
        acBlower: mapStatus(service.workDetails?.acBlowerVane, service.workDetails?.acBlowerVaneNote),
        extractor: mapStatus(service.workDetails?.extractorVane, service.workDetails?.extractorVaneNote),
        exhaustCFM: mapStatus(service.workDetails?.exhaustCfm, service.workDetails?.exhaustCfmNote),
        lightEngine4Fans: mapStatus(service.workDetails?.lightEngineFans, service.workDetails?.lightEngineFansNote),
        cardCageFans: mapStatus(service.workDetails?.cardCageFans, service.workDetails?.cardCageFansNote),
        radiatorFan: mapStatus(service.workDetails?.radiatorFanPump, service.workDetails?.radiatorFanPumpNote),
        connectorHose: mapStatus(service.workDetails?.pumpConnectorHose, service.workDetails?.pumpConnectorHoseNote),
        securityLock: mapStatus(service.workDetails?.securityLampHouseLock, service.workDetails?.securityLampHouseLockNote),
      },

      lampLOC: mapStatus(service.workDetails?.lampLocMechanism, service.workDetails?.lampLocMechanismNote),

      lampMake: service.workDetails?.lampMakeModel || '',
      lampHours: service.workDetails?.lampTotalRunningHours?.toString() || '',
      currentLampHours: service.workDetails?.lampCurrentRunningHours?.toString() || '',

      voltageParams: {
        pvn: service.workDetails?.pvVsN || '',
        pve: service.workDetails?.pvVsE || '',
        nve: service.workDetails?.nvVsE || '',
      },

      flBefore: service.workDetails?.flLeft?.toString() || '',
      flAfter: service.workDetails?.flRight?.toString() || '',

      contentPlayer: service.workDetails?.contentPlayerModel || '',
      acStatus: service.workDetails?.acStatus || '',
      leStatus: service.workDetails?.leStatus || '',
      remarks: service.remarks || '',
      leSerialNo: service.workDetails?.lightEngineSerialNumber || '',

      mcgdData: {
        white2K: {
          fl: service.workDetails?.white2Kfl?.toString() || '',
          x: service.workDetails?.white2Kx?.toString() || '',
          y: service.workDetails?.white2Ky?.toString() || '',
        },
        white4K: {
          fl: service.workDetails?.white4Kfl?.toString() || '',
          x: service.workDetails?.white4Kx?.toString() || '',
          y: service.workDetails?.white4Ky?.toString() || '',
        },
        red2K: {
          fl: service.workDetails?.red2Kfl?.toString() || '',
          x: service.workDetails?.red2Kx?.toString() || '',
          y: service.workDetails?.red2Ky?.toString() || '',
        },
        red4K: {
          fl: service.workDetails?.red4Kfl?.toString() || '',
          x: service.workDetails?.red4Kx?.toString() || '',
          y: service.workDetails?.red4Ky?.toString() || '',
        },
        green2K: {
          fl: service.workDetails?.green2Kfl?.toString() || '',
          x: service.workDetails?.green2Kx?.toString() || '',
          y: service.workDetails?.green2Ky?.toString() || '',
        },
        green4K: {
          fl: service.workDetails?.green4Kfl?.toString() || '',
          x: service.workDetails?.green4Kx?.toString() || '',
          y: service.workDetails?.green4Ky?.toString() || '',
        },
        blue2K: {
          fl: service.workDetails?.blue2Kfl?.toString() || '',
          x: service.workDetails?.blue2Kx?.toString() || '',
          y: service.workDetails?.blue2Ky?.toString() || '',
        },
        blue4K: {
          fl: service.workDetails?.blue4Kfl?.toString() || '',
          x: service.workDetails?.blue4Kx?.toString() || '',
          y: service.workDetails?.blue4Ky?.toString() || '',
        },
      },

      cieXyz2K: {
        x: service.workDetails?.BW_Step_10_2Kx?.toString() || '',
        y: service.workDetails?.BW_Step_10_2Ky?.toString() || '',
        fl: service.workDetails?.BW_Step_10_2Kfl?.toString() || '',
      },
      cieXyz4K: {
        x: service.workDetails?.BW_Step_10_4Kx?.toString() || '',
        y: service.workDetails?.BW_Step_10_4Ky?.toString() || '',
        fl: service.workDetails?.BW_Step_10_4Kfl?.toString() || '',
      },

      softwareVersion: service.workDetails?.softwareVersion || '',

      screenInfo: {
        scope: {
          height: service.workDetails?.screenHeight?.toString() || '',
          width: service.workDetails?.screenWidth?.toString() || '',
          gain: service.workDetails?.screenGain?.toString() || '',
        },
        flat: {
          height: service.workDetails?.flatHeight?.toString() || '',
          width: service.workDetails?.flatWidth?.toString() || '',
          gain: service.workDetails?.screenGain?.toString() || '',
        },
        make: service.workDetails?.screenMake || '',
      },

      throwDistance: service.workDetails?.throwDistance?.toString() || '',

      imageEvaluation: {
        focusBoresite: service.workDetails?.focusBoresight ? 'Yes' : 'No',
        integratorPosition: service.workDetails?.integratorPosition ? 'Yes' : 'No',
        spotOnScreen: service.workDetails?.spotsOnScreen ? 'Yes' : 'No',
        screenCropping: service.workDetails?.screenCroppingOk ? 'Yes' : 'No',
        convergence: service.workDetails?.convergenceOk ? 'Yes' : 'No',
        channelsChecked: service.workDetails?.channelsCheckedOk ? 'Yes' : 'No',
        pixelDefects: service.workDetails?.pixelDefects || '',
        imageVibration: service.workDetails?.imageVibration || '',
        liteLOC: service.workDetails?.liteloc || '',
      },

      airPollution: {
        airPollutionLevel: service.workDetails?.airPollutionLevel || '',
        hcho: service.workDetails?.hcho?.toString() || '',
        tvoc: service.workDetails?.tvoc?.toString() || '',
        pm10: service.workDetails?.pm10?.toString() || '',
        pm25: service.workDetails?.pm2_5?.toString() || '',
        pm100: service.workDetails?.pm1?.toString() || '',
        temperature: service.workDetails?.temperature?.toString() || '',
        humidity: service.workDetails?.humidity?.toString() || '',
      },

      recommendedParts: service.workDetails?.recommendedParts || [],
      engineerSignatureUrl:
        service.signatures?.engineer || (service.signatures as any)?.engineerSignatureUrl || '',
      siteSignatureUrl:
        service.signatures?.site || (service.signatures as any)?.siteSignatureUrl || '',
    }
  }

  const generatePDF = async (serviceFromDb?: any) => {
    const pdfData = serviceFromDb
      ? buildPdfPayloadFromService(serviceFromDb)
      : buildPdfPayloadFromWorkflow()

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

  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    setSubmitError(null)
    try {
      if (!hasImageEvidence) {
        throw new Error('Please upload required images before submitting the report.')
      }

      // Submit to database
      await submitServiceRecord()
      
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
      const issues = getIssueEntries()
      
      // Refetch the completed service from the database to ensure we use persisted data
      let serviceFromDb: any | null = null
      try {
        const res = await fetch('/api/user/services/completed', { credentials: 'include' })
        if (res.ok) {
          const json = await res.json()
          const services = Array.isArray(json.services) ? json.services : []
          serviceFromDb = services.find((s: any) => s.id === data.selectedService?.id) || null
        }
      } catch (err) {
        console.error('Failed to refetch completed services for PDF generation:', err)
      }

      // Generate PDF – prefer DB data, fall back to in-memory workflow data if not found
      await generatePDF(serviceFromDb || undefined)
      
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
