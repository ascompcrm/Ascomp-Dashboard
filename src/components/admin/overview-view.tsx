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
  status: "pending" | "completed" | "scheduled"
  projectorName: string
  workerName: string
  siteName: string
  siteAddress?: string
  siteCode?: string
  screenNumber?: string
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
                const hasValidDate = scheduledDate && !Number.isNaN(scheduledDate.getTime())
                const formattedDate = hasValidDate
                  ? scheduledDate.toLocaleDateString("en-US", {
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
                            <span className={hasValidDate ? "font-semibold text-foreground" : "font-semibold text-amber-600"}>
                              {hasValidDate ? formattedDate : "Not scheduled"}
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
              <div className="space-y-3">
                {completedServices.map((service) => {
                  const completedDate = service.completedAt || service.scheduledDate
                  const formattedCompletedDate = completedDate
                    ? new Date(completedDate).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Not available"
                  const projectorRoute = buildProjectorRoute(service.siteId, service.projectorId)

                  return (
                    <div
                      key={service.id}
                      className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{service.projectorName}</p>
                          <p className="text-xs text-muted-foreground">{service.siteName}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-700">
                          Completed
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <p className="text-muted-foreground mb-0.5">Completed</p>
                          <p className="font-semibold text-foreground">{formattedCompletedDate}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-0.5">Assigned To</p>
                          <p className="font-semibold text-foreground">{service.workerName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-0.5">Service #</p>
                          <p className="font-semibold text-foreground">
                            {service.serviceNumber ? service.serviceNumber : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {projectorRoute && (
                          <Button size="sm" variant="secondary" asChild>
                            <Link href={projectorRoute}>View report</Link>
                          </Button>
                        )}
                        {service.reportUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={service.reportUrl} target="_blank" rel="noopener noreferrer">
                              Download PDF
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
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
