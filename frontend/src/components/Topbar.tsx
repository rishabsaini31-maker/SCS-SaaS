"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/lib/NotificationContext";
import { formatINR } from "@/lib/currency";

export function Topbar() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const { pendingProducts, dismissNotification, dismissedNotifications } =
    useNotifications();

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key !== "k") return;
      if (!(event.metaKey || event.ctrlKey)) return;

      event.preventDefault();
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 right-0 h-[64px] w-[calc(100%-240px)] bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex justify-between items-center px-8 z-40 shadow-sm dark:shadow-none">
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full group focus-within:ring-2 focus-within:ring-blue-500 rounded-lg">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            search
          </span>
          <input
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-10 pr-16 text-sm focus:ring-0 focus:outline-none"
            placeholder="Search invoices, products, customers..."
            ref={searchInputRef}
            type="text"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
            Cmd+K
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 ml-8">
        <button
          className="bg-primary text-white px-4 py-2 rounded-lg font-body-sm flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
          onClick={() => router.push("/billing")}
          type="button"
        >
          <span className="material-symbols-outlined text-sm">add</span>+ Create
          Invoice
        </button>
        <div className="h-6 w-px bg-slate-200 mx-2"></div>
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors relative"
          >
            <span className="material-symbols-outlined">notifications</span>
            {pendingProducts.length > dismissedNotifications.size && (
              <span className="absolute top-1 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Pending Products
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {pendingProducts.length} new products need activation
                </p>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {pendingProducts.length > 0 ? (
                  <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {pendingProducts.map((product) => (
                      <div
                        key={product.id}
                        className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-start justify-between"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 dark:text-white text-sm">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Cost: {formatINR(product.purchasePrice)}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            dismissNotification(product.id);
                            router.push("/inventory");
                          }}
                          className="ml-2 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors whitespace-nowrap"
                        >
                          Activate
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                    All products are activated
                  </div>
                )}
              </div>
              {pendingProducts.length > 0 && (
                <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      router.push("/inventory");
                    }}
                    className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Go to Inventory
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <button className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          <span className="material-symbols-outlined">help_outline</span>
        </button>
      </div>
    </header>
  );
}
