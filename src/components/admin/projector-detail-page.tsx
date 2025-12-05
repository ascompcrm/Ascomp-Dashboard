"use client"

import { useRouter, useParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import ScheduleServiceModal from "./modals/schedule-service-modal"
import PdfPreviewDialog from "./pdf-preview-dialog"
import { FileText } from "lucide-react"

interface ProjectorDetailPageProps {
  siteId?: string
  projectorId?: string
}

interface ProjectorData {
  id: string
  name: string
  model: string
  serialNumber: string
  installDate: string
  lastServiceDate: string
  status: "completed" | "pending" | "scheduled"
  nextServiceDue: string
  serviceHistory: Array<{
    id: string
    date: string | null
    technician?: string
    notes?: string
    nextDue?: string
    status?: string
    reportUrl?: string | null
    reportGenerated?: boolean
  }>
}

interface SiteData {
  id: string
  name: string
  address: string
  projectors: ProjectorData[]
}

export default function ProjectorDetailPage({ siteId: siteIdProp, projectorId: projectorIdProp }: ProjectorDetailPageProps) {
  const router = useRouter()
  const params = useParams<{ siteId?: string; projectorId?: string }>()
  const siteId = siteIdProp ?? params?.siteId ?? ""
  const projectorId = projectorIdProp ?? params?.projectorId ?? ""
  const [site, setSite] = useState<SiteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)
  const [previewServiceId, setPreviewServiceId] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjector = async () => {
      if (!siteId) {
        setError("Missing site id")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/admin/sites/${siteId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch site")
        }
        const data = await response.json()
        setSite(data.site)
      } catch (err) {
        console.error("Error fetching projector:", err)
        setError(err instanceof Error ? err.message : "Unable to load projector")
        setSite(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProjector()
  }, [siteId, projectorId])

  const projector = useMemo(() => site?.projectors.find((p) => p.id === projectorId) ?? null, [site, projectorId])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !site || !projector) {
    return (
      <Card className="border-border p-6 text-center">
        <CardContent>
          <p className="text-muted-foreground">{error || "Projector not found"}</p>
          <Button className="mt-4" variant="outline" onClick={() => router.push(`/admin/dashboard/sites/${siteId}`)}>
            Back to Site
          </Button>
        </CardContent>
      </Card>
    )
  }

  const statusColor =
    projector.status === "pending"
      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      : projector.status === "completed"
        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"

  return (
    <div className="space-y-6">
      <Card className="border-border bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{projector.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{site.name}</p>
            </div>
            <Badge className={statusColor}>
              {projector.status.charAt(0).toUpperCase() + projector.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Serial Number</p>
              <p className="text-foreground font-medium">{projector.serialNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Model</p>
              <p className="text-foreground">{projector.model}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Last Service</p>
              <p className="text-foreground">
                {projector.lastServiceDate ? new Date(projector.lastServiceDate).toLocaleDateString() : "—"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
              <p className="text-foreground font-semibold">{projector.status.toUpperCase()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => router.push(`/admin/dashboard/sites/${siteId}`)}>
          Back to Site
        </Button>
        {projector.status === "pending" && (
          <Button onClick={() => setShowSchedule(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Schedule Service
          </Button>
        )}
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Service History</CardTitle>
        </CardHeader>
        <CardContent>
          {projector.serviceHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No service records available yet.</p>
          ) : (
            <div className="space-y-4">
              {projector.serviceHistory.map((service, index) => {
                const statusLabel = service.status
                  ? service.status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())
                  : "Completed"
                const statusStyles =
                  service.status === "pending"
                    ? "bg-red-100 text-red-700"
                    : service.status === "scheduled" || service.status === "in_progress"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"

                return (
                  <Card key={service.id} className="border border-border">
                    <CardContent className="pt-6">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <h4 className="text-base font-semibold text-foreground mb-1">
                            Service #{projector.serviceHistory.length - index}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {service.date ? new Date(service.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }) : "—"}
                          </p>
                        </div>
                        <Badge className={`${statusStyles} text-xs`}>{statusLabel}</Badge>
                      </div>

                      {/* Report Details Table */}
                      <div className="mb-4 overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Field
                              </th>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Value
                              </th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            <tr className="border-b border-border/50">
                              <td className="py-2 px-3 font-medium text-muted-foreground">Service Date</td>
                              <td className="py-2 px-3 text-foreground">
                                {service.date
                                  ? new Date(service.date).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })
                                  : "—"}
                              </td>
                            </tr>
                            <tr className="border-b border-border/50">
                              <td className="py-2 px-3 font-medium text-muted-foreground">Technician</td>
                              <td className="py-2 px-3 text-foreground">{service.technician || "Unassigned"}</td>
                            </tr>
                            <tr className="border-b border-border/50">
                              <td className="py-2 px-3 font-medium text-muted-foreground">Status</td>
                              <td className="py-2 px-3">
                                <Badge className={`${statusStyles} text-xs`}>{statusLabel}</Badge>
                              </td>
                            </tr>
                            {service.notes && (
                              <tr className="border-b border-border/50">
                                <td className="py-2 px-3 font-medium text-muted-foreground">Notes</td>
                                <td className="py-2 px-3 text-foreground">{service.notes}</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Preview & Download Button */}
                      <div className="flex justify-end pt-2 border-t border-border">
                        <Button
                          size="sm"
                          onClick={() => setPreviewServiceId(service.id)}
                          className="gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          Preview & Download Report
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {showSchedule && (
        <ScheduleServiceModal siteId={siteId} projectorId={projectorId} onClose={() => setShowSchedule(false)} />
      )}

      {previewServiceId && (
        <PdfPreviewDialog
          open={!!previewServiceId}
          onOpenChange={(open) => {
            if (!open) setPreviewServiceId(null)
          }}
          serviceRecordId={previewServiceId}
        />
      )}
    </div>
  )
}
