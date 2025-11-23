import * as React from "react"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  Home,
  LifeBuoy,
  Map,
  PieChart,
  Projector,
  Send,
  Settings2,
  SquareTerminal,
  User,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { useAuth } from "@/lib/auth-context"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navMainData = [
    {
      title: "Home",
      url: "/",
      icon: Home,
      isActive: true,
    },
    {
      title: "Sites & Projectors",
      url: "#",
      icon: Projector,
      items: [
        {
          title: "Pending",
          url: "#",
        },
      ],
    },
    {
      title: "Field Workers",
      url: "#",
      icon: User,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
    },
  ]

type ViewType = "overview" | "sites" | "fieldworkers" | "site-detail" | "projector-detail"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onSelectionChange?: (view: ViewType) => void
}

export function AppSidebar({ onSelectionChange, ...props }: AppSidebarProps) {
  const { user, logout } = useAuth()

  if (!user) {
    return null
  }

  const userData = {
    name: user.name || (user.role === 'ADMIN' ? 'Admin' : 'Field Worker'),
    email: user.email,
    avatar: user.image || '/avatars/shadcn.jpg',
  }

  return (
    <Sidebar
      className="h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Ascomp Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainData} onSelectionChange={onSelectionChange} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} onLogout={logout} />
      </SidebarFooter>
    </Sidebar>
  )
}
