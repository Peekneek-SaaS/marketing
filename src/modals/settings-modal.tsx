import Modal from "@/components/modal";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import React from "react";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { SunMoon } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";

const SettingsModal = () => {
  return (
    <Modal title="Settings">
      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <SunMoon />
              Theme
            </CardTitle>

            <ModeToggle />
          </CardContent>
        </Card>
      </div>
    </Modal>
  );
};

export default SettingsModal;
