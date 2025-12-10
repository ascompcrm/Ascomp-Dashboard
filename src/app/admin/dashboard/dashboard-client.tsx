"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { CardTitle } from "@/components/ui/card"
import { ArrowUpRight } from "lucide-react"
import OverviewView from "@/components/admin/overview-view"

type RecentRecord = {
  id: string
  serviceNumber: string | null
  cinemaName: string | null
  siteId: string | null
  projectorSerial: string | null
  projectorModel: string | null
  engineer: string | null
  status: string
  date: string | null
}

type PendingProjector = {
  id: string
  serialNo: string
  modelNo: string
  status: string
  lastServiceDate: string | null
}

type DashboardData = {
  totals: {
    all: number
    scheduled: number
    pending: number
  }
  pendingProjectors: PendingProjector[]
  recent: RecentRecord[]
}

const MetricCard = ({ title, value, helper }: { title: string; value: string; helper?: string }) => (
  <div className="h-full p-4 rounded-md border bg-white shadow-sm">
    <div className="flex flex-row items-start justify-between space-y-0 pb-2">
      <div className="text-sm font-medium text-muted-foreground">{title}</div>
    </div>
    <div className="flex items-baseline justify-between">
      <div className="text-2xl font-semibold text-slate-900">{value}</div>
      {helper ? (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <ArrowUpRight className="h-3.5 w-3.5" />
          {helper}
        </span>
      ) : null}
    </div>
  </div>
)

export default function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading analytics…</div>
  }

  if (error || !data) {
    return <div className="text-sm text-rose-600">Error: {error ?? "Unable to load analytics."}</div>
  }

  const { totals } = data

  return (
    <div className="flex flex-col gap-4 ">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard title="Total records" value={totals.all.toString()} />
        <MetricCard title="Scheduled" value={totals.scheduled.toString()} />
        <MetricCard title="Pending" value={totals.pending.toString()} />
        <MetricCard title="Total Workers" value="4" />
      </div>

    <div className="grid grid-cols-3 gap-4">
      <div className="rounded-md col-span-2 h-[60vh] overflow-auto p-4 bg-white shadow-sm border">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-semibold text-slate-900">Recent completions</CardTitle>
          <Badge variant="secondary" className="gap-1 text-xs">
            10 latest
          </Badge>
        </div>
          <OverviewView hideHeader limit={10} />
      </div>
      <div className="w-full h-full bg-yellow-200 rounded-md"></div>
      </div>
    </div>
  )
}

