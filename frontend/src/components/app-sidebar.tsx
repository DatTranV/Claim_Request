"use client";

import * as React from "react";
import {
  CircleUserRound,
  Command,
  CreditCard,
  FileCheck2,
  LifeBuoy,
  LogIn,
  Plus,
  Send,
  Settings,
  Settings2,
  Sticker,
} from "lucide-react";

import { useState } from "react";
import { NavMain } from "@/components/nav/nav-main";
import { NavSecondary } from "@/components/nav/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth/auth-context";
import { NavUser } from "./nav/nav-user";

const defaultUserData = {
  avatar: "/images/avatar.png",
};

const navUserData = [
  {
    title: "Profile",
    url: "/profile",
    icon: CircleUserRound,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  }
];

const navMainData = [
  {
    title: "Create Claim",
    url: "/create",
    icon: Plus,
    isActive: true,
  },
  {
    title: "My Claim",
    url: "#",
    icon: Sticker,
    items: [
      {
        title: "Draft",
        url: "/my-claim/draft",
      },
      {
        title: "Pending Approval",
        url: "/my-claim/pending-approval",
      },
      {
        title: "Approved",
        url: "/my-claim/approved",
      },
      {
        title: "Paid",
        url: "/my-claim/paid",
      },
      {
        title: "Rejected or Cancelled",
        url: "/my-claim/rejected-or-cancelled",
      },

    ],
  },
  {
    title: "Claim for Approval",
    url: "#",
    icon: FileCheck2,
    items: [
      {
        title: "For my Vetting",
        url: "/claim-for-approval/for-my-vetting",
      },
      {
        title: "Approved or Paid",
        url: "/claim-for-approval/approved-or-paid",
      },
    ],
  },
  {
    title: "Claim for Finance",
    url: "#",
    icon: CreditCard,
    items: [
      {
        title: "Approved",
        url: "/claim-for-finance/approved",
      },
      {
        title: "Paid",
        url: "/claim-for-finance/paid",
      },
    ],
  },
  {
    title: "Configurations",
    url: "#",
    icon: Settings2,
    items: [
      {
        title: "Staff Information",
        url: "/admin/staffv3",
      },
      {
        title: "Project Information",
        url: "/admin/projectv3",
      },
      {
        title: "Audit Trail",
        url: "/admin/audit-trail",
      },
    ],
  },
];

const navSecondaryData = [
  {
    title: "Support",
    url: "/support-center",
    icon: LifeBuoy,
  },
  {
    title: "Feedback",
    url: "/feedback",
    icon: Send,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const { isAuthenticated, loading, currentUser, hasPermission } = useAuth();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filteredNavMain = navMainData.filter(item => {
    switch (item.title) {
      case "Create Claim":
      case "My Claim":
        return true; // Tất cả role đều có thể xem
      case "Claim for Approval":
        return hasPermission("APPROVER");
      case "Claim for Finance":
        return hasPermission("FINANCE");
      case "Configurations":
        return hasPermission("ADMIN");
      default:
        return true;
    }
  });

  const data = {
    user: {
      fullName: currentUser?.fullName,
      email: currentUser?.email,
      avatar: defaultUserData.avatar,
    },
    navUser: navUserData,
    navMain: filteredNavMain,
    navSecondary: navSecondaryData,
  };

  const handleLoginClick = () => {
    router.push("/login");
    setOpen(false);
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div onClick={() => router.push("/")} >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    Claim Request System
                  </span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : isAuthenticated ? (
          <>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <NavUser items={data.navUser} />
            )}
          </>
        ) : (
          <Button
            className="w-full flex items-center gap-2"
            onClick={handleLoginClick}
          >
            <LogIn className="h-4 w-4" />
            <span>Login here</span>
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}