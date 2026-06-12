"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

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
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
      // Fallback
      window.location.href = "/login";
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">SCS Flow</h1>
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">Mobile</div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            title="Log out"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const { data: session } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      return res.data;
    },
  });

  const isSalesman = session?.user?.role === "SALESMAN";
  const isActive = (path: string) => pathname === path;

  const visibleNavItems = navItems.filter((item) => {
    if (isSalesman && (item.path === "/mobile/parties" || item.path === "/mobile/payments")) {
      return false;
    }
    return true;
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 safe-area-pb">
      <div className={`grid gap-1 ${isSalesman ? 'grid-cols-3' : 'grid-cols-5'}`}>
        {visibleNavItems.map((item) => (
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