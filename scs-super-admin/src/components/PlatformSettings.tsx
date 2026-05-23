"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useLogout } from "@/lib/hooks";
import { useRouter } from "next/navigation";

export default function PlatformSettings() {
  const router = useRouter();
  const logout = useLogout();
  const [saveStatus, setSaveStatus] = useState("");
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    apiRateLimit: "1000",
    sessionTimeout: "30",
    maxTenants: "1000",
    enableNotifications: true,
    enableAnalytics: true,
  });

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.push("/");
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (err) {
      setSaveStatus("error");
    }
  };

  return (
    <div className="bg-background font-body-md text-on-background flex min-h-screen">
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="line-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#004ac6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#004ac6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* SideNavBar */}
      <aside className="bg-surface-container-low w-72 h-screen sticky top-0 left-0 border-r border-outline-variant flex flex-col py-6 shrink-0 z-40">
        <div className="px-6 mb-8">
          <h1 className="font-h1 text-h1 text-primary">SCS Admin</h1>
          <p className="text-secondary text-[11px] font-medium tracking-wider">
            Super Admin Panel
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary hover:bg-surface-container-high transition-colors"
            href="/"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-body-md">Dashboard</span>
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary hover:bg-surface-container-high transition-colors"
            href="/tenants"
          >
            <span className="material-symbols-outlined">storefront</span>
            <span className="font-body-md">Tenants / Shops</span>
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary hover:bg-surface-container-high transition-colors"
            href="/create-shop"
          >
            <span className="material-symbols-outlined">add_business</span>
            <span className="font-body-md">Create Shop</span>
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary hover:bg-surface-container-high transition-colors"
            href="/users"
          >
            <span className="material-symbols-outlined">group</span>
            <span className="font-body-md">Active Users</span>
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary hover:bg-surface-container-high transition-colors"
            href="/reports"
          >
            <span className="material-symbols-outlined">analytics</span>
            <span className="font-body-md">SaaS Reports</span>
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary-container text-on-secondary-container border-l-4 border-primary transition-colors"
            href="/settings"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-body-md">System Settings</span>
          </Link>
        </nav>
        <div className="px-3 mt-auto border-t border-outline-variant pt-4">
          <button
            onClick={handleLogout}
            disabled={logout.isPending}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-error hover:bg-error-container/20 transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-body-md">
              {logout.isPending ? "Logging out..." : "Logout"}
            </span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        {/* TopAppBar */}
        <header className="bg-surface-container-lowest h-20 sticky top-0 z-50 border-b border-outline-variant flex items-center justify-between px-8 shrink-0">
          <h2 className="font-display-sm text-display-sm text-on-surface">
            System Settings
          </h2>
          <div className="flex items-center gap-6">
            <div className="h-8 w-px bg-outline-variant"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="font-label-caps text-on-surface">
                  SCS-Super-Admin
                </p>
                <p className="text-[10px] text-secondary">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 overflow-y-auto">
          <div className="flex flex-col gap-8 max-w-4xl">
            {/* Page Header */}
            <div>
              <h1 className="font-display-sm text-display-sm text-on-surface mb-1">
                Platform Configuration
              </h1>
              <p className="text-secondary font-body-md">
                Manage system-wide settings and platform configuration.
              </p>
            </div>

            {/* Save Status */}
            {saveStatus === "saved" && (
              <div className="p-4 bg-green-100 border border-green-300 rounded-lg text-green-900 text-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">
                  check_circle
                </span>
                Settings saved successfully!
              </div>
            )}
            {saveStatus === "error" && (
              <div className="p-4 bg-error-container border border-error rounded-lg text-error text-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">
                  error
                </span>
                Failed to save settings. Please try again.
              </div>
            )}

            {/* General Settings Section */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-8 space-y-6">
              <div>
                <h2 className="font-body-md text-on-surface font-medium mb-1">
                  General Settings
                </h2>
                <p className="text-secondary text-body-sm">
                  Core platform configuration options.
                </p>
              </div>

              {/* Maintenance Mode */}
              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
                <div>
                  <p className="font-medium text-on-surface">
                    Maintenance Mode
                  </p>
                  <p className="text-body-sm text-secondary">
                    Put the platform in maintenance mode
                  </p>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) =>
                      handleSettingChange("maintenanceMode", e.target.checked)
                    }
                    className="w-5 h-5 rounded border-outline"
                  />
                </label>
              </div>

              {/* Enable Notifications */}
              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
                <div>
                  <p className="font-medium text-on-surface">
                    Email Notifications
                  </p>
                  <p className="text-body-sm text-secondary">
                    Send notifications to shop owners
                  </p>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.enableNotifications}
                    onChange={(e) =>
                      handleSettingChange(
                        "enableNotifications",
                        e.target.checked,
                      )
                    }
                    className="w-5 h-5 rounded border-outline"
                  />
                </label>
              </div>

              {/* Enable Analytics */}
              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
                <div>
                  <p className="font-medium text-on-surface">
                    Analytics Tracking
                  </p>
                  <p className="text-body-sm text-secondary">
                    Collect anonymized usage data
                  </p>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.enableAnalytics}
                    onChange={(e) =>
                      handleSettingChange("enableAnalytics", e.target.checked)
                    }
                    className="w-5 h-5 rounded border-outline"
                  />
                </label>
              </div>
            </div>

            {/* API & Performance Settings */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-8 space-y-6">
              <div>
                <h2 className="font-body-md text-on-surface font-medium mb-1">
                  API & Performance
                </h2>
                <p className="text-secondary text-body-sm">
                  Configure API and performance settings.
                </p>
              </div>

              {/* API Rate Limit */}
              <div>
                <label className="block text-body-sm text-on-surface mb-2 font-medium">
                  API Rate Limit (requests per minute)
                </label>
                <input
                  type="number"
                  value={settings.apiRateLimit}
                  onChange={(e) =>
                    handleSettingChange("apiRateLimit", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline rounded-lg text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-[12px] text-secondary mt-1">
                  Default: 1000 requests per minute
                </p>
              </div>

              {/* Session Timeout */}
              <div>
                <label className="block text-body-sm text-on-surface mb-2 font-medium">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) =>
                    handleSettingChange("sessionTimeout", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline rounded-lg text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-[12px] text-secondary mt-1">
                  User sessions will expire after this duration of inactivity
                </p>
              </div>

              {/* Max Tenants */}
              <div>
                <label className="block text-body-sm text-on-surface mb-2 font-medium">
                  Maximum Tenants
                </label>
                <input
                  type="number"
                  value={settings.maxTenants}
                  onChange={(e) =>
                    handleSettingChange("maxTenants", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline rounded-lg text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-[12px] text-secondary mt-1">
                  Maximum number of tenants allowed on the platform
                </p>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-error-container/10 border border-error/20 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-error text-2xl mt-1">
                  security
                </span>
                <div>
                  <h3 className="font-body-md text-on-surface font-medium mb-1">
                    Security Notice
                  </h3>
                  <p className="text-body-sm text-secondary">
                    Changes to system settings are applied immediately. Please
                    ensure all changes are reviewed by an authorized
                    administrator. Incorrect configuration may impact platform
                    availability and security.
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={saveStatus === "saving"}
                className="px-6 py-3 bg-primary text-on-primary rounded-lg text-body-md font-medium hover:bg-primary-container transition-colors disabled:opacity-50"
              >
                {saveStatus === "saving" ? "Saving..." : "Save Settings"}
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-surface-container-high text-on-surface rounded-lg text-body-md font-medium hover:bg-surface-container-highest transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
