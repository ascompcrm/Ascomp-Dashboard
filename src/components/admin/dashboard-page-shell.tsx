import type { ReactNode } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface BreadcrumbEntry {
  label: string
  href?: string
}

interface DashboardPageShellProps {
  breadcrumbs: BreadcrumbEntry[]
  children: ReactNode
}

export default function DashboardPageShell({ breadcrumbs, children }: DashboardPageShellProps) {
  return (
    <div className="flex flex-col w-full h-full">
      <header className="border-b border-border bg-card">
        <div className="px-6 lg:px-8 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1

                return (
                  <div className="flex items-center gap-2" key={`${crumb.label}-${index}`}>
                    <BreadcrumbItem>
                      {isLast || !crumb.href ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                    <BreadcrumbLink asChild>
                      <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                    </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator />}
                  </div>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">
        <div className="">{children}</div>
      </main>
    </div>
  )
}

