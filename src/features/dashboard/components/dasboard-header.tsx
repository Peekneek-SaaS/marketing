"use client";

import { Button } from "@/components/ui/button";
import { LogOutIcon, SettingsIcon } from "lucide-react";
import DashboardSelect from "./dashboard-select";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardHeader() {
  return (
    <div className="flex flex-col gap-4 h-16 border-b">
      <div className="flex items-center justify-between h-full w-full px-4 ">
        <div className="flex items-center justify-start gap-4">
          <SidebarTrigger />
          <DashboardSelect />
        </div>
        <div className="flex items-center justify-end gap-4">
          <Button variant="outline">
            <SettingsIcon className="size-3" />
            <span className="hidden md:block">New Project</span>
          </Button>
          <Button variant="outline">
            <LogOutIcon className="size-3" />
            <span className="hidden md:block">Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
