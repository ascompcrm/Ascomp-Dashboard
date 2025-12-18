"use client"

import { useEffect, useMemo, useState } from "react"
import { format, differenceInCalendarDays, parseISO } from "date-fns"
import { Search, CalendarClock, MapPin, Projector as ProjectorIcon, User as UserIcon, X, Ban } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ScheduledService {
  id: string
  serviceNumber: string | null
  siteName: string
  siteAddress: string
  projectorModel: string | null
  projectorSerial: string | null
  screenNumber: string | null
  assignedToName: string | null
  assignedToEmail: string | null
  status: "scheduled" | "in_progress"
  scheduledDate: string | null // ISO string
}

export default function ScheduledServicesPage() {
  const [services, setServices] = useState<ScheduledService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch("/api/admin/services/scheduled?" + new URLSearchParams({ q: search }), {
          cache: "no-store",
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || "Failed to load scheduled services")
        }
        const json = await res.json()
        setServices(json.services || [])
      } catch (err) {
        console.error("Failed to load scheduled services", err)
        setError(err instanceof Error ? err.message : "Failed to load scheduled services")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [search, refreshKey])

  const filteredServices = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return services
    return services.filter((s) => {
      return (
        s.siteName.toLowerCase().includes(q) ||
        (s.siteAddress && s.siteAddress.toLowerCase().includes(q)) ||
        (s.projectorModel && s.projectorModel.toLowerCase().includes(q)) ||
        (s.projectorSerial && s.projectorSerial.toLowerCase().includes(q)) ||
        (s.assignedToName && s.assignedToName.toLowerCase().includes(q))
      )
    })
  }, [services, search])

  const handleUnassign = async (id: string) => {
    if (!confirm("Unassign this field worker from the scheduled service?")) return
    try {
      const res = await fetch("/api/admin/services/scheduled/unassign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceRecordId: id }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to unassign")
      }
      setRefreshKey((k) => k + 1)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to unassign")
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this scheduled service? This will delete the schedule.")) return
    try {
      const res = await fetch("/api/admin/services/schedule", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceRecordId: id }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel scheduling")
      }
      setRefreshKey((k) => k + 1)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to cancel scheduling")
    }
  }

  const isOverdueByMoreThan4Days = (dateStr: string | null) => {
    if (!dateStr) return false
    try {
      const d = parseISO(dateStr)
      const diff = differenceInCalendarDays(new Date(), d)
      return diff > 4
    } catch {
      return false
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Scheduled Services
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage all scheduled and in-progress services across sites.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by site, projector, or engineer..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="py-3 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-4 space-y-3">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                <div className="h-3 w-40 bg-muted animate-pulse rounded" />
                <div className="flex gap-2 mt-2">
                  <div className="h-7 w-16 bg-muted animate-pulse rounded" />
                  <div className="h-7 w-20 bg-muted animate-pulse rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <Card className="border-dashed border-border">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No scheduled services found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => {
            const overdue = isOverdueByMoreThan4Days(service.scheduledDate)
            const dateLabel = service.scheduledDate
              ? format(parseISO(service.scheduledDate), "dd/MM/yyyy")
              : "Not scheduled"

            return (
              <Card
                key={service.id}
                className={cn(
                  "border border-border bg-white flex flex-col justify-between transition-shadow hover:shadow-md",
                  overdue && "border-amber-500/70 bg-amber-50/40"
                )}
              >
                <CardHeader className="pb-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm font-semibold leading-tight">
                      {service.siteName}
                    </CardTitle>
                    <Badge
                      variant={service.status === "in_progress" ? "outline" : "secondary"}
                      className={cn(
                        "text-[11px] px-2 py-0.5 border border-border",
                        service.status === "in_progress" && "bg-yellow-50 text-yellow-800 border-yellow-300",
                        service.status === "scheduled" && "bg-blue-50 text-blue-800 border-blue-300"
                      )}
                    >
                      {service.status === "in_progress" ? "In Progress" : "Scheduled"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 flex items-start gap-1">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    {service.siteAddress}
                  </p>
                  {overdue && (
                    <p className="mt-1 text-[11px] font-medium text-amber-700">
                      Pending for more than 4 days
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <CalendarClock className="h-3.5 w-3.5" />
                      <span className="font-medium text-foreground">{dateLabel}</span>
                    </div>
                    {service.serviceNumber && (
                      <span className="text-[11px]">SR #{service.serviceNumber}</span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5">
                      <ProjectorIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {service.projectorModel || "Model N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 pl-5">
                      <span className="text-muted-foreground">Serial:</span>
                      <span className="font-mono text-[11px] text-foreground">
                        {service.projectorSerial || "N/A"}
                      </span>
                    </div>
                    {service.screenNumber && (
                      <div className="flex items-center gap-1.5 pl-5">
                        <span className="text-muted-foreground">Screen:</span>
                        <span className="text-foreground">{service.screenNumber}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1.5 text-xs">
                      <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {service.assignedToName || "Unassigned"}
                        </span>
                        {service.assignedToEmail && (
                          <span className="text-[11px] text-muted-foreground line-clamp-1">
                            {service.assignedToEmail}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-[11px] border-border flex items-center gap-1"
                      onClick={() => handleUnassign(service.id)}
                      disabled={!service.assignedToName}
                    >
                      <X className="h-3 w-3" />
                      Unassign
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-[11px] border-destructive text-destructive flex items-center gap-1 hover:bg-destructive/10"
                      onClick={() => handleCancel(service.id)}
                    >
                      <Ban className="h-3 w-3" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
