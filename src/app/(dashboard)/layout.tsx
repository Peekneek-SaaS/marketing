import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode, Suspense } from "react";
import DashboardSidebar from "@/features/dashboard/components/dashboard-sidebar";
import { cookies } from "next/headers";
import DashboardHeader from "@/features/dashboard/components/dasboard-header";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  prefetch(trpc.getAllProducts.queryOptions());

  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <HydrateClient>
        <DashboardSidebar />
      </HydrateClient>
      <SidebarInset className="min-h-0 min-w-0">
        <DashboardHeader />
        <main className="flex flex-col min-h-0 flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
