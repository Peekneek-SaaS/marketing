import { create } from "zustand";

interface SettingsStoreProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}
export const useSettingsStore = create<SettingsStoreProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
