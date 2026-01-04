import { create } from "zustand";
import { type ReactNode } from "react";

// 모달 타입 정의
export interface ModalConfig {
  id: string;
  component: ReactNode;
  props?: Record<string, unknown>;
  onClose?: () => void;
}

interface ModalState {
  modals: ModalConfig[];

  // 모달 열기
  open: (config: ModalConfig) => void;

  // 특정 모달 닫기
  close: (id: string) => void;

  // 모든 모달 닫기
  closeAll: () => void;

  // 최상위 모달 닫기
  closeLast: () => void;
}

export const useModalStore = create<ModalState>((set, get) => ({
  modals: [],

  open: (config) => {
    set((state) => ({
      modals: [...state.modals.filter((m) => m.id !== config.id), config],
    }));
  },

  close: (id) => {
    const modal = get().modals.find((m) => m.id === id);
    modal?.onClose?.();
    set((state) => ({
      modals: state.modals.filter((m) => m.id !== id),
    }));
  },

  closeAll: () => {
    get().modals.forEach((m) => m.onClose?.());
    set({ modals: [] });
  },

  closeLast: () => {
    const { modals, close } = get();
    if (modals.length > 0) {
      close(modals[modals.length - 1].id);
    }
  },
}));

// 편의 훅
export function useModal(id: string) {
  const { modals, open, close } = useModalStore();
  const isOpen = modals.some((m) => m.id === id);

  return {
    isOpen,
    open: (component: ReactNode, props?: Record<string, unknown>) =>
      open({ id, component, props }),
    close: () => close(id),
  };
}
