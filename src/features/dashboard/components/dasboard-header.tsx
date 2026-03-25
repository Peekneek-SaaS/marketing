"use client";

import { Button } from "@/components/ui/button";
import { LogOutIcon, SettingsIcon } from "lucide-react";
import DashboardSelect from "./dashboard-select";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import { useSettingsStore } from "@/hooks/use-settings-store";

export default function DashboardHeader() {
  const onOpenSettings = useSettingsStore((state) => state.onOpen);
  return (
    <div className="flex flex-col gap-4 h-16 border-b">
      <div className="flex items-center justify-between h-full w-full px-4 ">
        <div className="flex items-center justify-start gap-4">
          <SidebarTrigger />
          <DashboardSelect />
        </div>
        <div className="flex items-center justify-end gap-4">
          <Button variant="outline" onClick={onOpenSettings}>
            <SettingsIcon className="size-3" />
            <span className="hidden md:block">Settings</span>
          </Button>
          <UserButton />
        </div>
      </div>
    </div>
  );
}
