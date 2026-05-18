import React from "react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const toasts: Toast[] = [];
const listeners: Set<(toasts: Toast[]) => void> = new Set();

export const toast = {
  success: (message: string) => showToast(message, "success"),
  error: (message: string) => showToast(message, "error"),
  info: (message: string) => showToast(message, "info"),
};

function showToast(message: string, type: ToastType) {
  const id = Math.random().toString(36).substr(2, 9);
  const newToast: Toast = { id, message, type };
  toasts.push(newToast);
  notifyListeners();

  setTimeout(() => {
    removeToast(id);
  }, 3000);
}

function removeToast(id: string) {
  const index = toasts.findIndex((t) => t.id === id);
  if (index !== -1) {
    toasts.splice(index, 1);
    notifyListeners();
  }
}

function notifyListeners() {
  listeners.forEach((listener) => listener([...toasts]));
}

export function useToasts() {
  const [currentToasts, setCurrentToasts] = React.useState<Toast[]>([...toasts]);

  React.useEffect(() => {
    listeners.add(setCurrentToasts);
    return () => {
      listeners.delete(setCurrentToasts);
    };
  }, []);

  return currentToasts;
}
