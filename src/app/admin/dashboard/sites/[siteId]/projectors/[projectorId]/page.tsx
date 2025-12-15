import DashboardPageShell from "@/components/admin/dashboard-page-shell"
import ProjectorDetailPage from "@/components/admin/projector-detail-page"

export default async function ProjectorDetailRoute({
  params,
}: {
  params: Promise<{ siteId: string; projectorId: string }>
}) {
  const { siteId, projectorId } = await params
  const breadcrumbs = [
    { label: "Home", href: "/admin/dashboard/overview" },
    { label: "Sites & Projectors", href: "/admin/dashboard/sites" },
    { label: "Site Details", href: `/admin/dashboard/sites/${siteId}` },
    { label: "Projector Details" },
  ]

  return (
    <DashboardPageShell breadcrumbs={breadcrumbs}>
      <div className="p-6">
        <ProjectorDetailPage siteId={siteId} projectorId={projectorId} />
      </div>
    </DashboardPageShell>
  )
}

