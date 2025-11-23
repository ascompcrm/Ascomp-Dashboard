import type React from "react"

import { useState } from "react"
import { useData } from "@/lib/data-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AddProjectorModalProps {
  siteId: string
  onClose: () => void
}

export default function AddProjectorModal({ siteId, onClose }: AddProjectorModalProps) {
  const { addProjector } = useData()
  const [formData, setFormData] = useState({
    name: "",
    model: "",
    installDate: new Date().toISOString().split("T")[0],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.model && formData.installDate) {
      addProjector(siteId, {
        ...formData,
        lastServiceDate: new Date().toISOString().split("T")[0],
        status: "completed" as const,
        nextServiceDue: new Date(new Date().getTime() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      })
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md border-border">
        <CardHeader>
          <CardTitle>Add Projector to Site</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Projector Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Main Hall Projector"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Sony SRX-R320P"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Installation Date</label>
              <input
                type="date"
                value={formData.installDate}
                onChange={(e) => setFormData({ ...formData, installDate: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onClose} className="border-border bg-transparent">
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Add Projector
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
