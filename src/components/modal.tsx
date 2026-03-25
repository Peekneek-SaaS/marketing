"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSettingsStore } from "@/hooks/use-settings-store";

interface ModalProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const Modal = ({ title, description, children }: ModalProps) => {
  const isOpen = useSettingsStore((state) => state.isOpen);
  const onClose = useSettingsStore((state) => state.onClose);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
