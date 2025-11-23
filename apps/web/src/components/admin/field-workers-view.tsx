"use client"

import { useState, useMemo } from "react"
import { useData } from "@/lib/data-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import SearchBar from "../search-bar"
import FilterTabs from "../filter-tabs"
import AddFieldWorkerModal from "./modals/add-field-worker-modal"

export default function FieldWorkersView() {
  const { fieldWorkers, scheduledTasks } = useData()
  const [showAddWorker, setShowAddWorker] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [workerFilter, setWorkerFilter] = useState("all")

  const getWorkerTaskCount = (workerId: string) => {
    return scheduledTasks.filter((t) => t.fieldWorkerId === workerId && t.status === "pending").length
  }

  const getWorkerCompletedCount = (workerId: string) => {
    return scheduledTasks.filter((t) => t.fieldWorkerId === workerId && t.status === "completed").length
  }

  const filteredWorkers = useMemo(() => {
    return fieldWorkers.filter((worker) => {
      const matchesSearch =
        worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.phone.includes(searchQuery)

      if (!matchesSearch) return false

      if (workerFilter === "all") return true
      if (workerFilter === "active") return getWorkerTaskCount(worker.id) > 0
      if (workerFilter === "idle") return getWorkerTaskCount(worker.id) === 0

      return true
    })
  }, [fieldWorkers, searchQuery, workerFilter])

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-foreground">Field Workers</h2>
        <Button
          onClick={() => setShowAddWorker(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Add Field Worker
        </Button>
      </div>

      <SearchBar
        placeholder="Search workers by name, email, or phone..."
        value={searchQuery}
        onChange={setSearchQuery}
      />

      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">Worker Status</p>
        <FilterTabs tabs={["all", "active", "idle"]} activeTab={workerFilter} onTabChange={setWorkerFilter} />
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkers.length === 0 ? (
          <Card className="border-border col-span-full">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No field workers found matching your search.</p>
            </CardContent>
          </Card>
        ) : (
          filteredWorkers.map((worker) => (
            <Card key={worker.id} className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">{worker.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{worker.email}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Sites Completed</p>
                    <p className="font-semibold text-foreground text-lg">{getWorkerCompletedCount(worker.id)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pending Tasks</p>
                    <p className="font-semibold text-foreground text-lg">{getWorkerTaskCount(worker.id)}</p>
                  </div>
                </div>
                <div className="border-t border-border pt-3 text-xs space-y-1 text-muted-foreground">
                  <p>Joined: {new Date(worker.joinDate).toLocaleDateString()}</p>
                  <p>Last Active: {new Date(worker.lastActiveDate).toLocaleDateString()}</p>
                  <p>Phone: {worker.phone}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {showAddWorker && <AddFieldWorkerModal onClose={() => setShowAddWorker(false)} />}
    </div>
  )
}
