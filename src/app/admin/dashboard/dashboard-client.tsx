"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Activity,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Projector,
  CalendarIcon,
  ChevronDown,
} from "lucide-react"
import { format } from "date-fns"

type LowFlProjector = {
  id: string
  serialNo: string
  modelNo: string
  siteName: string
  flLeft: string
  flRight: string
  avgFl: string
  lastServiceDate: string | null
}

type PendingProjector = {
  id: string
  serialNo: string
  modelNo: string
  status: string
  siteName: string
  lastServiceDate: string | null
}

type EngineerStat = {
  id: string
  name: string
  email: string
  completed: number
  pending: number
  inProgress: number
  total: number
}

type ServiceByDay = {
  day: string
  count: number
}

type ServiceByMonth = {
  month: string
  count: number
}

type DashboardData = {
  totals: {
    all: number
    scheduled: number
    pending: number
    projectors: number
    engineers: number
    completed: number
  }
  servicesByDay: ServiceByDay[]
  servicesByMonth: ServiceByMonth[]
  lowFlProjectors: LowFlProjector[]
  pendingProjectors: PendingProjector[]
  engineerStats: EngineerStat[]
  recent: any[]
}

type EngineerStatsResponse = {
  filter: string
  dateRange: { start: string; end: string }
  totals: {
    engineers: number
    totalAssigned: number
    totalCompleted: number
    totalPending: number
    totalInProgress: number
  }
  engineers: EngineerStat[]
}

const chartConfig: ChartConfig = {
  completed: { label: "Completed", color: "#22c55e" },
  pending: { label: "Pending", color: "#ef4444" },
  inProgress: { label: "In Progress", color: "#eab308" },
  scheduled: { label: "Scheduled", color: "#3b82f6" },
}

// Color palette for pie chart segments
const PIE_COLORS = ["#000000", "#374151", "#6b7280", "#9ca3af", "#d1d5db", "#e5e7eb", "#f3f4f6"]

const MetricCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  trend?: "up" | "down" | "neutral"
  trendLabel?: string
}) => (
  <div className="border border-border rounded-lg bg-white">
    <div className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium whitespace-nowrap text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {trendLabel && (
            <p className={`text-xs mt-1 ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-muted-foreground"}`}>
              {trendLabel}
            </p>
          )}
        </div>
        <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
          <Icon className="h-5 w-5 text-foreground" />
        </div>
      </div>
    </div>
  </div>
)

type DateFilterType = "today" | "7days" | "month" | "custom"

