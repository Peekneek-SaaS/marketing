import * as React from "react";
import Header from "./components/header";
import { auth } from "@clerk/nextjs/server";
import Footer from "./components/footer";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const HomepageLayout = async ({ children }: { children: React.ReactNode }) => {
  const { userId } = await auth();

  return (
    <SidebarProvider className="">
      <div className="min-h-screen w-full bg-background flex flex-col">
        <Header userId={userId} />
        <SidebarInset>
          <main className="flex-1">{children}</main>
        </SidebarInset>
        <Footer />
      </div>
    </SidebarProvider>
  );
};

export default HomepageLayout;
