"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AddProjectorModalProps {
  siteId: string
  onClose: () => void
  onSuccess?: () => void
}

export default function AddProjectorModal({ siteId, onClose, onSuccess }: AddProjectorModalProps) {
  const [formData, setFormData] = useState({
    projectorModel: "",
    serialNo: "",
    runningHours: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.projectorModel || !formData.serialNo) {
      setError("Projector model and serial number are required")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/projectors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          siteId,
          projectorModel: formData.projectorModel,
          serialNo: formData.serialNo,
          runningHours: formData.runningHours || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create projector")
      }

      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
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
              <label className="text-sm font-medium text-foreground">Projector Model</label>
              <input
                type="text"
                value={formData.projectorModel}
                onChange={(e) => setFormData({ ...formData, projectorModel: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Sony SRX-R320P"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Serial Number</label>
              <input
                type="text"
                value={formData.serialNo}
                onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., SRX-2024-001"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Running Hours (Optional)</label>
              <input
                type="number"
                value={formData.runningHours}
                onChange={(e) => setFormData({ ...formData, runningHours: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., 5000"
                min="0"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-border bg-transparent"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? "Creating..." : "Add Projector"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