export default function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [serviceViewMode, setServiceViewMode] = useState<"weekly" | "monthly">("weekly")
  
  // Engineer stats state
  const [engineerStats, setEngineerStats] = useState<EngineerStat[]>([])
  const [engineerStatsLoading, setEngineerStatsLoading] = useState(false)
  const [engineerFilter, setEngineerFilter] = useState<DateFilterType>("today")
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)

  // Load main dashboard data
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch("/api/admin/analytics", { cache: "no-store" })
        if (!res.ok) {
          throw new Error("Failed to load analytics")
        }
        const json = (await res.json()) as DashboardData
        if (mounted) setData(json)
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Failed to load analytics")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  // Load engineer stats based on filter
  useEffect(() => {
    const loadEngineerStats = async () => {
      setEngineerStatsLoading(true)
      try {
        let url = `/api/admin/engineer-stats?filter=${engineerFilter}`
        if (engineerFilter === "custom" && customDate) {
          url += `&date=${format(customDate, "yyyy-MM-dd")}`
        }
        const res = await fetch(url, { cache: "no-store" })
        if (res.ok) {
          const json = (await res.json()) as EngineerStatsResponse
          setEngineerStats(json.engineers)
        }
      } catch (err) {
        console.error("Failed to load engineer stats:", err)
      } finally {
        setEngineerStatsLoading(false)
      }
    }
    loadEngineerStats()
  }, [engineerFilter, customDate])

  const handleFilterSelect = (filter: DateFilterType) => {
    if (filter === "custom") {
      setIsDatePickerOpen(true)
    } else {
      setEngineerFilter(filter)
      setCustomDate(undefined)
    }
    setIsFilterDropdownOpen(false)
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCustomDate(date)
      setEngineerFilter("custom")
      setIsDatePickerOpen(false)
    }
  }

  const getFilterLabel = () => {
    switch (engineerFilter) {
      case "today":
        return "Today"
      case "7days":
        return "Last 7 Days"
      case "month":
        return "Last Month"
      case "custom":
        return customDate ? format(customDate, "dd MMM yyyy") : "Pick Date"
      default:
        return "Today"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">{error ?? "Unable to load analytics."}</p>
        </div>
      </div>
    )
  }

  const { totals, servicesByDay, servicesByMonth, lowFlProjectors, pendingProjectors } = data

  // Transform service data for pie chart
  const servicePieData = serviceViewMode === "weekly"
    ? servicesByDay.map((item, index) => ({
        name: item.day,
        value: item.count,
        fill: PIE_COLORS[index % PIE_COLORS.length],
      }))
    : servicesByMonth.map((item, index) => ({
        name: item.month,
        value: item.count,
        fill: PIE_COLORS[index % PIE_COLORS.length],
      }))

  const totalServices = servicePieData.reduce((acc, item) => acc + item.value, 0)

  return (
    <div className="flex flex-col gap-6">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard title="Total Services" value={totals.all} icon={Activity} />
        <MetricCard title="Completed Projectors" value={totals.completed} icon={CheckCircle2} />
        <MetricCard title="Scheduled Projectors" value={totals.scheduled} icon={Clock} />
        <MetricCard title="Pending Projectors" value={totals.pending} icon={AlertTriangle} trendLabel="Need attention" trend="down" />
        <MetricCard title="Total Projectors" value={totals.projectors} icon={Projector} />
        <MetricCard title="Engineers" value={totals.engineers} icon={Users} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Service Stats - Single Card with Toggle */}
        <div className="border border-border rounded-lg bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Service Activity</h3>
            <div className="flex items-center gap-1 bg-muted/50 rounded-md p-1">
              <button
                onClick={() => setServiceViewMode("weekly")}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  serviceViewMode === "weekly"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setServiceViewMode("monthly")}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  serviceViewMode === "monthly"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <ChartContainer config={chartConfig} className="h-[200px] flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={servicePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {servicePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            
            <div className="flex flex-col gap-2">
              <div className="text-center mb-2">
                <p className="text-2xl font-bold text-foreground">{totalServices}</p>
                <p className="text-xs text-muted-foreground">Total Services</p>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {servicePieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Engineer Performance with Date Filter */}
        <div className="border border-border rounded-lg bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Engineer Performance</h3>
            
            {/* Date Filter Dropdown */}
            <Popover open={isFilterDropdownOpen} onOpenChange={setIsFilterDropdownOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {getFilterLabel()}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-1" align="end">
                <div className="flex flex-col">
                  <button
                    onClick={() => handleFilterSelect("today")}
                    className={`text-left px-3 py-2 text-sm rounded-md hover:bg-muted ${engineerFilter === "today" ? "bg-muted font-medium" : ""}`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => handleFilterSelect("7days")}
                    className={`text-left px-3 py-2 text-sm rounded-md hover:bg-muted ${engineerFilter === "7days" ? "bg-muted font-medium" : ""}`}
                  >
                    Last 7 Days
                  </button>
                  <button
                    onClick={() => handleFilterSelect("month")}
                    className={`text-left px-3 py-2 text-sm rounded-md hover:bg-muted ${engineerFilter === "month" ? "bg-muted font-medium" : ""}`}
                  >
                    Last Month
                  </button>
                  <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <button
                        className={`text-left px-3 py-2 text-sm rounded-md hover:bg-muted ${engineerFilter === "custom" ? "bg-muted font-medium" : ""}`}
                      >
                        Pick Date
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={customDate}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          {engineerStatsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : engineerStats.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No engineer data for this period</p>
          ) : (
            <>
              <ChartContainer config={chartConfig} className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={engineerStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9ca3af" allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      stroke="#9ca3af"
                      width={80}
                      tickFormatter={(value) => value.slice(0, 10)}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="completed" stackId="a" fill="#22c55e" name="Completed" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="inProgress" stackId="a" fill="#eab308" name="In Progress" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="pending" stackId="a" fill="#ef4444" name="Pending" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="flex justify-center gap-4 mt-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">Completed</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                  <span className="text-muted-foreground">In Progress</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span className="text-muted-foreground">Pending (Overdue)</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Low fL & Pending Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Low fL Projectors */}
        <div className="border border-border rounded-lg bg-white">
          <div className="flex items-center justify-between p-4 pb-2">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Low fL Projectors (&lt;10 fL)
            </h3>
            <Badge variant="destructive" className="text-xs">{lowFlProjectors.length} Found</Badge>
          </div>
          
          {lowFlProjectors.length === 0 ? (
            <div className="p-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">All projectors have healthy fL levels</p>
            </div>
          ) : (
            <div className="max-h-[220px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs font-semibold">Serial No</TableHead>
                    <TableHead className="text-xs font-semibold">Site</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Avg fL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowFlProjectors.slice(0, 8).map((proj) => (
                    <TableRow key={proj.id} className="hover:bg-muted/20">
                      <TableCell className="text-xs font-medium">{proj.serialNo}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{proj.siteName}</TableCell>
                      <TableCell className="text-xs text-right">
                        <span className="text-red-600 font-semibold">{proj.avgFl}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Pending Projectors Quick View */}
        <div className="border border-border rounded-lg bg-white">
          <div className="flex items-center justify-between p-4 pb-2">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Projectors Needing Service
            </h3>
            <Badge variant="outline" className="text-xs">{pendingProjectors.length} Projectors</Badge>
          </div>
          
          {pendingProjectors.length === 0 ? (
            <div className="p-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">All projectors are up to date</p>
            </div>
          ) : (
            <div className="max-h-[220px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs font-semibold">Serial No</TableHead>
                    <TableHead className="text-xs font-semibold">Site</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Last Service</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingProjectors.slice(0, 8).map((proj) => (
                    <TableRow key={proj.id} className="hover:bg-muted/20">
                      <TableCell className="text-xs font-medium">{proj.serialNo}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{proj.siteName}</TableCell>
                      <TableCell className="text-xs text-right">
                        {proj.lastServiceDate ? (
                          <span className="text-amber-600">{proj.lastServiceDate}</span>
                        ) : (
                          <span className="text-red-600">Never</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
