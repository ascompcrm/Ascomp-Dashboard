"use client"

import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

interface WorkHistoryItem {
  id: string
  serviceNumber: number
  status: string
  date: string | null
  startTime: string | null
  endTime: string | null
  site: {
    id: string
    name: string
    address: string
  }
  projector: {
    id: string
    model: string
    serialNo: string
  }
  projectorRunningHours: number | null
  remarks: string | null
  reportGenerated: boolean
  reportUrl: string | null
}

interface FieldWorkerDetail {
  worker: {
    id: string
    name: string
    email: string
    joinDate: string
  }
  statistics: {
    totalServices: number
    completed: number
    pending: number
    inProgress: number
    sitesWorked: number
  }
  workHistory: WorkHistoryItem[]
  sitesWorked: Array<{
    id: string
    name: string
    address: string
  }>
}

interface FieldWorkerDetailPageProps {
  workerId?: string
}

export default function FieldWorkerDetailPage({ workerId: workerIdProp }: FieldWorkerDetailPageProps) {
  const router = useRouter()
  const params = useParams<{ workerId?: string }>()
  const workerId = workerIdProp ?? params?.workerId ?? ""
  const [data, setData] = useState<FieldWorkerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!workerId) {
        setError("Missing worker id")
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/admin/field-workers/${workerId}/work-history`)
        if (!response.ok) {
          throw new Error("Failed to fetch work history")
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        console.error("Error fetching work history:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [workerId])

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Completed"
      case "IN_PROGRESS":
        return "In Progress"
      case "SCHEDULED":
        return "Scheduled"
      case "PENDING":
        return "Pending"
      case "CANCELLED":
        return "Cancelled"
      default:
        return status
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-muted text-foreground"
      case "IN_PROGRESS":
        return "bg-muted text-foreground"
      case "SCHEDULED":
        return "bg-muted text-foreground"
      case "PENDING":
        return "bg-muted text-foreground"
      default:
        return "bg-muted text-foreground"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card className="border-border">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">{error || "Failed to load work history"}</p>
          <Button onClick={() => router.push("/admin/dashboard/field-workers")} className="mt-4">
            Go Back
          </Button>
        </CardContent>
      </Card>
    )
  }

  const { worker, statistics, workHistory, sitesWorked } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">{worker.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">{worker.email}</p>
        </div>
        <Button onClick={() => router.push("/admin/dashboard/field-workers")} variant="outline">
          Back
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-border">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground mb-1">Total Services</p>
            <p className="text-2xl font-bold text-foreground">{statistics.totalServices}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground mb-1">Completed</p>
            <p className="text-2xl font-bold text-foreground">{statistics.completed}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground mb-1">In Progress</p>
            <p className="text-2xl font-bold text-foreground">{statistics.inProgress}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground mb-1">Pending</p>
            <p className="text-2xl font-bold text-foreground">{statistics.pending}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground mb-1">Sites Worked</p>
            <p className="text-2xl font-bold text-foreground">{statistics.sitesWorked}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sites Worked */}
      {sitesWorked.length > 0 && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Sites Worked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sitesWorked.map((site) => (
                <div
                  key={site.id}
                  className="p-3 bg-muted/50 rounded-lg border border-border"
                >
                  <p className="font-medium text-foreground">{site.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{site.address}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Work History */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Work History</CardTitle>
        </CardHeader>
        <CardContent>
          {workHistory.length > 0 ? (
            <div className="space-y-3">
              {workHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-foreground border border-border">
                          Service #{item.serviceNumber}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-medium ${getStatusClass(
                            item.status,
                          )} border border-border`}
                        >
                          {getStatusLabel(item.status)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{item.site.name}</p>
                        <p className="text-sm text-muted-foreground">{item.site.address}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.projector.model} ({item.projector.serialNo})
                        </p>
                      </div>
                    </div>
                    {item.date && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                        {item.startTime && item.endTime && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(item.startTime).toLocaleTimeString()} -{" "}
                            {new Date(item.endTime).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
                    {item.projectorRunningHours !== null && (
                      <div>
                        <p className="text-xs text-muted-foreground">Running Hours</p>
                        <p className="text-sm font-medium text-foreground">
                          {item.projectorRunningHours} hrs
                        </p>
                      </div>
                    )}
                    {item.reportGenerated && (
                      <div>
                        <p className="text-xs text-muted-foreground">Report</p>
                        <p className="text-sm font-medium text-foreground">Generated</p>
                      </div>
                    )}
                  </div>
                  {item.remarks && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-1">Remarks</p>
                      <p className="text-sm text-foreground">{item.remarks}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No work history found for this field worker.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

