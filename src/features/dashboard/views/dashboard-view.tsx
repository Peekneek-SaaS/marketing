"use client";

import DashboardViewInput from "@/features/dashboard/components/dashboard-view-input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LogOutIcon, SettingsIcon } from "lucide-react";

function DashboardView() {
  return (
    <>
      <div className="flex flex-col gap-4 h-16 border-b">
        <div className="flex items-center justify-between h-full w-full px-4 ">
          <div className="flex items-center justify-start gap-4">
            <SidebarTrigger />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a fruit" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Fruits</SelectLabel>
                  <SelectItem value="apple">Apple</SelectItem>
                  <SelectItem value="banana">Banana</SelectItem>
                  <SelectItem value="blueberry">Blueberry</SelectItem>
                  <SelectItem value="grapes">Grapes</SelectItem>
                  <SelectItem value="pineapple">Pineapple</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
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
      <DashboardViewInput />
    </>
  );
}

export default DashboardView;
