"use client"

import { useData } from "@/lib/data-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ProjectorDetails from "./projector-details"
import AddProjectorModal from "./modals/add-projector-modal"
import ScheduleServiceModal from "./modals/schedule-service-modal"
import { useState } from "react"

interface SiteDetailPageProps {
  siteId: string
  onProjectorClick: (siteId: string, projectorId: string) => void
}

export default function SiteDetailPage({ siteId, onProjectorClick }: SiteDetailPageProps) {
  const { sites } = useData()
  const [showAddProjector, setShowAddProjector] = useState(false)
  const [selectedProjector, setSelectedProjector] = useState<{ siteId: string; projectorId: string } | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)

  const site = sites.find((s) => s.id === siteId)

  if (!site) {
    return (
      <Card className="border-border p-6 text-center">
        <p className="text-muted-foreground">Site not found</p>
      </Card>
    )
  }

  const totalServices = site.projectors.reduce((acc, proj) => acc + proj.serviceHistory.length, 0)
  const completedProjectors = site.projectors.filter((p) => p.status === "completed").length
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
        <CardContent className="space-y-3">
          {site.projectors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projectors added to this site yet.</p>
          ) : (
            site.projectors.map((projector) => (
              <ProjectorDetails
                key={projector.id}
                site={site}
                projector={projector}
                onSchedule={() => {
                  setSelectedProjector({ siteId: site.id, projectorId: projector.id })
                  setShowSchedule(true)
                }}
                onViewDetails={() => onProjectorClick(site.id, projector.id)}
              />
            ))
          )}
        </CardContent>
      </Card>

      {showAddProjector && <AddProjectorModal siteId={siteId} onClose={() => setShowAddProjector(false)} />}
      {selectedProjector && (
        <ScheduleServiceModal
          siteId={selectedProjector.siteId}
          projectorId={selectedProjector.projectorId}
          onClose={() => {
            setSelectedProjector(null)
            setShowSchedule(false)
          }}
        />
      )}
    </div>
  )
}
