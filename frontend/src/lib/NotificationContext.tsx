"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";

export type PendingProduct = {
  id: string;
  name: string;
  purchasePrice: number;
};

interface NotificationContextType {
  pendingProducts: PendingProduct[];
  setPendingProducts: (products: PendingProduct[]) => void;
  dismissedNotifications: Set<string>;
  dismissNotification: (productId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [dismissedNotifications, setDismissedNotifications] = useState<
    Set<string>
  >(new Set());

  const dismissNotification = useCallback((productId: string) => {
    setDismissedNotifications((prev) => new Set(prev).add(productId));
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        pendingProducts,
        setPendingProducts,
        dismissedNotifications,
        dismissNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  }
  return context;
}
