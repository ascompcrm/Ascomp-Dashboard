import { useData } from "@/lib/data-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ScheduleServiceModal from "./modals/schedule-service-modal"
import { useState } from "react"
import { FileText, Trash2 } from "lucide-react"

interface ProjectorDetailPageProps {
  siteId: string
  projectorId: string
  onBack: () => void
}

export default function ProjectorDetailPage({ siteId, projectorId, onBack }: ProjectorDetailPageProps) {
  const { sites, deleteProjector } = useData()
  const [showSchedule, setShowSchedule] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const site = sites.find((s) => s.id === siteId)
  const projector = site?.projectors.find((p) => p.id === projectorId)

  if (!site || !projector) {
    return (
      <Card className="border-border p-6 text-center">
        <p className="text-muted-foreground">Projector not found</p>
      </Card>
    )
  }

  const statusColor =
    projector.status === "pending"
      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      : projector.status === "completed"
        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"

  const handleDownloadPDF = () => {
    // Mock PDF download - will be replaced with actual PDF functionality later
    alert(`Mock PDF download for ${projector.name} - Implement PDF functionality here`)
  }

  const handleDelete = () => {
    deleteProjector(siteId, projectorId)
    onBack()
  }

  return (
    <div className="space-y-6">
      {/* Projector Header */}
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Serial Number</p>
              <p className="text-foreground font-medium">{projector.serialNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Model</p>
              <p className="text-foreground">{projector.model}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Install Date</p>
              <p className="text-foreground">{new Date(projector.installDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Last Service</p>
              <p className="text-foreground">{new Date(projector.lastServiceDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Next Service Due</p>
              <p className="text-foreground">{new Date(projector.nextServiceDue).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Services</p>
              <p className="text-foreground font-medium">{projector.serviceHistory.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {projector.status === "pending" && (
          <Button
            onClick={() => setShowSchedule(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Schedule Service
          </Button>
        )}
        <Button onClick={handleDownloadPDF} variant="outline" className="border-border bg-transparent">
          <FileText className="w-4 h-4 mr-2" />
          Download Report (PDF)
        </Button>
        <Button
          onClick={() => setShowDeleteConfirm(true)}
          variant="outline"
          className="border-red-200 text-red-600 hover:bg-red-50 ml-auto"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Projector
        </Button>
      </div>

      {/* Service History */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Service History</CardTitle>
        </CardHeader>
        <CardContent>
          {projector.serviceHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No service records available.</p>
          ) : (
            <div className="space-y-3">
              {projector.serviceHistory.map((service, index) => (
                <Card key={service.id} className="border-border bg-muted/30">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground mb-1">
                          Service #{projector.serviceHistory.length - index}
                        </p>
                        <p className="text-xs text-muted-foreground">{new Date(service.date).toLocaleDateString()}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDownloadPDF}
                        className="border-border text-xs bg-transparent"
                      >
                        View Report
                      </Button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Technician</p>
                        <p className="text-foreground">{service.technician}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Notes</p>
                        <p className="text-foreground">{service.notes}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Next Service Due</p>
                        <p className="text-foreground">{new Date(service.nextDue).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showSchedule && (
        <ScheduleServiceModal siteId={siteId} projectorId={projectorId} onClose={() => setShowSchedule(false)} />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="border-border w-full max-w-sm mx-4">
            <CardHeader>
              <CardTitle>Delete Projector</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                Are you sure you want to delete <strong>{projector.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="outline"
                  className="border-border bg-transparent"
                >
                  Cancel
                </Button>
                <Button onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
