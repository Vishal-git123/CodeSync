"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Code2,
  Compass,
  FolderPlus,
  History,
  Home,
  LayoutDashboard,
  Lightbulb,
  type LucideIcon,
  Plus,
  Settings,
  Star,
  Terminal,
  Zap,
  Database,
  FlameIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import Image from "next/image";

interface PlaygroundData {
  id: string;
  name: string;
  icon: string;
  starred: boolean;
}

const lucideIconMap: Record<string, LucideIcon> = {
  Zap,
  Lightbulb,
  Database,
  Compass,
  FlameIcon,
  Terminal,
  Code2,
};

export function DashboardSidebar({
  initialPlaygroundData,
}: {
  initialPlaygroundData: PlaygroundData[];
}) {
  const pathname = usePathname();

  const [starredPlaygrounds] = useState(
    initialPlaygroundData.filter((playground) => playground.starred),
  );

  const [recentPlaygrounds] = useState(initialPlaygroundData);

  return (
    <Sidebar variant="inset" collapsible="icon" className="border-1 border-r">
      <SidebarHeader>
        <div className="flex items-center justify-center gap-2 px-4 py-3">
          <Image src="/logo.svg" alt="logo" height={60} width={60} />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={
                  <Link href="/">
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Link>
                }
                isActive={pathname === "/"}
                tooltip="Home"
              />
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                render={
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                }
                isActive={pathname === "/dashboard"}
                tooltip="Dashboard"
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Starred */}
        <SidebarGroup>
          <SidebarGroupLabel>
            <Star className="mr-2 h-4 w-4" />
            Starred
          </SidebarGroupLabel>

          <SidebarGroupAction title="Add starred playground">
            <Plus className="h-4 w-4" />
          </SidebarGroupAction>

          <SidebarGroupContent>
            <SidebarMenu>
              {starredPlaygrounds.length === 0 &&
              recentPlaygrounds.length === 0 ? (
                <div className="w-full py-4 text-center text-muted-foreground">
                  Create your playground
                </div>
              ) : (
                starredPlaygrounds.map((playground) => {
                  const IconComponent = lucideIconMap[playground.icon] || Code2;

                  return (
                    <SidebarMenuItem key={playground.id}>
                      <SidebarMenuButton
                        render={
                          <Link href={`/playground/${playground.id}`}>
                            <IconComponent className="h-4 w-4" />
                            <span>{playground.name}</span>
                          </Link>
                        }
                        isActive={pathname === `/playground/${playground.id}`}
                        tooltip={playground.name}
                      />
                    </SidebarMenuItem>
                  );
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recent */}
        <SidebarGroup>
          <SidebarGroupLabel>
            <History className="mr-2 h-4 w-4" />
            Recent
          </SidebarGroupLabel>

          <SidebarGroupAction title="Create new playground">
            <FolderPlus className="h-4 w-4" />
          </SidebarGroupAction>

          <SidebarGroupContent>
            <SidebarMenu>
              {recentPlaygrounds.map((playground) => {
                const IconComponent = lucideIconMap[playground.icon] || Code2;

                return (
                  <SidebarMenuItem key={playground.id}>
                    <SidebarMenuButton
                      render={
                        <Link href={`/playground/${playground.id}`}>
                          <IconComponent className="h-4 w-4" />
                          <span>{playground.name}</span>
                        </Link>
                      }
                      isActive={pathname === `/playground/${playground.id}`}
                      tooltip={playground.name}
                    />
                  </SidebarMenuItem>
                );
              })}

              <SidebarMenuItem>
                <SidebarMenuButton
                  render={
                    <Link href="/playgrounds">
                      <span className="text-sm text-muted-foreground">
                        View all playgrounds
                      </span>
                    </Link>
                  }
                  tooltip="View all"
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={
                <Link href="/settings">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              }
              tooltip="Settings"
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
