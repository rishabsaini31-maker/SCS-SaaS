"use client";
import React from "react";

export default function AdminNavbar() {
  return (
    <header className="bg-surface-container-lowest dark:bg-surface-dim h-header-height w-full sticky top-0 z-50 border-b border-outline-variant dark:border-outline shadow-sm dark:shadow-none flex items-center justify-between px-container-padding shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <span
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline"
            data-icon="search"
          >
            search
          </span>
          <input
            className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-body-sm focus:ring-2 focus:ring-primary"
            placeholder="Search analytics, tenants, or logs..."
            type="text"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[10px] font-mono border border-outline-variant px-1 rounded">
            ⌘K
          </span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <button className="p-2 text-secondary hover:text-primary transition-colors focus:ring-2 focus:ring-primary ring-offset-2 rounded-full relative">
            <span
              className="material-symbols-outlined"
              data-icon="notifications"
            >
              notifications
            </span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border border-surface-container-lowest"></span>
          </button>
          <button className="p-2 text-secondary hover:text-primary transition-colors focus:ring-2 focus:ring-primary ring-offset-2 rounded-full">
            <span
              className="material-symbols-outlined"
              data-icon="account_tree"
            >
              account_tree
            </span>
          </button>
        </div>
        <div className="h-8 w-px bg-outline-variant"></div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="font-label-caps text-label-caps text-on-surface">
              SCS-Super-Admin
            </p>
            <p className="text-[10px] text-secondary">Super Admin</p>
          </div>
          <img
            alt="SCS Admin Profile"
            className="w-10 h-10 rounded-full border border-outline-variant object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjXK-Ip9QizUTR19EgDz4dQl5uzM0KOUtDdhy7rw-q7MbhgXZNj-gLPW2N6of-lFXRkFtgocUSlmfAA3wZz2HtAqFKTbeVdI14zX1SRyu4OcrgNhXr9J5wMy-hXlCfxpR9xIXL2ziNM8qNMuNLNeX6b63YFybMPnHgK8pD5gfL_3rcf0WVAqMh8aY9EhvHjyINban2mIhVNYQEjHvPPb81djMVZkNsWIYwZWg_WdslGFTkrK4I_2az2kKdzThKu48O7aEMbOiFhBI"
          />
        </div>
      </div>
    </header>
  );
}
