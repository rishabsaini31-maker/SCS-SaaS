"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { path: "/mobile/dashboard", label: "Dashboard", icon: "dashboard" },
  { path: "/mobile/billing", label: "Billing", icon: "receipt_long" },
  { path: "/mobile/inventory", label: "Inventory", icon: "inventory_2" },
  { path: "/mobile/parties", label: "Parties", icon: "groups" },
  { path: "/mobile/payments", label: "Payments", icon: "payments" },
];

export function MobileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <MobileHeader />
      <main className="flex-1 pb-20 px-4 pt-4 overflow-y-auto">{children}</main>
      <BottomNavigation />
    </div>
  );
}

function MobileHeader() {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">SCS Flow</h1>
        <div className="text-sm text-slate-600">Mobile</div>
      </div>
    </header>
  );
}

function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 safe-area-pb">
      <div className="grid grid-cols-5 gap-1">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
              isActive(item.path)
                ? "bg-blue-50 text-blue-600"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="material-symbols-outlined text-xl mb-1">
              {item.icon}
            </span>
            <span className={`text-[10px] font-medium ${isActive(item.path) ? "text-blue-600" : "text-slate-500"}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}