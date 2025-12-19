"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CardTitle } from "@/components/ui/card"
import { X, Download } from "lucide-react"
import { toast } from "sonner"

interface ExportDataModalProps {
  onClose: () => void
}

export default function ExportDataModal({ onClose }: ExportDataModalProps) {
  const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set(["serviceRecords"]))
  const [loading, setLoading] = useState(false)

  const toggleTable = (table: string) => {
    const newSet = new Set(selectedTables)
    if (newSet.has(table)) {
      newSet.delete(table)
    } else {
      newSet.add(table)
    }
    setSelectedTables(newSet)
  }

  const selectAllTables = () => {
    setSelectedTables(new Set(["serviceRecords", "projectors", "sites", "users"]))
  }

  const deselectAllTables = () => {
    setSelectedTables(new Set())
  }

  const handleExport = async () => {
    if (selectedTables.size === 0) {
      toast.error("Please select at least one table to export")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/admin/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tables: Array.from(selectedTables),
        }),
      })

      if (!response.ok) {
        throw new Error("Export failed")
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition")
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
      const filename = filenameMatch ? filenameMatch[1] : `export_${new Date().toISOString().split("T")[0]}.xlsx`

      // Download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename ?? `export_${new Date().toISOString().split("T")[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Data exported successfully!")
      onClose()
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export data")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white max-h-[90vh] overflow-y-auto border-border my-8">
        <div className="sticky top-0 p-4 bg-white z-10 border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Export Data</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {/* Table Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Select Tables</label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllTables}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAllTables}>
                  Deselect All
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "serviceRecords", label: "Service Records" },
                { value: "projectors", label: "Projectors" },
                { value: "sites", label: "Sites" },
                { value: "users", label: "Users" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-2 p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedTables.has(option.value)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedTables.has(option.value)}
                    onChange={() => toggleTable(option.value)}
                    className="text-primary"
                  />
                  <span className="text-sm font-medium">{option.label}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {selectedTables.size} table{selectedTables.size !== 1 ? "s" : ""} selected
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={loading} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              {loading ? "Exporting..." : "Export"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
