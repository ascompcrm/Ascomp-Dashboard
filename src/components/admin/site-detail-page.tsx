"use client"

import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import ProjectorDetails from "./projector-details"
import AddProjectorModal from "./modals/add-projector-modal"
import ScheduleServiceModal from "./modals/schedule-service-modal"
import { useState, useEffect } from "react"
import type { Site, Projector } from "@/lib/types"

interface SiteDetailPageProps {
  siteId?: string
}

export default function SiteDetailPage({ siteId: siteIdProp }: SiteDetailPageProps) {
  const router = useRouter()
  const params = useParams<{ siteId?: string }>()
  const siteId = siteIdProp ?? params?.siteId ?? ""
  const [site, setSite] = useState<Site | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddProjector, setShowAddProjector] = useState(false)
  const [selectedProjector, setSelectedProjector] = useState<{ siteId: string; projectorId: string } | null>(null)
  const [_showSchedule, setShowSchedule] = useState(false)

  useEffect(() => {
    const fetchSite = async () => {
      if (!siteId) {
        setLoading(false)
        setSite(null)
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`/api/admin/sites/${siteId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch site")
        }
        const result = await response.json()
        setSite(result.site)
      } catch (error) {
        console.error("Error fetching site:", error)
        setSite(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSite()
  }, [siteId])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!site) {
    return (
      <Card className="border-border p-6 text-center">
        <p className="text-muted-foreground">Site not found</p>
      </Card>
    )
  }

  const totalServices = site.projectors.reduce((acc, proj) => acc + proj.serviceHistory.length, 0)
  const pendingProjectors = site.projectors.filter((p) => p.status === "pending").length

  return (
    <div className="space-y-6">
      {/* Site Header Info */}
      <Card className="border-border bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl">{site.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Address</p>
              <p className="text-foreground">{site.address}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Location</p>
              <p className="text-foreground">{site.location}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Created Date</p>
              <p className="text-foreground">{new Date(site.createdDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Projectors</p>
              <p className="text-foreground">{site.projectors.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Site Statistics */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border">
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-muted-foreground">Total Projectors</p>
            <p className="text-2xl font-bold mt-2">{site.projectors.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-muted-foreground">Total Services</p>
            <p className="text-2xl font-bold mt-2">{totalServices}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold mt-2 text-red-600">{pendingProjectors}</p>
          </CardContent>
        </Card>
      </div>

      {/* Projectors Section */}
      <Card className="border-border">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Projectors in this Site</CardTitle>
          <Button
            size="sm"
            onClick={() => setShowAddProjector(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Add Projector
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {site.projectors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projectors added to this site yet.</p>
          ) : (
            site.projectors.map((projector) => {
              // Convert to Projector type for ProjectorDetails component
              const projectorForDetails: Projector = {
                id: projector.id,
                name: projector.name,
                model: projector.model,
                serialNumber: projector.serialNumber,
                installDate: projector.installDate,
                lastServiceDate: projector.lastServiceDate,
                status: projector.status,
                nextServiceDue: projector.nextServiceDue,
                serviceHistory: projector.serviceHistory || [],
              }
              return (
                <ProjectorDetails
                  key={projector.id}
                  site={site}
                  projector={projectorForDetails}
                  onSchedule={() => {
                    setSelectedProjector({ siteId: site.id, projectorId: projector.id })
                    setShowSchedule(true)
                  }}
                  onViewDetails={() => router.push(`/admin/dashboard/sites/${site.id}/projectors/${projector.id}`)}
                />
              )
            })
          )}
        </CardContent>
      </Card>

      {showAddProjector && (
        <AddProjectorModal
          siteId={siteId}
          onClose={() => setShowAddProjector(false)}
          onSuccess={() => {
            // Refresh site data
            fetch(`/api/admin/sites/${siteId}`)
              .then((res) => res.json())
              .then((data) => setSite(data.site))
              .catch((err) => console.error("Error refreshing site:", err))
            setShowAddProjector(false)
          }}
        />
      )}
      {selectedProjector && (
        <ScheduleServiceModal
          siteId={selectedProjector.siteId}
          projectorId={selectedProjector.projectorId}
          onClose={() => {
            setSelectedProjector(null)
            setShowSchedule(false)
          }}
          onSuccess={() => {
            // Refresh site data
            fetch(`/api/admin/sites/${siteId}`)
              .then((res) => res.json())
              .then((data) => setSite(data.site))
              .catch((err) => console.error("Error refreshing site:", err))
            setSelectedProjector(null)
            setShowSchedule(false)
          }}
        />
      )}
    </div>
  )
}
