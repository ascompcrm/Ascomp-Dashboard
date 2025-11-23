"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

type ViewType = "overview" | "sites" | "fieldworkers" | "site-detail" | "projector-detail"

const getViewType = (title: string): ViewType => {
  if (title === "Sites & Projectors") return "sites"
  if (title === "Field Workers") return "fieldworkers"
  if (title === "Settings") return "overview"
  if (title === "Home") return "overview"
  return "overview"
}

export function NavMain({
  items,
  onSelectionChange,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
  onSelectionChange?: (view: ViewType) => void
}) {
  const handleItemClick = (e: React.MouseEvent, title: string) => {
    e.preventDefault()
    const viewType = getViewType(title)
    onSelectionChange?.(viewType)
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a href={item.url} onClick={(e) => handleItemClick(e, item.title)}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.url} onClick={(e) => {
                              e.preventDefault()
                              // For sub-items, we can map them to specific views if needed
                              // For now, clicking a sub-item will trigger the parent view
                              const viewType = getViewType(item.title)
                              onSelectionChange?.(viewType)
                            }}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
