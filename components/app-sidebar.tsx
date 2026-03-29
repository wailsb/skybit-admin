"use client"

import * as React from "react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import { DashboardSquare01Icon, Menu01Icon, ChartHistogramIcon, Folder01Icon, UserGroupIcon, Camera01Icon, File01Icon, Settings05Icon, HelpCircleIcon, SearchIcon, Database01Icon, Analytics01Icon, CommandIcon, Profile02Icon } from "@hugeicons/core-free-icons"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: (
        <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />
      ),
    },
    {
      title: "Services",
      url: "#",
      icon: (
        <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />
      ),
    },
    {
      title: "Form",
      url: "#",
      icon: (
        <HugeiconsIcon icon={File01Icon} strokeWidth={2} />
      ),
    },
    {
      title: "Clients",
      url: "#",
      icon: (
        <HugeiconsIcon icon={Profile02Icon} strokeWidth={2} />
      ),
    },
    {
      title: "Our Team",
      url: "#",
      icon: (
        <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />
      ),
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: (
        <HugeiconsIcon icon={Settings05Icon} strokeWidth={2} />
      ),
    },
    {
      title: "Get Help",
      url: "#",
      icon: (
        <HugeiconsIcon icon={HelpCircleIcon} strokeWidth={2} />
      ),
    },
    {
      title: "Search",
      url: "#",
      icon: (
        <HugeiconsIcon icon={SearchIcon} strokeWidth={2} />
      ),
    },
  ],
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="#" />}
            >
              <HugeiconsIcon icon={CommandIcon} strokeWidth={2} className="size-5!" />
              <span className="text-base font-semibold">SkyBit Agency.</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
