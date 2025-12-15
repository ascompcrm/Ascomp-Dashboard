import DashboardPageShell from "@/components/admin/dashboard-page-shell"
import FieldWorkerDetailPage from "@/components/admin/field-worker-detail-page"

export default async function FieldWorkerDetailRoute({ params }: { params: Promise<{ workerId: string }> }) {
  const { workerId } = await params
  const breadcrumbs = [
    { label: "Home", href: "/admin/dashboard/overview" },
    { label: "Field Workers", href: "/admin/dashboard/field-workers" },
    { label: "Worker Details" },
  ]

  return (
    <DashboardPageShell breadcrumbs={breadcrumbs}>
      <div className="p-6">
      <FieldWorkerDetailPage workerId={workerId} />
      </div>
    </DashboardPageShell>
  )
}

