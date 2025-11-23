"use client"

import { useState } from "react"
import SitesView from "./admin/sites-view"
import FieldWorkersView from "./admin/field-workers-view"
import OverviewView from "./admin/overview-view"
import SiteDetailPage from "./admin/site-detail-page"
import ProjectorDetailPage from "./admin/projector-detail-page"
import FieldWorkerDetailPage from "./admin/field-worker-detail-page"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

type ViewType = "overview" | "sites" | "fieldworkers" | "site-detail" | "projector-detail" | "fieldworker-detail"

interface DetailPageState {
  siteId?: string
  projectorId?: string
  workerId?: string
}

interface AdminDashboarddProps {
  activeView: ViewType
  onViewChange: (view: ViewType) => void
}

export default function AdminDashboardd({ activeView, onViewChange }: AdminDashboarddProps) {
  const [detailState, setDetailState] = useState<DetailPageState>({})

  const handleViewSiteDetail = (siteId: string) => {
    setDetailState({ siteId })
    onViewChange("site-detail")
  }

  const handleViewProjectorDetail = (siteId: string, projectorId: string) => {
    setDetailState({ siteId, projectorId })
    onViewChange("projector-detail")
  }

  const handleViewWorkerDetail = (workerId: string) => {
    setDetailState({ workerId })
    onViewChange("fieldworker-detail")
  }

  const handleBack = () => {
    if (activeView === "site-detail" || activeView === "projector-detail") {
      onViewChange("sites")
    } else if (activeView === "fieldworker-detail") {
      onViewChange("fieldworkers")
    }
    setDetailState({})
  }

  const getBreadcrumbs = () => {
    const breadcrumbs = [
      <BreadcrumbItem key="home">
        <BreadcrumbLink
          onClick={(e) => {
            e.preventDefault()
            onViewChange("overview")
          }}
          className="cursor-pointer"
        >
          Home
        </BreadcrumbLink>
      </BreadcrumbItem>,
    ]

    if (activeView === "overview") {
      breadcrumbs.push(
        <BreadcrumbSeparator key="sep1" />,
        <BreadcrumbItem key="overview">
          <BreadcrumbPage>Overview</BreadcrumbPage>
        </BreadcrumbItem>
      )
    } else if (activeView === "sites") {
      breadcrumbs.push(
        <BreadcrumbSeparator key="sep1" />,
        <BreadcrumbItem key="sites">
          <BreadcrumbPage>Sites & Projectors</BreadcrumbPage>
        </BreadcrumbItem>
      )
    } else if (activeView === "site-detail") {
      breadcrumbs.push(
        <BreadcrumbSeparator key="sep1" />,
        <BreadcrumbItem key="sites">
          <BreadcrumbLink
            onClick={(e) => {
              e.preventDefault()
              onViewChange("sites")
            }}
            className="cursor-pointer"
          >
            Sites & Projectors
          </BreadcrumbLink>
        </BreadcrumbItem>,
        <BreadcrumbSeparator key="sep2" />,
        <BreadcrumbItem key="site-detail">
          <BreadcrumbPage>Site Details</BreadcrumbPage>
        </BreadcrumbItem>
      )
    } else if (activeView === "projector-detail") {
      breadcrumbs.push(
        <BreadcrumbSeparator key="sep1" />,
        <BreadcrumbItem key="sites">
          <BreadcrumbLink
            onClick={(e) => {
              e.preventDefault()
              onViewChange("sites")
            }}
            className="cursor-pointer"
          >
            Sites & Projectors
          </BreadcrumbLink>
        </BreadcrumbItem>,
        <BreadcrumbSeparator key="sep2" />,
        <BreadcrumbItem key="site-detail">
          <BreadcrumbLink
            onClick={(e) => {
              e.preventDefault()
              handleBack()
            }}
            className="cursor-pointer"
          >
            Site Details
          </BreadcrumbLink>
        </BreadcrumbItem>,
        <BreadcrumbSeparator key="sep3" />,
        <BreadcrumbItem key="projector-detail">
          <BreadcrumbPage>Projector Details</BreadcrumbPage>
        </BreadcrumbItem>
      )
    } else if (activeView === "fieldworkers") {
      breadcrumbs.push(
        <BreadcrumbSeparator key="sep1" />,
        <BreadcrumbItem key="fieldworkers">
          <BreadcrumbPage>Field Workers</BreadcrumbPage>
        </BreadcrumbItem>
      )
    } else if (activeView === "fieldworker-detail") {
      breadcrumbs.push(
        <BreadcrumbSeparator key="sep1" />,
        <BreadcrumbItem key="fieldworkers">
          <BreadcrumbLink
            onClick={(e) => {
              e.preventDefault()
              onViewChange("fieldworkers")
            }}
            className="cursor-pointer"
          >
            Field Workers
          </BreadcrumbLink>
        </BreadcrumbItem>,
        <BreadcrumbSeparator key="sep2" />,
        <BreadcrumbItem key="fieldworker-detail">
          <BreadcrumbPage>Worker Details</BreadcrumbPage>
        </BreadcrumbItem>
      )
    }

    return breadcrumbs
  }

  return (
    <div className="w-full">
      <div className="flex-1 flex flex-col">
        <header className="border-b border-border bg-card">
          <div className="px-6 lg:px-8 py-4">
            <Breadcrumb>
              <BreadcrumbList>{getBreadcrumbs()}</BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <main className="w-full">
          <div className="px-6 lg:px-8 py-8 w-full ">
            {activeView === "overview" && <OverviewView />}
            {activeView === "sites" && (
              <SitesView onSiteClick={handleViewSiteDetail} onProjectorClick={handleViewProjectorDetail} />
            )}
            {activeView === "site-detail" && detailState.siteId && (
              <SiteDetailPage siteId={detailState.siteId} onProjectorClick={handleViewProjectorDetail} />
            )}
            {activeView === "projector-detail" && detailState.siteId && detailState.projectorId && (
              <ProjectorDetailPage
                siteId={detailState.siteId}
                projectorId={detailState.projectorId}
                onBack={handleBack}
              />
            )}
            {activeView === "fieldworkers" && (
              <FieldWorkersView onWorkerClick={handleViewWorkerDetail} />
            )}
            {activeView === "fieldworker-detail" && detailState.workerId && (
              <FieldWorkerDetailPage workerId={detailState.workerId} onBack={handleBack} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
