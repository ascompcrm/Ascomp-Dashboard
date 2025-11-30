import DashboardPageShell from "@/components/admin/dashboard-page-shell"
import SitesView from "@/components/admin/sites-view"

const breadcrumbs = [
  { label: "Home", href: "/admin/dashboard/overview" },
  { label: "Sites & Projectors" },
]

export default function SitesPage() {
  return (
    <DashboardPageShell breadcrumbs={breadcrumbs}>
      <SitesView />
    </DashboardPageShell>
  )
}

