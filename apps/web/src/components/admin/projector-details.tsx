"use client"

import type { Site, Projector } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ProjectorDetailsProps {
  site: Site
  projector: Projector
  onSchedule: () => void
  onViewDetails?: () => void
}

export default function ProjectorDetails({ site, projector, onSchedule, onViewDetails }: ProjectorDetailsProps) {
  const statusColor =
    projector.status === "pending"
      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      : projector.status === "completed"
        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"

  return (
    <div
      className="flex items-start justify-between gap-3 p-3 bg-background rounded-md border border-border hover:bg-muted/30 transition-colors cursor-pointer"
      onClick={onViewDetails}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h4 className="font-medium text-foreground">{projector.name}</h4>
          <Badge className={statusColor}>{projector.status.charAt(0).toUpperCase() + projector.status.slice(1)}</Badge>
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Model: {projector.model}</p>
          <p>Serial: {projector.serialNumber}</p>
          {projector.lastServiceDate && (
            <p>Last Service: {new Date(projector.lastServiceDate).toLocaleDateString()}</p>
          )}
          {projector.nextServiceDue && (
            <p>Next Due: {new Date(projector.nextServiceDue).toLocaleDateString()}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        {projector.status === "pending" && (
          <Button size="sm" onClick={onSchedule} className="bg-black text-white hover:bg-gray-800">
            Schedule
          </Button>
        )}
      </div>
    </div>
  )
}
