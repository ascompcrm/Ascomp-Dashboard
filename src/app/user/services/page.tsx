"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ArrowLeft, Search, CalendarIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

import { ServiceDetailView, type Service } from "@/components/services/service-detail-view"
import { ServiceCard } from "@/components/services/service-card"
import { ServiceListSkeleton } from "@/components/services/service-list-skeleton"

type ViewMode = "completed" | "allCompleted"

// Simple hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  return debouncedValue
}

export default function ServicesPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("completed")
  
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState<Date>()
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Reset selected service when view mode changes
  useEffect(() => {
    setSelectedService(null)
  }, [viewMode])

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login")
        return
      }
      fetchServices(viewMode)
    }
  }, [user, isLoading, router, viewMode])

  const fetchServices = async (mode: ViewMode) => {
    try {
      setLoading(true)
      const endpoint =
        mode === "completed"
          ? "/api/user/services/completed"
          : "/api/user/services/all-completed"

      const response = await fetch(endpoint, {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setServices(data.services || [])
      } else {
        console.error(`Failed to fetch ${mode} services:`, response.statusText)
        setServices([])
      }
    } catch (error) {
      console.error("Failed to fetch services:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort services
  const filteredServices = services.filter((service) => {
    const query = debouncedSearchQuery.toLowerCase()
    
    // Safety checks for null/undefined values
    const matchesSearch =
      (service.site?.name?.toLowerCase().includes(query) ?? false) ||
      (service.projector?.model?.toLowerCase().includes(query) ?? false) ||
      (service.serviceNumber?.toString().includes(query) ?? false) ||
      (service.cinemaName?.toLowerCase().includes(query) ?? false) ||
      (service.site?.address?.toLowerCase().includes(query) ?? false) ||
      (service.address?.toLowerCase().includes(query) ?? false)

    // Check if service date matches selected date (comparing YYYY-MM-DD parts)
    const matchesDate = dateFilter 
      ? service.date?.startsWith(format(dateFilter, "yyyy-MM-dd")) 
      : true

    return matchesSearch && matchesDate
  }).sort((a, b) => {
    // Both modes show completed services, so use completedAt for sorting
    const aDate = a.completedAt || a.date
    const bDate = b.completedAt || b.date
    return new Date(bDate || "").getTime() - new Date(aDate || "").getTime()
  })

  // Loading state
  if (loading && !selectedService) {
    return (
      <div className="min-h-screen bg-white w-full">
         <div className="border-b-2 border-black p-4 sm:p-6">
            <div className="max-w-6xl mx-auto">
               <div className="h-10 w-20 bg-gray-100 animate-pulse rounded mb-4" />
               <div className="h-10 w-48 bg-gray-100 animate-pulse rounded" />
            </div>
         </div>
         <div className="max-w-6xl mx-auto p-4 sm:p-6 w-full">
           <ServiceListSkeleton />
         </div>
      </div>
    )
  }

  // Detail View
  if (selectedService) {
    return (
      <ServiceDetailView
        service={selectedService}
        onBack={() => setSelectedService(null)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-white w-full">
      <div className="border-b-2 border-black p-4 sm:p-6 sticky top-0 bg-white z-10 transition-all">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 border-2 border-transparent hover:border-black hover:bg-transparent -ml-3"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-black tracking-tight">
                {viewMode === "completed" ? "Completed Services" : "All Completed Services"}
              </h1>
              <p className="text-gray-600 mt-2 text-sm font-medium">
                {filteredServices.length} service{filteredServices.length !== 1 ? "s" : ""} found
                {services.length !== filteredServices.length && ` (filtered from ${services.length})`}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64 group">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-black transition-colors" />
                <Input
                  placeholder="Search site, address, model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-2 border-gray-200 focus-visible:border-black focus-visible:ring-0 transition-colors"
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full sm:w-[200px] justify-start text-left font-normal border-2 border-gray-200 hover:border-black hover:bg-white",
                      !dateFilter && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    initialFocus
                    captionLayout="dropdown"
                    className="rounded-md border shadow-sm"
                  />
                </PopoverContent>
              </Popover>
              <div className="flex rounded-md border-2 border-black overflow-hidden shadow-sm">
                <Button
                  type="button"
                  variant={viewMode === "completed" ? "default" : "ghost"}
                  className={`flex-1 rounded-none font-semibold ${viewMode === "completed" ? "bg-black text-white" : "text-black hover:bg-gray-100"}`}
                  onClick={() => {
                      if (viewMode !== "completed") {
                        setLoading(true)
                        setViewMode("completed")
                        setSearchQuery("") // Optional: clear search on mode switch
                      }
                  }}
                >
                  Completed
                </Button>
                <Button
                  type="button"
                  variant={viewMode === "allCompleted" ? "default" : "ghost"}
                  className={`flex-1 rounded-none font-semibold ${viewMode === "allCompleted" ? "bg-black text-white" : "text-black hover:bg-gray-100"}`}
                  onClick={() => {
                      if (viewMode !== "allCompleted") {
                        setLoading(true)
                        setViewMode("allCompleted")
                        setSearchQuery("")
                      }
                  }}
                >
                  All Completed
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 w-full fade-in-up">
        {filteredServices.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300 shadow-none">
            <CardContent className="p-12 text-center">
              <div className="rounded-full bg-gray-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                 <Search className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-lg font-semibold text-gray-900">
                No services found
              </p>
              <p className="text-sm text-gray-500 mt-1">
                 {services.length === 0
                  ? viewMode === "completed" 
                    ? "You don't have any completed services yet."
                    : "No completed services found."
                  : "Try adjusting your search or date filter."}
              </p>
              {services.length > 0 && (
                <Button 
                    variant="link" 
                    onClick={() => {
                        setSearchQuery("")
                        setDateFilter(undefined)
                    }}
                    className="mt-4 text-black underline"
                >
                    Clear all filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredServices.map((service) => (
              <ServiceCard 
                key={service.id} 
                service={service} 
                onClick={() => setSelectedService(service)}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
