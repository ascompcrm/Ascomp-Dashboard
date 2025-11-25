"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import SearchBar from "../search-bar"
import FilterTabs from "../filter-tabs"
import AddSiteModal from "./modals/add-site-modal"
import AddProjectorModal from "./modals/add-projector-modal"
import ScheduleServiceModal from "./modals/schedule-service-modal"
import ProjectorDetails from "./projector-details"
import { ChevronDown, ChevronRight } from "lucide-react"
import type { Site, Projector } from "@/lib/types"

interface ProjectorData {
  id: string
  name: string
  model: string
  serialNumber: string
  installDate: string
  lastServiceDate: string
  status: "completed" | "pending" | "scheduled"
  nextServiceDue: string
  serviceHistory: any[]
}

interface SiteData {
  id: string
  name: string
  location: string
  address: string
  contactDetails: string
  screenNo: string
  createdDate: string
  projectors: ProjectorData[]
}

export default function SitesView() {
  const router = useRouter()
  const [sites, setSites] = useState<SiteData[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSites, setExpandedSites] = useState<Set<string>>(new Set())
  const [showAddSite, setShowAddSite] = useState(false)
  const [selectedSite, setSelectedSite] = useState<string | null>(null)
  const [selectedProjector, setSelectedProjector] = useState<{ siteId: string; projectorId: string } | null>(null)
  const [_showSchedule, setShowSchedule] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [projectorFilter, setProjectorFilter] = useState("all")

  const fetchSites = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/sites")
      if (!response.ok) {
        throw new Error("Failed to fetch sites")
      }
      const result = await response.json()
      setSites(result.sites || [])
      if (result.sites && result.sites.length > 0) {
        setExpandedSites(new Set(result.sites.map((s: SiteData) => s.id)))
      }
    } catch (error) {
      console.error("Error fetching sites:", error)
      setSites([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSites()
  }, [])

  const toggleSite = (siteId: string) => {
    const newExpanded = new Set(expandedSites)
    if (newExpanded.has(siteId)) {
      newExpanded.delete(siteId)
    } else {
      newExpanded.add(siteId)
    }
    setExpandedSites(newExpanded)
  }

  const filteredSites = useMemo(() => {
    return sites
      .filter(
        (site) =>
          site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          site.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          site.projectors.some(
            (p) =>
              p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.model.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      )
      .map((site) => ({
        ...site,
        projectors: site.projectors.filter((p) => {
          if (projectorFilter === "all") return true
          if (projectorFilter === "completed") return p.status === "completed"
          if (projectorFilter === "pending") return p.status === "pending"
          if (projectorFilter === "scheduled") return p.status === "scheduled"
          return true
        }),
      }))
  }, [sites, searchQuery, projectorFilter])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-foreground">Sites & Projectors</h2>
        <Button onClick={() => setShowAddSite(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          Add Site
        </Button>
      </div>

      <SearchBar
        placeholder="Search by site name, address, projector name or serial number..."
        value={searchQuery}
        onChange={setSearchQuery}
      />

      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">Projector Status</p>
        <FilterTabs
          tabs={["all", "completed", "pending", "scheduled"]}
          activeTab={projectorFilter}
          onTabChange={setProjectorFilter}
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-border">
              <div className="p-4">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1">
          {filteredSites.length === 0 ? (
            <div className="border border-border p-6 text-center bg-background">
              <p className="text-muted-foreground">No sites found matching your search.</p>
            </div>
          ) : (
          filteredSites.map((site) => {
            const completedCount = site.projectors.filter((p) => p.status === "completed").length
            const pendingCount = site.projectors.filter((p) => p.status === "pending").length
            const scheduledCount = site.projectors.filter((p) => p.status === "scheduled").length

            return (
              <div key={site.id} className="border border-border bg-background">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleSite(site.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      toggleSite(site.id)
                    }
                  }}
                  className="w-full text-left cursor-pointer"
                >
                  <div className="p-5 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {expandedSites.has(site.id) ? (
                          <ChevronDown className="w-4 h-4 text-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-foreground mb-2">{site.name}</h3>
                        <div className="space-y-1 mb-3">
                          <p className="text-sm text-muted-foreground">{site.address}</p>
                          {site.contactDetails && (
                            <p className="text-sm text-muted-foreground">{site.contactDetails}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-6 pt-3 border-t border-border">
                          <div>
                            <span className="text-xs text-muted-foreground">Total</span>
                            <p className="text-sm font-semibold text-foreground mt-0.5">{site.projectors.length}</p>
                          </div>
                          {completedCount > 0 && (
                            <div>
                              <span className="text-xs text-muted-foreground">Completed</span>
                              <p className="text-sm font-semibold text-foreground mt-0.5">{completedCount}</p>
                            </div>
                          )}
                          {pendingCount > 0 && (
                            <div>
                              <span className="text-xs text-muted-foreground">Pending</span>
                              <p className="text-sm font-semibold text-foreground mt-0.5">{pendingCount}</p>
                            </div>
                          )}
                          {scheduledCount > 0 && (
                            <div>
                              <span className="text-xs text-muted-foreground">Scheduled</span>
                              <p className="text-sm font-semibold text-foreground mt-0.5">{scheduledCount}</p>
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            router.push(`/admin/dashboard/sites/${site.id}`)
                          }}
                          className="mt-4 border-border"
                        >
                          Open Site Page
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {expandedSites.has(site.id) && (
                  <div className="border-t border-border bg-muted/20 p-5">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-0.5">Projectors</h4>
                        <p className="text-xs text-muted-foreground">{site.projectors.length} projector{site.projectors.length !== 1 ? 's' : ''}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedSite(site.id)
                        }}
                        className="border-border"
                      >
                        Add Projector
                      </Button>
                    </div>

                    {site.projectors.length === 0 ? (
                      <div className="py-6 text-center border border-dashed border-border">
                        <p className="text-sm text-muted-foreground mb-3">No projectors match the selected filter.</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedSite(site.id)
                          }}
                          className="border-border"
                        >
                          Add First Projector
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {site.projectors.map((projector) => {
                          const projectorForDetails: Projector = {
                            id: projector.id,
                            name: projector.name,
                            model: projector.model,
                            serialNumber: projector.serialNumber,
                            installDate: projector.installDate,
                            lastServiceDate: projector.lastServiceDate,
                            status: projector.status,
                            nextServiceDue: projector.nextServiceDue,
                            serviceHistory: projector.serviceHistory,
                          }
                          const siteForDetails: Site = {
                            id: site.id,
                            name: site.name,
                            location: site.location,
                            address: site.address,
                            createdDate: site.createdDate,
                            projectors: [],
                          }
                          return (
                            <ProjectorDetails
                              key={projector.id}
                              site={siteForDetails}
                              projector={projectorForDetails}
                              onSchedule={() => {
                                setSelectedProjector({ siteId: site.id, projectorId: projector.id })
                                setShowSchedule(true)
                              }}
                              onViewDetails={() =>
                                router.push(`/admin/dashboard/sites/${site.id}/projectors/${projector.id}`)
                              }
                            />
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
          )}
        </div>
      )}

      {showAddSite && (
        <AddSiteModal
          onClose={() => setShowAddSite(false)}
          onSuccess={() => {
            fetchSites()
          }}
        />
      )}
      {selectedSite && (
        <AddProjectorModal
          siteId={selectedSite}
          onClose={() => setSelectedSite(null)}
          onSuccess={() => {
            fetchSites()
            setSelectedSite(null)
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
            fetchSites()
            setSelectedProjector(null)
            setShowSchedule(false)
          }}
        />
      )}
    </div>
  )
}
