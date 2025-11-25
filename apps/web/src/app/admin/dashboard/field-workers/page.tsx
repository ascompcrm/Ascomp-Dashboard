import DashboardPageShell from "@/components/admin/dashboard-page-shell"
import FieldWorkersView from "@/components/admin/field-workers-view"

const breadcrumbs = [
  { label: "Home", href: "/admin/dashboard/overview" },
  { label: "Field Workers" },
]

export default function FieldWorkersPage() {
  return (
    <DashboardPageShell breadcrumbs={breadcrumbs}>
      <FieldWorkersView />
    </DashboardPageShell>
  )
}

