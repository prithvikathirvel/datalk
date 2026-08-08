"use client";

import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  createdAt: number;
}

export interface ToastInput {
  type: ToastType;
  message: string;
  title?: string;
}

interface ToastState {
  toasts: Toast[];
  push: (toast: ToastInput) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

/**
 * Auto-incrementing id — sufficient because toasts are created on the client
 * only, never replayed from a server.
 */
let toastSequence = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    toastSequence += 1;
    const id = `toast-${toastSequence}`;
    set((state) => ({
      // Keep the stack bounded — drop the oldest beyond 5.
      toasts: [
        ...state.toasts.slice(-4),
        { ...toast, id, createdAt: Date.now() },
      ],
    }));
    return id;
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

/**
 * Convenience API — import { toast } from "@/stores/toast-store" anywhere in
 * client components and call toast.success(...) / toast.error(...).
 */
export const toast = {
  success(message: string, title?: string) {
    return useToastStore.getState().push({ type: "success", message, title });
  },
  error(message: string, title?: string) {
    return useToastStore.getState().push({ type: "error", message, title });
  },
  info(message: string, title?: string) {
    return useToastStore.getState().push({ type: "info", message, title });
  },
  dismiss(id: string) {
    useToastStore.getState().dismiss(id);
  },
};
