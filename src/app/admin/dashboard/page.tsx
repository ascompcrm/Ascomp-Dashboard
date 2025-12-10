import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarRange } from "lucide-react"
import DashboardClient from "./dashboard-client"

export default function Page() {
  return (
    <div className="p-6 flex flex-col gap-4">
      <Header />
      <DashboardClient />
    </div>
  )
}

const Header = () => (
  <div className="w-full flex items-center justify-between bg-white rounded-md border px-4 py-3 shadow-sm">
    <div className="flex items-center gap-3">
      <h1 className="text-lg font-semibold text-slate-900">Analytics</h1>
      <Badge variant="secondary" className="text-xs">
        Live
      </Badge>
    </div>
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Button variant="outline" size="sm" className="gap-2">
        <CalendarRange className="h-4 w-4" />
        All time
      </Button>
    </div>
  </div>
)

