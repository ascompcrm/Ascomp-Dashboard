"use client"

import type React from "react"

import { useState } from "react"
import { useData } from "@/lib/data-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ScheduleServiceModalProps {
  siteId: string
  projectorId: string
  onClose: () => void
}

export default function ScheduleServiceModal({ siteId, projectorId, onClose }: ScheduleServiceModalProps) {
  const { fieldWorkers, scheduleTask } = useData()
  const [formData, setFormData] = useState({
    fieldWorkerId: fieldWorkers[0]?.id || "",
    scheduledDate: new Date().toISOString().split("T")[0],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.fieldWorkerId && formData.scheduledDate) {
      scheduleTask(siteId, projectorId, formData.fieldWorkerId, formData.scheduledDate)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md border-border">
        <CardHeader>
          <CardTitle>Schedule Service</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Field Worker</label>
              <select
                value={formData.fieldWorkerId}
                onChange={(e) => setFormData({ ...formData, fieldWorkerId: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {fieldWorkers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Scheduled Date</label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onClose} className="border-border bg-transparent">
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Schedule
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
