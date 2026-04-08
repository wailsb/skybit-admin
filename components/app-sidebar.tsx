"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import Link from "next/link"
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
import { DashboardSquare01Icon, Menu01Icon, UserGroupIcon, File01Icon, Settings05Icon, HelpCircleIcon, CommandIcon, Profile02Icon } from "@hugeicons/core-free-icons"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: (
        <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />
      ),
    },
    {
      title: "Services",
      url: "/services",
      icon: (
        <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />
      ),
    },
    {
      title: "Form",
      url: "/form",
      icon: (
        <HugeiconsIcon icon={File01Icon} strokeWidth={2} />
      ),
    },
    {
      title: "Clients",
      url: "/clients",
      icon: (
        <HugeiconsIcon icon={Profile02Icon} strokeWidth={2} />
      ),
    },
    {
      title: "Our Team",
      url: "/team",
      icon: (
        <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />
      ),
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: (
        <HugeiconsIcon icon={Settings05Icon} strokeWidth={2} />
      ),
    },
    {
      title: "Get Help",
      url: "mailto:wail.saribey@gmail.com",
      icon: (
        <HugeiconsIcon icon={HelpCircleIcon} strokeWidth={2} />
      ),
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string;
    email: string;
    avatar: string;
  } | null;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={
                <Link href="/">
                  <HugeiconsIcon icon={CommandIcon} strokeWidth={2} className="size-5!" />
                  <span className="text-base font-semibold">SkyBit Agency.</span>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user || data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
