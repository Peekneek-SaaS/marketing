"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { PackageIcon, PlusIcon, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardSidebarMenuItem {
  title: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
}

interface DashboardSidebarMenuGroup {
  label?: string;
  items: DashboardSidebarMenuItem[];
  pathname: string;
  className?: string;
}

function DashboardSidebarContent({
  label,
  items,
  pathname,
  className,
}: DashboardSidebarMenuGroup) {
  return (
    <SidebarGroup className={className}>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu className="flex flex-col gap-2">
          {items.map((item, _index) => (
            <SidebarMenuItem key={_index}>
              <SidebarMenuButton
                onClick={item.onClick}
                asChild={!!item.href}
                tooltip={item.title}
                isActive={
                  item.href
                    ? item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href)
                    : false
                }
              >
                {item.href ? (
                  <Link href={item.href} className={cn("")}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                ) : (
                  <>
                    <item.icon />
                    <span>{item.title}</span>
                  </>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const trpc = useTRPC();
  const { data } = useQuery(trpc.getAllProducts.queryOptions());

  const dashboardSidebarMenuItems: DashboardSidebarMenuItem[] = [
    {
      title: "New Project",
      icon: PlusIcon,
      href: "/",
    },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between ">
          <svg
            width="50"
            height="50"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.0964 20.3536L17.6262 22.4473L17.046 27.6527L8.94876 36.8282C4.2486 33.8023 0.898178 28.8615 0 23.108L13.0964 20.3536Z"
              fill="#15E3FF"
            ></path>
            <path
              d="M25.183 25.94L31.2414 36.3789C27.992 38.6605 24.0331 40 19.7612 40C18.3744 40 17.0206 39.8587 15.7133 39.59L17.046 27.6527L20.4765 23.7656L25.183 25.94Z"
              fill="#348DFC"
            ></path>
            <path
              d="M39.1022 14.881C39.5332 16.5143 39.763 18.2294 39.763 19.9982C39.763 24.1145 38.5192 27.9403 36.3874 31.1207L25.184 25.9405L22.5551 21.4123L25.8574 17.6692L39.1022 14.881Z"
              fill="#FD4873"
            ></path>
            <path
              d="M17.046 27.6524L17.0458 27.6527L17.1686 26.552L17.046 27.6524Z"
              fill="#FFC700"
            ></path>
            <path
              d="M20.132 0C26.1505 0.109415 31.5194 2.877 35.1148 7.17842L25.8561 17.6694L20.9792 18.6959L18.519 14.4574L20.132 0Z"
              fill="#FFC700"
            ></path>
            <path
              d="M18.519 14.4574L17.9745 19.3269L13.0991 20.353L0.514709 14.5347C2.09964 8.94044 6.05794 4.3436 11.2327 1.9007L18.519 14.4574Z"
              fill="#00E7B9"
            ></path>
          </svg>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <DashboardSidebarContent
          items={dashboardSidebarMenuItems}
          pathname={pathname}
        />
        <DashboardSidebarContent
          key={data?.products.map((product) => product.id).join(",")}
          label="Your Projects"
          items={
            data?.products.map((product) => ({
              title: product.brand || "Untitled",
              icon: PackageIcon,
              href: `/p/${product.id}`,
            })) || []
          }
          pathname={pathname}
          className="group-data-[collapsible=icon]:hidden"
        />
      </SidebarContent>
    </Sidebar>
  );
}
