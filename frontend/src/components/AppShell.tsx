"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import PoweredByBadge from "@/components/PoweredByBadge";
import { AuthGate } from "@/components/AuthGate";

const publicRoutes = new Set(["/", "/login", "/landing", "/pricing", "/about", "/contact"]);

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (publicRoutes.has(pathname) || pathname.startsWith("/mobile")) {
    return <>{children}</>;
  }

  return (
    <AuthGate>
      <Sidebar />
      <Topbar />
      <main className="ml-[240px] mt-[64px] p-8 min-h-screen">{children}</main>
      <PoweredByBadge />
    </AuthGate>
  );
}