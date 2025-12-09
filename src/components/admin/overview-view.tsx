"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Image as ImageIcon, Folder, ExternalLink, Download } from "lucide-react"
import Image from "next/image"
import { generateMaintenanceReport, type MaintenanceReportData } from "@/components/PDFGenerator"

type ServiceRecord = {
  id: string
  [key: string]: any
}

const formatDate = (value?: string | null) => {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

const formatIsoDate = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

const EXCLUDED_KEYS = new Set([
  "id",
  "fieldWorkerId",
  "assignedToId",
  "createdAt",
  "userId",
  "reportGenerated",
  "reportUrl",
  "completedAt",
  "lastServiceDate",
  "projectorId",
  "siteId",
])

// Fields that have corresponding Note fields - merge them
const NOTE_FIELD_MAP: Record<string, string> = {
  reflector: "reflectorNote",
  uvFilter: "uvFilterNote",
  integratorRod: "integratorRodNote",
  coldMirror: "coldMirrorNote",
  foldMirror: "foldMirrorNote",
  touchPanel: "touchPanelNote",
  evbBoard: "evbBoardNote",
  ImcbBoard: "ImcbBoardNote",
  pibBoard: "pibBoardNote",
  IcpBoard: "IcpBoardNote",
  imbSBoard: "imbSBoardNote",
  serialNumberVerified: "serialNumberVerifiedNote",
  AirIntakeLadRad: "AirIntakeLadRadNote",
  coolantLevelColor: "coolantLevelColorNote",
  lightEngineWhite: "lightEngineWhiteNote",
  lightEngineRed: "lightEngineRedNote",
  lightEngineGreen: "lightEngineGreenNote",
  lightEngineBlue: "lightEngineBlueNote",
  lightEngineBlack: "lightEngineBlackNote",
  acBlowerVane: "acBlowerVaneNote",
  extractorVane: "extractorVaneNote",
  exhaustCfm: "exhaustCfmNote",
  lightEngineFans: "lightEngineFansNote",
  cardCageFans: "cardCageFansNote",
  radiatorFanPump: "radiatorFanPumpNote",
  pumpConnectorHose: "pumpConnectorHoseNote",
  lampLocMechanism: "lampLocMechanismNote",
  securityLampHouseLock: "securityLampHouseLockNote",
}

// Priority order for columns - most important first
const COLUMN_PRIORITY = [
  "download",
  "date",
  "serviceNumber",
  "siteName",
  "siteCode",
  "engineerVisited",
  "siteAddress",
  "siteContactDetails",
  "projectorModel",
  "projectorSerial",
  "workerName",
  "status",
  "scheduledDate",
  "projectorRunningHours",
  "cinemaName",
  "address",
  "location",
  "screenNumber",
  "contactDetails",
  "remarks",
]

const LABEL_OVERRIDES: Record<string, string> = {
  download: "",
  engineerVisited: "Engineer Visited",
  serviceNumber: "Service #",
  siteName: "Site",
  siteCode: "Site Code",
  siteAddress: "Site Address",
  siteContactDetails: "Site Contact",
  projectorName: "Projector",
  projectorModel: "Model #",
  projectorSerial: "Serial #",
  projectorStatus: "Projector Status",
  projectorServices: "Service Count",
  projectorLastServiceAt: "Last Service At",
  workerName: "Worker",
  status: "Status",
  scheduledDate: "Scheduled Date",
  date: "Date",
  createdAt: "Created At",
  updatedAt: "Updated At",
  startTime: "Start Time",
  endTime: "End Time",
}

const toLabel = (key: string) => {
  if (LABEL_OVERRIDES[key]) return LABEL_OVERRIDES[key]
  // camelCase / snakeCase to Title Case
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function OverviewView() {
  const [records, setRecords] = useState<ServiceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [workerFilter, setWorkerFilter] = useState<string>("all")
  const [startDate, setStartDate] = useState<string>("")
  const [columnKeys, setColumnKeys] = useState<string[]>([])
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({})
  const [page, setPage] = useState(1)
  const pageSize = 20
  const [columnMenuOpen, setColumnMenuOpen] = useState(false)
  const [columnSearch, setColumnSearch] = useState("")
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false)
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [previewTitle, setPreviewTitle] = useState("")
  const [expandedRemarks, setExpandedRemarks] = useState<Record<string, boolean>>({})
  const [signaturePreviewOpen, setSignaturePreviewOpen] = useState(false)
  const [signatureUrls, setSignatureUrls] = useState<{ site?: string; engineer?: string }>({})

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true)
        setError(null)
        // Fetch all service records; try multiple endpoints in order, tolerate missing ones.
        const tryEndpoints = [
          "/api/admin/tasks",
        ]
        let json: any = null
        let success = false
        let lastErr: string | null = null

        for (const endpoint of tryEndpoints) {
          try {
            const res = await fetch(endpoint, { credentials: "include" })
            if (!res.ok) {
              lastErr = `${endpoint} -> ${res.status} ${res.statusText}`
              continue
            }
            json = await res.json()
            success = true
            break
          } catch (err) {
            lastErr = `${endpoint} -> ${(err as Error).message}`
            continue
          }
        }

        if (!success || !json) {
          setRecords([])
          setError("Failed to fetch service records" + (lastErr ? ` (${lastErr})` : ""))
          return
        }

        const tasks = Array.isArray(json) ? json : json.tasks || json.data || []
        const items: ServiceRecord[] = tasks.map((item: any, idx: number) => {
          const projector = item.projector ?? {}
          const site = item.site ?? {}

          const flattened: ServiceRecord = {
            id: item.id ?? `row-${idx}`,
            ...item,
            download: item.id ?? `row-${idx}`,
            engineerVisited: item.engineerVisited ?? item.user?.name ?? "",
            projectorModel: item.modelNo ?? projector.modelNo ?? item.projectorModel ?? "",
            projectorSerial: item.serialNo ?? projector.serialNo ?? item.projectorSerial ?? "",
            projectorStatus: projector.status ?? "",
            projectorServices: projector.noOfservices ?? "",
            siteName: site.siteName ?? item.siteName ?? "",
            siteCode: site.siteCode ?? "",
            siteAddress: site.address ?? item.address ?? "",
            siteContactDetails: site.contactDetails ?? item.contactDetails ?? "",
          }

          // Merge note fields with their parent fields
          Object.entries(NOTE_FIELD_MAP).forEach(([parentKey, noteKey]) => {
            const parentValue = flattened[parentKey]
            const noteValue = flattened[noteKey]
            if (parentValue || noteValue) {
              if (noteValue) {
                flattened[parentKey] = `${parentValue || ""}${parentValue && noteValue ? " - " : ""}${noteValue}`
              }
              // Keep note field for completeness but avoid duplicate columns
              EXCLUDED_KEYS.add(noteKey)
            }
          })

          // Remove nested objects and excluded fields
          delete flattened.projector
          delete flattened.site
          delete flattened.assignedToId
          delete flattened.createdAt
          delete flattened.userId

          return flattened
        })

        setRecords(items)
        const allKeys = Array.from(
          new Set(
            items
              .flatMap((r) => Object.keys(r))
              .filter((k) => !EXCLUDED_KEYS.has(k)),
          ),
        )
        
        // Sort by priority: priority fields first, then alphabetically
        const derivedKeys = allKeys.sort((a, b) => {
          const aPriority = COLUMN_PRIORITY.indexOf(a)
          const bPriority = COLUMN_PRIORITY.indexOf(b)
          if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority
          if (aPriority !== -1) return -1
          if (bPriority !== -1) return 1
          return a.localeCompare(b)
        })
        
        setColumnKeys(derivedKeys)
        setVisibleColumns((prev) => {
          if (Object.keys(prev).length) return prev
          return derivedKeys.reduce(
            (acc, key) => ({
              ...acc,
              [key]: true,
            }),
            {} as Record<string, boolean>,
          )
        })
      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err.message : "Failed to load records")
      } finally {
        setLoading(false)
      }
    }

    fetchRecords()
  }, [])

  const workerOptions = useMemo(() => {
    const set = new Set<string>()
    records.forEach((r) => {
      if (r.workerName) set.add(r.workerName)
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [records])

  const filtered = useMemo(() => {
    const lower = search.trim().toLowerCase()
    const start = startDate ? new Date(startDate) : null

    const inRange = (d?: string | null) => {
      if (!d) return true
      const dateVal = new Date(d)
      if (Number.isNaN(dateVal.getTime())) return true
      if (start && dateVal < start) return false
      return true
    }

    const matchesSearch = (r: ServiceRecord) =>
      !lower ||
      columnKeys
        .filter((key) => visibleColumns[key]) // search only visible columns to match user view
        .some((key) => {
          const val = r[key]
          if (val === null || val === undefined) return false
          return String(val).toLowerCase().includes(lower)
        })

    const matchesWorker = (rec: ServiceRecord) => workerFilter === "all" || rec.workerName === workerFilter

    return records
      .filter((rec) => matchesWorker(rec) && matchesSearch(rec) && inRange(rec.date || rec.scheduledDate || rec.createdAt))
      .sort((a, b) => {
        const aDate = a.date || a.scheduledDate || a.createdAt
        const bDate = b.date || b.scheduledDate || b.createdAt
        const aTime = aDate ? new Date(aDate).getTime() : 0
        const bTime = bDate ? new Date(bDate).getTime() : 0
        return bTime - aTime // descending newest first
      })
  }, [records, search, workerFilter, startDate])

  useEffect(() => {
    setPage(1)
  }, [search, workerFilter, startDate])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize)

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const setAllColumns = (checked: boolean) => {
    setVisibleColumns((prev) =>
      columnKeys.reduce(
        (acc, key) => ({
          ...acc,
          [key]: checked,
        }),
        { ...prev },
      ),
    )
  }

  const dateLikeKeys = new Set([
    "date",
    "completedAt",
    "scheduledDate",
    "createdAt",
    "updatedAt",
    "startTime",
    "endTime",
  ])

  const handleImageClick = (images: string[], title: string) => {
    setPreviewImages(images)
    setPreviewTitle(title)
    setImagePreviewOpen(true)
  }

  const handleSignatureClick = (signatures: any) => {
    try {
      const sigs = typeof signatures === "string" ? JSON.parse(signatures) : signatures
      setSignatureUrls({
        site: sigs?.site || sigs?.siteSignatureUrl,
        engineer: sigs?.engineer || sigs?.engineerSignatureUrl,
      })
      setSignaturePreviewOpen(true)
    } catch {
      setSignatureUrls({})
      setSignaturePreviewOpen(true)
    }
  }

  const toggleRemarks = (rowId: string) => {
    setExpandedRemarks((prev) => ({ ...prev, [rowId]: !prev[rowId] }))
  }

  const handleDownloadPDF = async (serviceId: string) => {
    try {
      const res = await fetch(`/api/admin/service-records/${serviceId}`, {
        credentials: "include",
      })
      if (!res.ok) {
        throw new Error("Failed to fetch full service record for PDF")
      }
      const json = await res.json()
      const fullService = json.service || json

      const mapStatus = (value?: string | null, note?: string | null) => ({
        status: note ? String(note) : "",
        yesNo: value ? String(value) : "",
      })

      const reportData: MaintenanceReportData = {
        cinemaName: fullService.cinemaName || fullService.site?.siteName || "",
        date: fullService.date ? new Date(fullService.date).toLocaleDateString() : "",
        address: fullService.address || fullService.site?.address || "",
        contactDetails: fullService.contactDetails || fullService.site?.contactDetails || "",
        location: fullService.location || "",
        screenNo: fullService.screenNumber || fullService.site?.screenNo || "",
        serviceVisit: fullService.serviceNumber?.toString() || "",
        projectorModel: fullService.projector?.modelNo || fullService.projectorModel || "",
        serialNo: fullService.projector?.serialNo || fullService.projectorSerial || "",
        runningHours: fullService.projectorRunningHours?.toString() || "",
        projectorEnvironment: fullService.projectorPlacementEnvironment || "",
        startTime: fullService.startTime,
        endTime: fullService.endTime,
        opticals: {
          reflector: mapStatus(fullService.reflector, fullService.reflectorNote),
          uvFilter: mapStatus(fullService.uvFilter, fullService.uvFilterNote),
          integratorRod: mapStatus(fullService.integratorRod, fullService.integratorRodNote),
          coldMirror: mapStatus(fullService.coldMirror, fullService.coldMirrorNote),
          foldMirror: mapStatus(fullService.foldMirror, fullService.foldMirrorNote),
        },
        electronics: {
          touchPanel: mapStatus(fullService.touchPanel, fullService.touchPanelNote),
          evbBoard: mapStatus(fullService.evbBoard, fullService.evbBoardNote),
          ImcbBoard: mapStatus(fullService.ImcbBoard, fullService.ImcbBoardNote),
          pibBoard: mapStatus(fullService.pibBoard, fullService.pibBoardNote),
          IcpBoard: mapStatus(fullService.IcpBoard, fullService.IcpBoardNote),
          imbSBoard: mapStatus(fullService.imbSBoard, fullService.imbSBoardNote),
        },
        serialVerified: mapStatus(fullService.serialNumberVerified, fullService.serialNumberVerifiedNote),
        AirIntakeLadRad: mapStatus(fullService.AirIntakeLadRad, fullService.AirIntakeLadRadNote),
        coolant: mapStatus(fullService.coolantLevelColor, fullService.coolantLevelColorNote),
        lightEngineTest: {
          white: mapStatus(fullService.lightEngineWhite, fullService.lightEngineWhiteNote),
          red: mapStatus(fullService.lightEngineRed, fullService.lightEngineRedNote),
          green: mapStatus(fullService.lightEngineGreen, fullService.lightEngineGreenNote),
          blue: mapStatus(fullService.lightEngineBlue, fullService.lightEngineBlueNote),
          black: mapStatus(fullService.lightEngineBlack, fullService.lightEngineBlackNote),
        },
        mechanical: {
          acBlower: mapStatus(fullService.acBlowerVane, fullService.acBlowerVaneNote),
          extractor: mapStatus(fullService.extractorVane, fullService.extractorVaneNote),
          exhaustCFM: mapStatus(fullService.exhaustCfm, fullService.exhaustCfmNote),
          lightEngine4Fans: mapStatus(fullService.lightEngineFans, fullService.lightEngineFansNote),
          cardCageFans: mapStatus(fullService.cardCageFans, fullService.cardCageFansNote),
          radiatorFan: mapStatus(fullService.radiatorFanPump, fullService.radiatorFanPumpNote),
          connectorHose: mapStatus(fullService.pumpConnectorHose, fullService.pumpConnectorHoseNote),
          securityLock: mapStatus(fullService.securityLampHouseLock, fullService.securityLampHouseLockNote),
        },
        lampLOC: mapStatus(fullService.lampLocMechanism, fullService.lampLocMechanismNote),
        lampMake: fullService.lampMakeModel || "",
        lampHours: fullService.lampTotalRunningHours?.toString() || "",
        currentLampHours: fullService.lampCurrentRunningHours?.toString() || "",
        voltageParams: {
          pvn: fullService.pvVsN || "",
          pve: fullService.pvVsE || "",
          nve: fullService.nvVsE || "",
        },
        flBefore: fullService.flLeft?.toString() || "",
        flAfter: fullService.flRight?.toString() || "",
        contentPlayer: fullService.contentPlayerModel || "",
        acStatus: fullService.acStatus || "",
        leStatus: fullService.leStatus || "",
        remarks: fullService.remarks || "",
        leSerialNo: fullService.lightEngineSerialNumber || "",
        mcgdData: {
          white2K: {
            fl: fullService.white2Kfl?.toString() || "",
            x: fullService.white2Kx?.toString() || "",
            y: fullService.white2Ky?.toString() || "",
          },
          white4K: {
            fl: fullService.white4Kfl?.toString() || "",
            x: fullService.white4Kx?.toString() || "",
            y: fullService.white4Ky?.toString() || "",
          },
          red2K: {
            fl: fullService.red2Kfl?.toString() || "",
            x: fullService.red2Kx?.toString() || "",
            y: fullService.red2Ky?.toString() || "",
          },
          red4K: {
            fl: fullService.red4Kfl?.toString() || "",
            x: fullService.red4Kx?.toString() || "",
            y: fullService.red4Ky?.toString() || "",
          },
          green2K: {
            fl: fullService.green2Kfl?.toString() || "",
            x: fullService.green2Kx?.toString() || "",
            y: fullService.green2Ky?.toString() || "",
          },
          green4K: {
            fl: fullService.green4Kfl?.toString() || "",
            x: fullService.green4Kx?.toString() || "",
            y: fullService.green4Ky?.toString() || "",
          },
          blue2K: {
            fl: fullService.blue2Kfl?.toString() || "",
            x: fullService.blue2Kx?.toString() || "",
            y: fullService.blue2Ky?.toString() || "",
          },
          blue4K: {
            fl: fullService.blue4Kfl?.toString() || "",
            x: fullService.blue4Kx?.toString() || "",
            y: fullService.blue4Ky?.toString() || "",
          },
        },
        cieXyz2K: {
          x: fullService.BW_Step_10_2Kx?.toString() || "",
          y: fullService.BW_Step_10_2Ky?.toString() || "",
          fl: fullService.BW_Step_10_2Kfl?.toString() || "",
        },
        cieXyz4K: {
          x: fullService.BW_Step_10_4Kx?.toString() || "",
          y: fullService.BW_Step_10_4Ky?.toString() || "",
          fl: fullService.BW_Step_10_4Kfl?.toString() || "",
        },
        softwareVersion: fullService.softwareVersion || "",
        screenInfo: {
          scope: {
            height: fullService.screenHeight?.toString() || "",
            width: fullService.screenWidth?.toString() || "",
            gain: fullService.screenGain?.toString() || "",
          },
          flat: {
            height: fullService.flatHeight?.toString() || "",
            width: fullService.flatWidth?.toString() || "",
            gain: fullService.screenGain?.toString() || "",
          },
          make: fullService.screenMake || "",
        },
        throwDistance: fullService.throwDistance?.toString() || "",
        imageEvaluation: {
          focusBoresite: fullService.focusBoresight ? "Yes" : "No",
          integratorPosition: fullService.integratorPosition ? "Yes" : "No",
          spotOnScreen: fullService.spotsOnScreen ? "Yes" : "No",
          screenCropping: fullService.screenCroppingOk ? "Yes" : "No",
          convergence: fullService.convergenceOk ? "Yes" : "No",
          channelsChecked: fullService.channelsCheckedOk ? "Yes" : "No",
          pixelDefects: fullService.pixelDefects || "",
          imageVibration: fullService.imageVibration || "",
          liteLOC: fullService.liteloc || "",
        },
        airPollution: {
          airPollutionLevel: fullService.airPollutionLevel || "",
          hcho: fullService.hcho?.toString() || "",
          tvoc: fullService.tvoc?.toString() || "",
          pm10: fullService.pm10?.toString() || "",
          pm25: fullService.pm2_5?.toString() || "",
          pm100: fullService.pm1?.toString() || "",
          temperature: fullService.temperature?.toString() || "",
          humidity: fullService.humidity?.toString() || "",
        },
        recommendedParts: Array.isArray(fullService.recommendedParts)
          ? fullService.recommendedParts.map((part: any) => ({
              name: String(part.name ?? part.description ?? ""),
              partNumber: String(part.partNumber ?? part.part_number ?? ""),
            }))
          : [],
        issueNotes: [],
        detectedIssues: [],
        reportGenerated: true,
        reportUrl: "",
        engineerSignatureUrl:
          fullService.signatures?.engineer || (fullService.signatures as any)?.engineerSignatureUrl || "",
        siteSignatureUrl: fullService.signatures?.site || (fullService.signatures as any)?.siteSignatureUrl || "",
      }

      const pdfBytes = await generateMaintenanceReport(reportData)
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `Service_Report_${fullService.serviceNumber ?? serviceId}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to generate PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    }
  }

  const formatValue = (key: string, value: any, rowId: string) => {
    if (value === null || value === undefined) return "—"
    
    // Handle download action
    if (key === "download") {
      return (
        <button
          onClick={() => handleDownloadPDF(rowId)}
          className="inline-flex gap-4 rounded-md items-center justify-center text-white bg-black p-2 w-full transition-colors"
          title="Download PDF Report"
        >
          <span>Report</span>
          <Download className="h-4 w-4" />
        </button>
      )
    }
    
    // Handle signatures
    if (key === "signatures" && value) {
      const hasSignatures = typeof value === "object" || (typeof value === "string" && value.includes("http"))
      if (hasSignatures) {
        return (
          <button
            onClick={() => handleSignatureClick(value)}
            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline"
          >
            <ImageIcon className="h-4 w-4" />
            <span>View</span>
          </button>
        )
      }
      return "—"
    }
    
    // Handle remarks with expand/collapse
    if (key === "remarks" && typeof value === "string" && value) {
      const isExpanded = expandedRemarks[rowId]
      const maxLength = 50
      const shouldTruncate = value.length > maxLength
      
      return (
        <button
          onClick={() => toggleRemarks(rowId)}
          className="text-left hover:text-blue-600 transition-colors"
          title={shouldTruncate ? "Click to expand/collapse" : ""}
        >
          {shouldTruncate && !isExpanded ? `${value.substring(0, maxLength)}...` : value}
        </button>
      )
    }
    
    // Handle fields with notes (merged format: "OK - Note")
    if (NOTE_FIELD_MAP[key] && typeof value === "string") {
      const parts = value.split(" - ")
      const mainValue = parts[0] || ""
      const noteValue = parts.slice(1).join(" - ") || ""
      
      if (!noteValue) {
        return <span>{mainValue || "—"}</span>
      }
      
      return (
        <div className="flex flex-col items-start gap-1">
          <span>{mainValue}</span>
          <span className="text-gray-600 text-xs bg-gray-200 p-2 rounded-sm">{noteValue}</span>
        </div>
      )
    }
    
    // Handle image arrays
    if (key === "images" && Array.isArray(value) && value.length > 0) {
      return (
        <button
          onClick={() => handleImageClick(value, "Images")}
          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline"
        >
          <ImageIcon className="h-4 w-4" />
          <span>{value.length} image{value.length !== 1 ? "s" : ""}</span>
        </button>
      )
    }
    
    if (key === "brokenImages" && Array.isArray(value) && value.length > 0) {
      return (
        <button
          onClick={() => handleImageClick(value, "Broken Images")}
          className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-800 hover:underline"
        >
          <ImageIcon className="h-4 w-4" />
          <span>{value.length} broken</span>
        </button>
      )
    }
    
    // Handle drive link
    if (key === "photosDriveLink" && typeof value === "string" && value) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline"
        >
          <Folder className="h-4 w-4" />
          <span>Drive</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      )
    }
    
    if (typeof value === "boolean") return value ? "Yes" : "No"
    if (Array.isArray(value)) return value.length > 0 ? `${value.length} items` : "—"
    if (typeof value === "object") return JSON.stringify(value)
    if (dateLikeKeys.has(key) && typeof value === "string") return formatDate(value)
    return String(value)
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-none border-none">
        <CardHeader className="flex flex-col gap-3">
          <CardTitle className="text-lg font-semibold text-black">Service Records</CardTitle>
          <div className="flex flex-col w-full gap-3 border-b-2 pb-4">
            <div className="flex flex-wrap gap-3">
              <Input
                placeholder="Search site, projector, model, worker..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-2 border-black text-sm flex-1 min-w-[200px]"
              />
              <Popover open={columnMenuOpen} onOpenChange={setColumnMenuOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-2 border-black text-sm"
                  >
                    Columns
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 max-h-96 overflow-hidden rounded-md border-2 border-black bg-white shadow-lg">
                  <div className="p-3 space-y-2">
                    <Input
                      placeholder="Search columns..."
                      value={columnSearch}
                      onChange={(e) => setColumnSearch(e.target.value)}
                      className="border-2 border-black text-sm"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Toggle visibility</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-black"
                        onClick={() => {
                          const allSelected = columnKeys.every((k) => visibleColumns[k])
                          setAllColumns(!allSelected)
                        }}
                      >
                        {columnKeys.every((k) => visibleColumns[k]) ? "Deselect all" : "Select all"}
                      </Button>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto border-t border-black/20">
                    {columnKeys
                      .filter((key) => toLabel(key).toLowerCase().includes(columnSearch.toLowerCase()))
                      .map((key) => (
                        <label
                          key={key}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-black hover:bg-gray-50"
                        >
                          <Checkbox
                            checked={visibleColumns[key]}
                            onCheckedChange={() => toggleColumn(key as any)}
                            className="border-black"
                          />
                          {toLabel(key)}
                        </label>
                      ))}
                  </div>
                </PopoverContent>
              </Popover>
              <div className="flex flex-wrap gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="border-2 border-black text-sm w-fit justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? formatDate(startDate) : "Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate ? new Date(startDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setStartDate(formatIsoDate(date))
                      } else {
                        setStartDate("")
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button
                variant="outline"
                className="border-2 border-black text-sm"
                onClick={() => {
                  setSearch("")
                  setWorkerFilter("all")
                  setStartDate("")
                  setPage(1)
                }}
              >
                Reset filters
              </Button>
            </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-sm text-gray-600">Loading records...</div>
          ) : error ? (
            <div className="py-12 text-center text-sm text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-600">No records found.</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  {columnKeys.filter((k) => visibleColumns[k]).map((key) => (
                    <th key={key} className="text-left whitespace-nowrap py-3 px-4 font-semibold text-black">
                      {toLabel(key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-gray-50">
                    {columnKeys.filter((k) => visibleColumns[k]).map((key) => (
                      <td key={key} className="py-3 px-4 whitespace-nowrap text-black">
                        {formatValue(key, row[key], row.id)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between px-6 pb-4 text-sm text-black">
            <span>
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-black"
              >
                Prev
              </Button>
              <span>
                Page {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="border-black"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Image Preview Dialog */}
      <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewTitle}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {previewImages.map((imageUrl, idx) => (
              <div key={idx} className="relative aspect-square border border-gray-200 rounded overflow-hidden bg-gray-50">
                <Image
                  src={imageUrl}
                  alt={`${previewTitle} ${idx + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform cursor-pointer"
                  sizes="(max-width: 768px) 50vw, 33vw"
                  onClick={() => window.open(imageUrl, "_blank")}
                />
              </div>
            ))}
          </div>
          {previewImages.length === 0 && (
            <p className="text-center text-gray-500 py-8">No images available</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Signature Preview Dialog */}
      <Dialog open={signaturePreviewOpen} onOpenChange={setSignaturePreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Signatures</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {signatureUrls.site && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-gray-700">Site Signature</h3>
                <div className="relative w-full h-32 border border-gray-200 rounded overflow-hidden bg-gray-50">
                  <Image
                    src={signatureUrls.site}
                    alt="Site Signature"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            )}
            {signatureUrls.engineer && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-gray-700">Engineer Signature</h3>
                <div className="relative w-full h-32 border border-gray-200 rounded overflow-hidden bg-gray-50">
                  <Image
                    src={signatureUrls.engineer}
                    alt="Engineer Signature"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            )}
            {!signatureUrls.site && !signatureUrls.engineer && (
              <p className="text-center text-gray-500 py-8 col-span-2">No signatures available</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
