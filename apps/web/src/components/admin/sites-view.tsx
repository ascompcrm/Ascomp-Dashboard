import { useState, useMemo } from "react"
import { useData } from "@/lib/data-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import SearchBar from "../search-bar"
import FilterTabs from "../filter-tabs"
import AddSiteModal from "./modals/add-site-modal"
import AddProjectorModal from "./modals/add-projector-modal"
import ScheduleServiceModal from "./modals/schedule-service-modal"
import ProjectorDetails from "./projector-details"
import { ChevronDown, ChevronRight } from "lucide-react"

interface SitesViewProps {
  onSiteClick?: (siteId: string) => void
  onProjectorClick?: (siteId: string, projectorId: string) => void
}

export default function SitesView({ onSiteClick, onProjectorClick }: SitesViewProps) {
  const { sites } = useData()
  const [expandedSites, setExpandedSites] = useState<Set<string>>(new Set(sites.map((s) => s.id)))
  const [showAddSite, setShowAddSite] = useState(false)
  const [selectedSite, setSelectedSite] = useState<string | null>(null)
  const [selectedProjector, setSelectedProjector] = useState<{ siteId: string; projectorId: string } | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [projectorFilter, setProjectorFilter] = useState("all")

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

      <div className="space-y-3">
        {filteredSites.length === 0 ? (
          <Card className="border-border p-6 text-center">
            <p className="text-muted-foreground">No sites found matching your search.</p>
          </Card>
        ) : (
          filteredSites.map((site) => (
            <Card key={site.id} className="border-border overflow-hidden">
              <button
                onClick={() => {
                  if (onSiteClick) {
                    onSiteClick(site.id)
                  } else {
                    toggleSite(site.id)
                  }
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  {!onSiteClick && (
                    <>
                      {expandedSites.has(site.id) ? (
                        <ChevronDown className="w-5 h-5 text-foreground" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-foreground" />
                      )}
                    </>
                  )}
                  <div className="text-left cursor-pointer">
                    <h3 className="font-semibold text-foreground">{site.name}</h3>
                    <p className="text-sm text-muted-foreground">{site.address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">{site.projectors.length}</div>
                  <div className="text-xs text-muted-foreground">Projectors</div>
                </div>
              </button>

              {!onSiteClick && expandedSites.has(site.id) && (
                <div className="border-t border-border bg-muted/20 p-4 space-y-3">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-foreground">Projectors</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedSite(site.id)}
                      className="text-xs border-border"
                    >
                      Add Projector
                    </Button>
                  </div>

                  {site.projectors.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No projectors match the selected filter.</p>
                  ) : (
                    <div className="space-y-2">
                      {site.projectors.map((projector) => (
                        <ProjectorDetails
                          key={projector.id}
                          site={site}
                          projector={projector}
                          onSchedule={() => {
                            setSelectedProjector({ siteId: site.id, projectorId: projector.id })
                            setShowSchedule(true)
                          }}
                          onViewDetails={onProjectorClick ? () => onProjectorClick(site.id, projector.id) : undefined}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {showAddSite && <AddSiteModal onClose={() => setShowAddSite(false)} />}
      {selectedSite && <AddProjectorModal siteId={selectedSite} onClose={() => setSelectedSite(null)} />}
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
