"use client"

import { useEffect, useState } from "react"
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

interface OverviewStats {
  totalSites: number
  totalProjectors: number
  fieldWorkers: number
  pendingServices: number
  completedServices: number
  scheduledServices: number
  activeWorkers: number
}

interface PendingProjector {
  id: string
  name: string
  siteName: string
  siteId: string
  lastServiceAt: string | null
  nextServiceAt: string | null
}

interface RecentWorker {
  id: string
  name: string
  email: string
  sitesCompleted: number
  pendingTasks: number
  totalTasks: number
  lastActiveDate: string
  joinDate: string
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
  rawStatus?: string
}

interface OverviewData {
  stats: OverviewStats
  pendingProjectors: PendingProjector[]
  recentWorkers: RecentWorker[]
  recentTasks: RecentTask[]
}

export default function OverviewView() {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tasks, setTasks] = useState<RecentTask[]>([])
  const [tasksLoading, setTasksLoading] = useState(false)
  const [timeRange, setTimeRange] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

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

  useEffect(() => {
    const fetchTasks = async () => {
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
    }

    fetchTasks()
  }, [timeRange, statusFilter])

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

  const { stats, pendingProjectors, recentWorkers, recentTasks } = data

  const statCards = [
    { label: "Total Sites", value: stats.totalSites, color: "text-slate-700" },
    { label: "Total Projectors", value: stats.totalProjectors, color: "text-slate-700" },
    { label: "Field Workers", value: stats.fieldWorkers, color: "text-slate-700" },
    { label: "Pending Services", value: stats.pendingServices, color: "text-red-600", highlight: true },
    { label: "Completed", value: stats.completedServices, color: "text-green-600" },
    { label: "Scheduled", value: stats.scheduledServices, color: "text-slate-700" },
  ]

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
                  <SelectItem value="in_progress">In Progress</SelectItem>
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
            <div className="space-y-2 flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex min-w-[18vw] max-w-[18vw] justify-between p-3 h-[20vh] bg-muted/50 rounded-lg border border-border"
                >
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex flex-col gap-1">
                    <p className="font-medium text-foreground">{task.projectorName}</p>
                    <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{new Date(task.scheduledDate).toLocaleDateString()}</span>
                    <span
                      className={`px-2.5 py-1 h-fit rounded-md text-xs font-medium whitespace-nowrap ${
                        task.status === "pending"
                          ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                          : task.status === "scheduled"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                            : task.status === "in_progress"
                              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                              : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      }`}
                    >
                      {task.status === "pending"
                        ? "Pending"
                        : task.status === "scheduled"
                          ? "Scheduled"
                          : task.status === "in_progress"
                            ? "In Progress"
                            : "Completed"}
                    </span>
                  </div>
                    </div>
                    <div className="">
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Assigned to {task.workerName}
                    </p>
                    <p className="text-xs text-muted-foreground">{task.siteName}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">No tasks found matching the selected filters.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 mt-4 lg:grid-cols-2 gap-6">
        {pendingProjectors.length > 0 && (
          <Card>
            <CardHeader className="">
              <CardTitle className="text-base font-semibold">Pending Service Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingProjectors.map((proj) => (
                  <div
                    key={proj.id}
                    className="flex items-start justify-between p-3 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate mb-1">{proj.name}</p>
                      <p className="text-xs text-muted-foreground mb-1">{proj.siteName}</p>
                      {proj.lastServiceAt && (
                        <p className="text-xs text-muted-foreground">
                          Last service: {new Date(proj.lastServiceAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <span className="ml-3 px-2.5 py-1 bg-muted text-foreground rounded-md text-xs font-medium whitespace-nowrap border border-border">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="">
            <CardTitle className="text-base font-semibold">Active Workers (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentWorkers.length > 0 ? (
                recentWorkers.map((worker) => (
                  <div
                    key={worker.id}
                    className="p-3 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground mb-1">{worker.name}</h4>
                        <p className="text-xs text-muted-foreground truncate mb-2">{worker.email}</p>
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Completed</p>
                            <p className="text-sm font-semibold text-foreground">{worker.sitesCompleted}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Pending</p>
                            <p className="text-sm font-semibold text-foreground">{worker.pendingTasks}</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Last active: {new Date(worker.lastActiveDate).toLocaleDateString()}
                        </p>
                    </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No active workers in the last 7 days</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
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
