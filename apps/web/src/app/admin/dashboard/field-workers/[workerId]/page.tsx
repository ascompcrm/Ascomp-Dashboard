import DashboardPageShell from "@/components/admin/dashboard-page-shell"
import FieldWorkerDetailPage from "@/components/admin/field-worker-detail-page"

export default function FieldWorkerDetailRoute({ params }: { params: { workerId: string } }) {
  const breadcrumbs = [
    { label: "Home", href: "/admin/dashboard/overview" },
    { label: "Field Workers", href: "/admin/dashboard/field-workers" },
    { label: "Worker Details" },
  ]

  return (
    <DashboardPageShell breadcrumbs={breadcrumbs}>
      <FieldWorkerDetailPage workerId={params.workerId} />
    </DashboardPageShell>
  )
}

