import DashboardPageShell from "@/components/admin/dashboard-page-shell"
import OverviewView from "@/components/admin/overview-view"

const breadcrumbs = [
  { label: "Home", href: "/admin/dashboard/overview" },
  { label: "Overview" },
]

export default function OverviewPage() {
  return (
    <DashboardPageShell breadcrumbs={breadcrumbs}>
      <OverviewView />
    </DashboardPageShell>
  )
}

