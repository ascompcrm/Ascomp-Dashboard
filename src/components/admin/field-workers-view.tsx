"use client"

import { useRouter } from "next/navigation"
import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import SearchBar from "../search-bar"
import FilterTabs from "../filter-tabs"
import AddFieldWorkerModal from "./modals/add-field-worker-modal"

interface FieldWorker {
  id: string
  name: string
  email: string
  joinDate: string
  lastActiveDate: string
  sitesCompleted: number
  createdServicesCount: number
  pendingTasks: number
  totalTasks: number
}

export default function FieldWorkersView() {
  const router = useRouter()
  const [workers, setWorkers] = useState<FieldWorker[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddWorker, setShowAddWorker] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [workerFilter, setWorkerFilter] = useState("all")

  const fetchWorkers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/field-workers")
      if (!response.ok) {
        throw new Error("Failed to fetch field workers")
      }
      const result = await response.json()
      setWorkers(result.workers || [])
    } catch (error) {
      console.error("Error fetching field workers:", error)
      setWorkers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkers()
  }, [])

  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      const matchesSearch =
        worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.email.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchesSearch) return false

      if (workerFilter === "all") return true
      if (workerFilter === "active") return worker.pendingTasks > 0
      if (workerFilter === "idle") return worker.pendingTasks === 0

      return true
    })
  }, [workers, searchQuery, workerFilter])

  return (
    <div className="space-y-6 p-6">
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
        placeholder="Search workers by name or email..."
        value={searchQuery}
        onChange={setSearchQuery}
      />

      {/* <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">Worker Status</p>
        <FilterTabs tabs={["all", "active", "idle"]} activeTab={workerFilter} onTabChange={setWorkerFilter} />
      </div> */}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-border">
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
                <CardContent className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkers.length === 0 ? (
            <Card className="border-border col-span-full">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No field workers found matching your search.</p>
              </CardContent>
            </Card>
          ) : (
            filteredWorkers.map((worker) => (
              <Card
                key={worker.id}
                className="border-border hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/admin/dashboard/field-workers/${worker.id}`)}
              >
                <CardHeader className="">
                  <CardTitle className="text-lg font-semibold mb-1">{worker.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{worker.email}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Completed Services Stat */}
                  <div className="p-3 bg-muted/50 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Completed Services</p>
                    <p className="text-2xl font-bold text-foreground">{worker.createdServicesCount}</p>
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Last Active</span>
                      <span className="text-foreground font-medium">
                        {new Date(worker.lastActiveDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {showAddWorker && (
        <AddFieldWorkerModal
          onClose={() => setShowAddWorker(false)}
          onSuccess={() => {
            fetchWorkers()
          }}
        />
      )}
    </div>
  )
}
