import DashboardPageShell from "@/components/admin/dashboard-page-shell"
import ProjectorDetailPage from "@/components/admin/projector-detail-page"

export default function ProjectorDetailRoute({
  params,
}: {
  params: { siteId: string; projectorId: string }
}) {
  const breadcrumbs = [
    { label: "Home", href: "/admin/dashboard/overview" },
    { label: "Sites & Projectors", href: "/admin/dashboard/sites" },
    { label: "Site Details", href: `/admin/dashboard/sites/${params.siteId}` },
    { label: "Projector Details" },
  ]

  return (
    <DashboardPageShell breadcrumbs={breadcrumbs}>
      <ProjectorDetailPage siteId={params.siteId} projectorId={params.projectorId} />
    </DashboardPageShell>
  )
}

