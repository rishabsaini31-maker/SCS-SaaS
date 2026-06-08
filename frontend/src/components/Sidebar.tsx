"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { useBusinessProfile } from "@/hooks/useSettings";
import api from "@/lib/api";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: businessProfile } = useBusinessProfile();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const shopName = businessProfile?.businessName?.trim() || "Your Shop";

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { name: "Billing", href: "/billing", icon: "receipt_long" },
    { name: "Purchase", href: "/purchase", icon: "shopping_cart" },
    { name: "Inventory", href: "/inventory", icon: "inventory_2" },
    { name: "Parties", href: "/parties", icon: "group" },
    { name: "Payments", href: "/payments", icon: "payments" },
    { name: "Reports", href: "/reports", icon: "assessment" },
    { name: "Barcode", href: "/barcode", icon: "barcode_scanner" },
    { name: "Backup", href: "/backup", icon: "backup" },
    { name: "Settings", href: "/settings", icon: "settings" },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await api.post("/auth/logout");
    } finally {
      setIsLoggingOut(false);
      router.push("/login");
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] border-r border-slate-200 bg-slate-50 dark:bg-slate-950 flex flex-col py-4 z-50">
      <div className="px-6 mb-8 flex items-center gap-3">
        <img
          src="/scs-logo.jpeg"
          alt="SCS Flow Logo"
          className="h-10 w-auto rounded-md object-contain"
        />
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-h1 leading-none">
            SCS Flow
          </h1>
          <p className="text-xs text-slate-500 font-body-sm mt-1">
            Management Suite
          </p>
        </div>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center px-3 py-2 cursor-pointer transition-all active:scale-95 ${
                isActive
                  ? "bg-slate-200/50 dark:bg-slate-800/50 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <span
                className={`material-symbols-outlined mr-3 ${
                  !isActive ? "text-slate-500" : ""
                }`}
              >
                {link.icon}
              </span>
              <span className="font-body-md text-sm font-medium">
                {link.name}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="px-6 pt-4 border-t border-slate-200 space-y-3">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="User Profile"
            className="w-8 h-8 rounded-full border border-slate-200"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQ4yD3bKMWH4RNx1rHMio1C3jYPZKihElqN_6eu83oi3-SsmUwJ14I2KYyL7nIrKLE33t3jINGXpNP90uXqGXsIDsNDssEy1XRM4PGJiAXA0eT9bVkQQd5AIF44bzlHJ_au1YorBcT2UKjF8pP9N_CTNYWJhMPfswhwjUtg5KP28ps0kq5w9sUs2LtuPHCtLENOtqTMPB9Ls-0QyL0fAdzO5yPXK_pOjF6bvp128QlzYRCGaIG24ljuA_6MlPUrOCxz7nQvgLp4JA"
          />
          <div>
            <p className="text-xs font-semibold text-slate-900">{shopName}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
