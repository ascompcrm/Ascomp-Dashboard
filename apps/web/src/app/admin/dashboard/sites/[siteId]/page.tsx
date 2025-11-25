import DashboardPageShell from "@/components/admin/dashboard-page-shell"
import SiteDetailPage from "@/components/admin/site-detail-page"

export default function SingleSitePage({ params }: { params: { siteId: string } }) {
  const breadcrumbs = [
    { label: "Home", href: "/admin/dashboard/overview" },
    { label: "Sites & Projectors", href: "/admin/dashboard/sites" },
    { label: "Site Details" },
  ]

  return (
    <DashboardPageShell breadcrumbs={breadcrumbs}>
      <SiteDetailPage siteId={params.siteId} />
    </DashboardPageShell>
  )
}

