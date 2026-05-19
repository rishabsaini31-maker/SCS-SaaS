"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useDashboardMetrics, useLogout, useAdminProfile } from '@/lib/hooks';
import { useRouter } from 'next/navigation';

export default function ActiveUsers() {
  const router = useRouter();
  const { data: metrics } = useDashboardMetrics();
  const logout = useLogout();
  const { data: profile } = useAdminProfile();

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.push('/login');
  };

  // Mock active sessions data - in production this would come from the API
  const activeSessions = [
    { id: 1, email: 'owner1@business.com', shopName: 'ABC Wholesale', loginTime: new Date(Date.now() - 3600000), lastActive: new Date(Date.now() - 120000) },
    { id: 2, email: 'owner2@business.com', shopName: 'XYZ Imports', loginTime: new Date(Date.now() - 1800000), lastActive: new Date(Date.now() - 30000) },
    { id: 3, email: 'owner3@business.com', shopName: 'Global Traders', loginTime: new Date(Date.now() - 7200000), lastActive: new Date(Date.now() - 600000) },
  ];

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
          <p className="text-secondary text-[11px] font-medium tracking-wider">Super Admin Panel</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary hover:bg-surface-container-high transition-colors" href="/">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-body-md">Dashboard</span>
          </Link>
          <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary hover:bg-surface-container-high transition-colors" href="/tenants">
            <span className="material-symbols-outlined">storefront</span>
            <span className="font-body-md">Tenants / Shops</span>
          </Link>
          <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary hover:bg-surface-container-high transition-colors" href="/create-shop">
            <span className="material-symbols-outlined">add_business</span>
            <span className="font-body-md">Create Shop</span>
          </Link>
          <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary-container text-on-secondary-container border-l-4 border-primary transition-colors" href="/users">
            <span className="material-symbols-outlined">group</span>
            <span className="font-body-md">Active Users</span>
          </Link>
          <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary hover:bg-surface-container-high transition-colors" href="/reports">
            <span className="material-symbols-outlined">analytics</span>
            <span className="font-body-md">SaaS Reports</span>
          </Link>
          <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary hover:bg-surface-container-high transition-colors" href="/settings">
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
            <span className="font-body-md">{logout.isPending ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        {/* TopAppBar */}
        <header className="bg-surface-container-lowest h-20 sticky top-0 z-50 border-b border-outline-variant flex items-center justify-between px-8 shrink-0">
          <h2 className="font-display-sm text-display-sm text-on-surface">Active Users</h2>
          <div className="flex items-center gap-6">
            <div className="h-8 w-px bg-outline-variant"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="font-label-caps text-on-surface">{profile?.admin?.email || 'Admin'}</p>
                <p className="text-[10px] text-secondary">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 overflow-y-auto">
          <div className="flex flex-col gap-8">
            {/* Page Header */}
            <div>
              <h1 className="font-display-sm text-display-sm text-on-surface mb-1">Active User Sessions</h1>
              <p className="text-secondary font-body-md">Monitor currently logged-in users across all shops.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                <p className="text-secondary text-label-caps mb-2 uppercase tracking-wider">Active Sessions</p>
                <p className="font-display-sm text-display-sm text-green-700">{metrics?.activeSessions || activeSessions.length}</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                <p className="text-secondary text-label-caps mb-2 uppercase tracking-wider">Active Tenants</p>
                <p className="font-display-sm text-display-sm text-on-surface">{metrics?.activeTenants || 0}</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                <p className="text-secondary text-label-caps mb-2 uppercase tracking-wider">Last 24h Logins</p>
                <p className="font-display-sm text-display-sm text-primary">12</p>
              </div>
            </div>

            {/* Sessions Table */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container-low">
                      <th className="text-left py-4 px-6 text-label-caps text-secondary font-semibold uppercase">User Email</th>
                      <th className="text-left py-4 px-6 text-label-caps text-secondary font-semibold uppercase">Shop Name</th>
                      <th className="text-left py-4 px-6 text-label-caps text-secondary font-semibold uppercase">Login Time</th>
                      <th className="text-left py-4 px-6 text-label-caps text-secondary font-semibold uppercase">Last Active</th>
                      <th className="text-left py-4 px-6 text-label-caps text-secondary font-semibold uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {activeSessions.map((session) => (
                      <tr key={session.id} className="hover:bg-surface-container-high transition-colors">
                        <td className="py-4 px-6 text-body-sm text-on-surface">{session.email}</td>
                        <td className="py-4 px-6 text-body-sm text-on-surface">{session.shopName}</td>
                        <td className="py-4 px-6 text-body-sm text-secondary">
                          {session.loginTime.toLocaleTimeString()}
                        </td>
                        <td className="py-4 px-6 text-body-sm text-secondary">
                          {Math.round((Date.now() - session.lastActive.getTime()) / 1000 / 60)} min ago
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase bg-green-100 text-green-700">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-primary-container/10 border border-primary/20 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-primary text-2xl mt-1">info</span>
                <div>
                  <h3 className="font-body-md text-on-surface font-medium mb-1">Session Monitoring</h3>
                  <p className="text-body-sm text-secondary">
                    Active user sessions are tracked in real-time. Sessions expire after 30 minutes of inactivity for security purposes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
