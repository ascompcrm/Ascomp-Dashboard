"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import type { Route } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import ScheduleServiceModal from "@/components/admin/modals/schedule-service-modal"
import { DatePicker } from "@/components/date-range-picker"
import { generateMaintenanceReport, type MaintenanceReportData } from "@/components/PDFGenerator"

interface OverviewStats {
  totalSites: number
  totalProjectors: number
  fieldWorkers: number
  pendingServices: number
  completedServices: number
  scheduledServices: number
  activeWorkers: number
}

interface RecentTask {
  id: string
  projectorId: string
  siteId: string
  fieldWorkerId: string
  scheduledDate: string
  status: "pending" | "completed" | "scheduled" | "in_progress"
  projectorName: string
  workerName: string
  siteName: string
  siteAddress?: string
  siteCode?: string
  screenNumber?: string
  lastServiceDate?: string
  rawStatus?: string
}

interface OverviewData {
  stats: OverviewStats
  recentTasks: RecentTask[]
}

interface CompletedService {
  id: string
  projectorId: string
  siteId: string
  siteName: string
  projectorName: string
  workerName: string
  scheduledDate: string
  completedAt?: string
  reportUrl?: string | null
  serviceNumber?: string
}

export default function OverviewView() {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tasks, setTasks] = useState<RecentTask[]>([])
  const [tasksLoading, setTasksLoading] = useState(false)
  const [timeRange, setTimeRange] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("pending")
  const [scheduleTarget, setScheduleTarget] = useState<{ siteId: string; projectorId: string } | null>(null)
  const [completedServices, setCompletedServices] = useState<CompletedService[]>([])
  const [completedLoading, setCompletedLoading] = useState(false)
  const [completedStartDate, setCompletedStartDate] = useState<string>("")
  const [completedWorkerFilter, setCompletedWorkerFilter] = useState<string>("all")
  const [fieldWorkers, setFieldWorkers] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [completedPage, setCompletedPage] = useState<number>(1)
  const [completedTotalCount, setCompletedTotalCount] = useState<number>(0)
  const completedPageSize = 10

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch("/api/admin/overview")
        if (!response.ok) {
          throw new Error("Failed to fetch overview data")
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        console.error("Error fetching overview data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const fetchTasks = useCallback(async () => {
    try {
      setTasksLoading(true)
      const params = new URLSearchParams()
      if (timeRange !== "all") {
        params.append("timeRange", timeRange)
      }
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      const response = await fetch(`/api/admin/tasks?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch tasks")
      }
      const result = await response.json()
      setTasks(result.tasks || [])
    } catch (err) {
      console.error("Error fetching tasks:", err)
      setTasks([])
    } finally {
      setTasksLoading(false)
    }
  }, [statusFilter, timeRange])

  const fetchCompletedServices = useCallback(async () => {
    try {
      setCompletedLoading(true)
      const params = new URLSearchParams()
      params.append("status", "completed")
      
      // Add start date if provided
      if (completedStartDate) {
        params.append("startDate", completedStartDate)
      }
      
      // Add worker filter
      if (completedWorkerFilter !== "all") {
        params.append("workerId", completedWorkerFilter)
      }

      // Add pagination
      params.append("page", completedPage.toString())
      params.append("limit", completedPageSize.toString())

      const response = await fetch(`/api/admin/tasks?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch completed services")
      }
      const result = await response.json()
      const services: CompletedService[] = (result.tasks || [])
        .map((service: any) => ({
          id: service.id,
          projectorId: service.projectorId,
          siteId: service.siteId,
          siteName: service.siteName,
          projectorName: service.projectorName,
          workerName: service.workerName,
          scheduledDate: service.scheduledDate,
          completedAt: service.completedAt,
          reportUrl: service.reportUrl,
          serviceNumber: service.serviceNumber,
        }))
        // Ensure strict latest→oldest ordering based on the service's scheduled date
        .sort((a: CompletedService, b: CompletedService) => {
          const aTime = a.scheduledDate ? new Date(a.scheduledDate).getTime() : 0
          const bTime = b.scheduledDate ? new Date(b.scheduledDate).getTime() : 0
          return bTime - aTime
        })
      setCompletedServices(services)
      setCompletedTotalCount(result.totalCount || 0)
    } catch (err) {
      console.error("Error fetching completed services:", err)
      setCompletedServices([])
      setCompletedTotalCount(0)
    } finally {
      setCompletedLoading(false)
    }
  }, [completedStartDate, completedWorkerFilter, completedPage, completedPageSize])

  const fetchFieldWorkers = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/field-workers")
      if (!response.ok) {
        throw new Error("Failed to fetch field workers")
      }
      const result = await response.json()
      setFieldWorkers(result.workers || [])
    } catch (err) {
      console.error("Error fetching field workers:", err)
      setFieldWorkers([])
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  useEffect(() => {
    fetchCompletedServices()
  }, [fetchCompletedServices])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCompletedPage(1)
  }, [completedStartDate, completedWorkerFilter])

  useEffect(() => {
    fetchFieldWorkers()
  }, [fetchFieldWorkers])

  if (loading) {
    return <OverviewSkeleton />
  }

  if (error || !data) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">
              {error || "Failed to load overview data. Please try again later."}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { stats } = data

  const statCards = [
    { label: "Total Sites", value: stats.totalSites, color: "text-slate-700" },
    { label: "Total Projectors", value: stats.totalProjectors, color: "text-slate-700" },
    { label: "Field Workers", value: stats.fieldWorkers, color: "text-slate-700" },
    { label: "Pending Services", value: stats.pendingServices, color: "text-red-600", highlight: true },
    { label: "Completed", value: stats.completedServices, color: "text-green-600" },
    { label: "Scheduled", value: stats.scheduledServices, color: "text-slate-700" },
  ]

  const buildProjectorRoute = (siteId?: string | null, projectorId?: string | null): Route | null => {
    if (!siteId || !projectorId) {
      return null
    }
    return `/admin/dashboard/sites/${siteId}/projectors/${projectorId}` as Route
  }

  const buildReportDataFromService = (service: any): MaintenanceReportData => {
    const mapStatus = (value?: string | null, note?: string | null): { status: string; yesNo: string } => ({
      status: note ? String(note) : "",
      yesNo: value ? String(value) : "",
    })

    return {
      cinemaName: service.cinemaName || service.site.name || "",
      date: service.date ? new Date(service.date).toLocaleDateString() : "",
      address: service.address || service.site.address || "",
      contactDetails: service.contactDetails || service.site.contactDetails || "",
      location: service.location || "",
      screenNo: service.screenNumber || service.site.screenNo || "",
      serviceVisit: service.serviceNumber?.toString() || "",
      projectorModel: service.projector.model,
      serialNo: service.projector.serialNo,
      runningHours: service.projectorRunningHours?.toString() || "",
      projectorEnvironment: service.workDetails?.projectorPlacementEnvironment || "",
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
      serialVerified: mapStatus(
        service.workDetails?.serialNumberVerified,
        service.workDetails?.serialNumberVerifiedNote,
      ),
      AirIntakeLadRad: mapStatus(service.workDetails?.AirIntakeLadRad, service.workDetails?.AirIntakeLadRadNote),
      coolant: mapStatus(service.workDetails?.coolantLevelColor, service.workDetails?.coolantLevelColorNote),
      lightEngineTest: {
        white: mapStatus(service.workDetails?.lightEngineWhite),
        red: mapStatus(service.workDetails?.lightEngineRed),
        green: mapStatus(service.workDetails?.lightEngineGreen),
        blue: mapStatus(service.workDetails?.lightEngineBlue),
        black: mapStatus(service.workDetails?.lightEngineBlack),
      },
      mechanical: {
        acBlower: mapStatus(service.workDetails?.acBlowerVane, service.workDetails?.acBlowerVaneNote),
        extractor: mapStatus(service.workDetails?.extractorVane, service.workDetails?.extractorVaneNote),
        exhaustCFM: mapStatus(service.workDetails?.exhaustCfm, service.workDetails?.exhaustCfmNote),
        lightEngine4Fans: mapStatus(service.workDetails?.lightEngineFans, service.workDetails?.lightEngineFansNote),
        cardCageFans: mapStatus(service.workDetails?.cardCageFans, service.workDetails?.cardCageFansNote),
        radiatorFan: mapStatus(service.workDetails?.radiatorFanPump, service.workDetails?.radiatorFanPumpNote),
        connectorHose: mapStatus(service.workDetails?.pumpConnectorHose, service.workDetails?.pumpConnectorHoseNote),
        securityLock: mapStatus(service.workDetails?.securityLampHouseLock),
      },
      lampLOC: mapStatus(service.workDetails?.lampLocMechanism, service.workDetails?.lampLocMechanismNote),
      lampMake: service.workDetails?.lampMakeModel || "",
      lampHours: service.workDetails?.lampTotalRunningHours?.toString() || "",
      currentLampHours: service.workDetails?.lampCurrentRunningHours?.toString() || "",
      voltageParams: {
        pvn: service.workDetails?.pvVsN || "",
        pve: service.workDetails?.pvVsE || "",
        nve: service.workDetails?.nvVsE || "",
      },
      flBefore: service.workDetails?.flLeft?.toString() || "",
      flAfter: service.workDetails?.flRight?.toString() || "",
      contentPlayer: service.workDetails?.contentPlayerModel || "",
      acStatus: service.workDetails?.acStatus || "",
      leStatus: service.workDetails?.leStatus || "",
      remarks: service.remarks || "",
      leSerialNo: service.workDetails?.lightEngineSerialNumber || "",
      mcgdData: {
        white2K: {
          fl: service.workDetails?.white2Kfl?.toString() || "",
          x: service.workDetails?.white2Kx?.toString() || "",
          y: service.workDetails?.white2Ky?.toString() || "",
        },
        white4K: {
          fl: service.workDetails?.white4Kfl?.toString() || "",
          x: service.workDetails?.white4Kx?.toString() || "",
          y: service.workDetails?.white4Ky?.toString() || "",
        },
        red2K: {
          fl: service.workDetails?.red2Kfl?.toString() || "",
          x: service.workDetails?.red2Kx?.toString() || "",
          y: service.workDetails?.red2Ky?.toString() || "",
        },
        red4K: {
          fl: service.workDetails?.red4Kfl?.toString() || "",
          x: service.workDetails?.red4Kx?.toString() || "",
          y: service.workDetails?.red4Ky?.toString() || "",
        },
        green2K: {
          fl: service.workDetails?.green2Kfl?.toString() || "",
          x: service.workDetails?.green2Kx?.toString() || "",
          y: service.workDetails?.green2Ky?.toString() || "",
        },
        green4K: {
          fl: service.workDetails?.green4Kfl?.toString() || "",
          x: service.workDetails?.green4Kx?.toString() || "",
          y: service.workDetails?.green4Ky?.toString() || "",
        },
        blue2K: {
          fl: service.workDetails?.blue2Kfl?.toString() || "",
          x: service.workDetails?.blue2Kx?.toString() || "",
          y: service.workDetails?.blue2Ky?.toString() || "",
        },
        blue4K: {
          fl: service.workDetails?.blue4Kfl?.toString() || "",
          x: service.workDetails?.blue4Kx?.toString() || "",
          y: service.workDetails?.blue4Ky?.toString() || "",
        },
      },
      cieXyz2K: {
        x: service.workDetails?.BW_Step_10_2Kx?.toString() || "",
        y: service.workDetails?.BW_Step_10_2Ky?.toString() || "",
        fl: service.workDetails?.BW_Step_10_2Kfl?.toString() || "",
      },
      cieXyz4K: {
        x: service.workDetails?.BW_Step_10_4Kx?.toString() || "",
        y: service.workDetails?.BW_Step_10_4Ky?.toString() || "",
        fl: service.workDetails?.BW_Step_10_4Kfl?.toString() || "",
      },
      softwareVersion: service.workDetails?.softwareVersion || "",
      screenInfo: {
        scope: {
          height: service.workDetails?.screenHeight?.toString() || "",
          width: service.workDetails?.screenWidth?.toString() || "",
          gain: service.workDetails?.screenGain?.toString() || "",
        },
        flat: {
          height: service.workDetails?.flatHeight?.toString() || "",
          width: service.workDetails?.flatWidth?.toString() || "",
          gain: service.workDetails?.screenGain?.toString() || "",
        },
        make: service.workDetails?.screenMake || "",
      },
      throwDistance: service.workDetails?.throwDistance?.toString() || "",
      imageEvaluation: {
        focusBoresite: service.workDetails?.focusBoresight ? "Yes" : "No",
        integratorPosition: service.workDetails?.integratorPosition ? "Yes" : "No",
        spotOnScreen: service.workDetails?.spotsOnScreen ? "Yes" : "No",
        screenCropping: service.workDetails?.screenCroppingOk ? "Yes" : "No",
        convergence: service.workDetails?.convergenceOk ? "Yes" : "No",
        channelsChecked: service.workDetails?.channelsCheckedOk ? "Yes" : "No",
        pixelDefects: service.workDetails?.pixelDefects || "",
        imageVibration: service.workDetails?.imageVibration || "",
        liteLOC: service.workDetails?.liteloc || "",
      },
      airPollution: {
        airPollutionLevel: service.workDetails?.airPollutionLevel || "",
        hcho: service.workDetails?.hcho?.toString() || "",
        tvoc: service.workDetails?.tvoc?.toString() || "",
        pm10: service.workDetails?.pm10?.toString() || "",
        pm25: service.workDetails?.pm2_5?.toString() || "",
        pm100: service.workDetails?.pm1?.toString() || "",
        temperature: service.workDetails?.temperature?.toString() || "",
        humidity: service.workDetails?.humidity?.toString() || "",
      },
      recommendedParts: Array.isArray(service.workDetails?.recommendedParts)
        ? service.workDetails.recommendedParts.map((part: any) => ({
            name: String(part.name ?? part.description ?? ""),
            partNumber: String(part.partNumber ?? part.part_number ?? ""),
          }))
        : [],
      issueNotes: [],
      detectedIssues: [],
      reportGenerated: true,
      reportUrl: "",
      engineerSignatureUrl:
        service.signatures?.engineer || (service.signatures as any)?.engineerSignatureUrl || "",
      siteSignatureUrl: service.signatures?.site || (service.signatures as any)?.siteSignatureUrl || "",
    }
  }

  const handleAdminDownloadPdf = async (service: CompletedService) => {
    try {
      const res = await fetch(`/api/admin/service-records/${service.id}`, {
        credentials: "include",
      })
      if (!res.ok) {
        throw new Error("Failed to fetch full service record for PDF")
      }
      const json = await res.json()
      const fullService = json.service
      const reportData = buildReportDataFromService(fullService)
      const pdfBytes = await generateMaintenanceReport(reportData)
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `Service_Report_${service.serviceNumber ?? ""}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to generate PDF from admin overview:", error)
      alert("Failed to generate PDF. Please try again.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            className={`${
              stat.highlight ? "border-red-200 bg-red-50 dark:bg-red-950/20" : "bg-card"
            } border transition-shadow hover:shadow-md`}
          >
            <CardContent className="flex flex-col w-full gap-3">
              <p className="text-xs font-medium text-muted-foreground w-full">{stat.label}</p>
              <p className={`text-4xl font-bold ${stat.color} w-full`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-white border flex flex-col gap-4 rounded-lg px-6 py-4">
        <div className="flex">
          <div className="flex items-center justify-between w-full">
            <CardTitle className="text-lg font-semibold">Task Assignments</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex flex-col gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          </div>
        </div>
        <div>
          {tasksLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading tasks...</span>
              </div>
            </div>
          ) : tasks.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              {tasks.map((task) => {
                const scheduledDate = task.scheduledDate ? new Date(task.scheduledDate) : null
                const hasValidScheduledDate = scheduledDate && !Number.isNaN(scheduledDate.getTime())
                const formattedScheduledDate = hasValidScheduledDate
                  ? scheduledDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : null

                const lastServiceDate = task.lastServiceDate ? new Date(task.lastServiceDate) : null
                const hasValidLastServiceDate = lastServiceDate && !Number.isNaN(lastServiceDate.getTime())
                const formattedLastServiceDate = hasValidLastServiceDate
                  ? lastServiceDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : null

                const isUnassigned =
                  !task.workerName || task.workerName.trim() === "" || task.workerName === "Unassigned"

                const statusBadge =
                  task.status === "pending"
                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    : task.status === "scheduled"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                      : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"

                return (
                  <div
                    key={task.id}
                    className="flex min-w-[260px] h-[34vh] max-h-[34vh] max-w-[300px] justify-between flex-col gap-3 rounded-lg border bg-muted/40 p-4"
                  >
                    <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{task.projectorName}</p>
                        <p className="text-xs text-muted-foreground">{task.siteName}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusBadge}`}>
                        {task.status === "pending"
                          ? "Pending"
                          : task.status === "scheduled"
                            ? "Scheduled"
                            : "Completed"}
                      </span>
                    </div>

                    <div className="space-y-2 rounded-md bg-white/70 p-3 text-xs shadow-sm">
                      {task.status === "pending" ? (
                        <>
                          {(task.siteAddress || task.siteCode) && (
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-muted-foreground">
                                {task.siteCode ? "Site Code" : "Address"}
                              </span>
                              <span className="font-semibold text-foreground">
                                {task.siteCode || task.siteAddress}
                              </span>
                            </div>
                          )}
                          {task.screenNumber && (
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-muted-foreground">Audi Number</span>
                              <span className="font-semibold text-foreground">{task.screenNumber}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">Scheduled for</span>
                            <span
                              className={
                                hasValidScheduledDate
                                  ? "font-semibold text-foreground"
                                  : "font-semibold text-amber-600"
                              }
                            >
                              {hasValidScheduledDate ? formattedScheduledDate : "Not scheduled"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">Assigned to</span>
                            <span className={isUnassigned ? "font-semibold text-amber-600" : "font-semibold text-foreground"}>
                              {isUnassigned ? "Unassigned" : task.workerName}
                            </span>
                          </div>
                        </>
                          )}
                          {task.status === "pending" && (
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-muted-foreground">Last serviced</span>
                              <span
                                className={
                                  hasValidLastServiceDate
                                    ? "font-semibold text-foreground"
                                    : "font-semibold text-muted-foreground"
                                }
                              >
                                {hasValidLastServiceDate ? formattedLastServiceDate : "—"}
                              </span>
                            </div>
                          )}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-muted-foreground text-xs">Address:</span>
                            <span className="font-semibold text-foreground text-xs">{task.siteAddress}</span>
                          </div>
                    </div>
                    
                    <div className="mt-1 flex flex-wrap w-full justify-end gap-2">
                      {task.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-dashed"
                          disabled={!task.siteId || !task.projectorId}
                          onClick={() => {
                            if (!task.siteId || !task.projectorId) return
                            setScheduleTarget({ siteId: task.siteId, projectorId: task.projectorId })
                          }}
                        >
                          Schedule visit
                        </Button>
                      )}
                      {task.status === "completed" && buildProjectorRoute(task.siteId, task.projectorId) && (
                        <Button size="sm" variant="secondary" asChild>
                          <Link href={buildProjectorRoute(task.siteId, task.projectorId)!}>View report</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">No tasks found matching the selected filters.</p>
            </div>
          )}
        </div>
      </div>

      <div className="w-full">
        <Card>
          <CardHeader>
            <div className="flex items-center w-full justify-between gap-4">
              <CardTitle className="text-base font-semibold">Latest Completed Services</CardTitle>
              <div className="flex items-end gap-3">
                <div className="">
                  <DatePicker
                    label=""
                    value={completedStartDate}
                    onChange={setCompletedStartDate}
                    placeholder="Select start date"
                  />
                </div>
                <div className="">
                  <Select value={completedWorkerFilter} onValueChange={setCompletedWorkerFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Field Worker" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Workers</SelectItem>
                      {fieldWorkers.map((worker) => (
                        <SelectItem key={worker.id} value={worker.id}>
                          {worker.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {completedLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg bg-muted/30 animate-pulse h-24" />
                ))}
              </div>
            ) : completedServices.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
                  {completedServices.map((service) => {
                    // Use the service record's scheduled date (schema: ServiceRecord.date)
                    const completedDate = service.scheduledDate || service.completedAt
                    const formattedCompletedDate = completedDate
                      ? new Date(completedDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Not available"
                    const projectorRoute = buildProjectorRoute(service.siteId, service.projectorId)

                    const viewDetailsButton = projectorRoute ? (
                      <Button size="sm" variant="secondary" asChild>
                        <Link href={projectorRoute}>View details</Link>
                      </Button>
                    ) : (
                      <Button size="sm" variant="secondary" disabled>
                        View details
                      </Button>
                    )

                    const downloadReportButton = (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAdminDownloadPdf(service)}
                      >
                        Download report
                      </Button>
                    )

                    return (
                      <div
                        key={service.id}
                        className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card/70 p-5 shadow-sm"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-base font-semibold text-foreground">{service.projectorName}</p>
                            <p className="text-sm text-muted-foreground">{service.siteName}</p>
                          </div>
                          <span className="inline-flex w-fit items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase text-green-700">
                            Completed
                          </span>
                        </div>
                        <div className="grid gap-3 text-sm md:grid-cols-3">
                          <div>
                            <p className="text-muted-foreground">Completed on</p>
                            <p className="font-semibold text-foreground">{formattedCompletedDate}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Assigned engineer</p>
                            <p className="font-semibold text-foreground">{service.workerName || "—"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Service #</p>
                            <p className="font-semibold text-foreground">
                              {service.serviceNumber ? service.serviceNumber : "—"}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3 border-t pt-3 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
                          <div>
                            {service.completedAt ? (
                              <span>
                                Completed at{" "}
                                <span className="font-semibold text-foreground">{service.siteName}</span>
                              </span>
                            ) : (
                              <span className="text-amber-600">Completion time unavailable</span>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                            <div className="flex flex-row gap-2">
                              {viewDetailsButton}
                              {downloadReportButton}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No completed services recorded for this period.
              </div>
            )}
            {completedTotalCount > 0 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {((completedPage - 1) * completedPageSize) + 1} to {Math.min(completedPage * completedPageSize, completedTotalCount)} of {completedTotalCount} services
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCompletedPage(prev => Math.max(1, prev - 1))}
                    disabled={completedPage === 1 || completedLoading}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {completedPage} of {Math.ceil(completedTotalCount / completedPageSize)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCompletedPage(prev => prev + 1)}
                    disabled={completedPage >= Math.ceil(completedTotalCount / completedPageSize) || completedLoading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {scheduleTarget && (
        <ScheduleServiceModal
          siteId={scheduleTarget.siteId}
          projectorId={scheduleTarget.projectorId}
          onClose={() => setScheduleTarget(null)}
          onSuccess={async () => {
            setScheduleTarget(null)
            await Promise.all([fetchTasks(), fetchCompletedServices()])
          }}
        />
      )}
    </div>
  )
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-4 pb-3">
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
          <CardHeader className="pb-3">
              <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-16 w-full rounded-lg" />
                ))}
            </div>
          </CardContent>
        </Card>
        ))}
      </div>
    </div>
  )
}
