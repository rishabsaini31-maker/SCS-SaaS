"use client";
import React from 'react';
import Link from 'next/link';
import { useDashboardMetrics, useLogout, useAdminProfile } from '@/lib/hooks';
import { useRouter } from 'next/navigation';

export default function GrowthReports() {
  const router = useRouter();
  const { data: metrics, isLoading } = useDashboardMetrics();
  const logout = useLogout();
  const { data: profile } = useAdminProfile();

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.push('/login');
  };

  // Calculate growth metrics
  const invoiceGrowth = metrics ? ((metrics.invoiceCount / Math.max(metrics.totalTenants, 1)) * 100).toFixed(1) : 0;
  const productGrowth = metrics ? ((metrics.productCount / Math.max(metrics.totalTenants, 1)) * 100).toFixed(1) : 0;
  const healthPercentage = metrics ? Math.round((metrics.activeTenants / Math.max(metrics.totalTenants, 1)) * 100) : 0;

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
          <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary hover:bg-surface-container-high transition-colors" href="/users">
            <span className="material-symbols-outlined">group</span>
            <span className="font-body-md">Active Users</span>
          </Link>
          <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary-container text-on-secondary-container border-l-4 border-primary transition-colors" href="/reports">
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
          <h2 className="font-display-sm text-display-sm text-on-surface">SaaS Growth Reports</h2>
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
              <h1 className="font-display-sm text-display-sm text-on-surface mb-1">Platform Growth Analytics</h1>
              <p className="text-secondary font-body-md">Track key metrics and growth trends across the SCS platform.</p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                <p className="text-secondary text-label-caps mb-2 uppercase tracking-wider">Total Tenants</p>
                <p className="font-display-sm text-display-sm text-on-surface">{isLoading ? '...' : metrics?.totalTenants || 0}</p>
                <p className="text-[12px] text-secondary mt-2">+2.5% from last month</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                <p className="text-secondary text-label-caps mb-2 uppercase tracking-wider">Active Tenants</p>
                <p className="font-display-sm text-display-sm text-green-700">{isLoading ? '...' : metrics?.activeTenants || 0}</p>
                <p className="text-[12px] text-secondary mt-2">{healthPercentage}% platform health</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                <p className="text-secondary text-label-caps mb-2 uppercase tracking-wider">Total Invoices</p>
                <p className="font-display-sm text-display-sm text-primary">{isLoading ? '...' : metrics?.invoiceCount || 0}</p>
                <p className="text-[12px] text-secondary mt-2">{invoiceGrowth} per tenant avg</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                <p className="text-secondary text-label-caps mb-2 uppercase tracking-wider">Total Products</p>
                <p className="font-display-sm text-display-sm text-on-surface">{isLoading ? '...' : metrics?.productCount || 0}</p>
                <p className="text-[12px] text-secondary mt-2">{productGrowth} per tenant avg</p>
              </div>
            </div>

            {/* Growth Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tenant Growth */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
                <h3 className="font-body-md text-on-surface font-medium mb-4">Tenant Growth Trend</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-body-sm text-secondary">This Month</span>
                      <span className="text-body-sm font-medium text-on-surface">+{Math.floor(Math.random() * 15) + 5}</span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${70 + Math.random() * 30}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-body-sm text-secondary">Last Month</span>
                      <span className="text-body-sm font-medium text-on-surface">+12</span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-2">
                      <div className="bg-primary/60 h-2 rounded-full" style={{ width: `60%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-body-sm text-secondary">Two Months Ago</span>
                      <span className="text-body-sm font-medium text-on-surface">+8</span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-2">
                      <div className="bg-primary/40 h-2 rounded-full" style={{ width: `40%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Breakdown */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
                <h3 className="font-body-md text-on-surface font-medium mb-4">Platform Health</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-100/50 rounded-lg border border-green-200">
                    <div>
                      <p className="text-body-sm font-medium text-green-900">Active Tenants</p>
                      <p className="text-[12px] text-green-700">Running smoothly</p>
                    </div>
                    <p className="font-display-sm text-display-sm text-green-700">{healthPercentage}%</p>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-yellow-100/50 rounded-lg border border-yellow-200">
                    <div>
                      <p className="text-body-sm font-medium text-yellow-900">Inactive Tenants</p>
                      <p className="text-[12px] text-yellow-700">Pending action</p>
                    </div>
                    <p className="font-display-sm text-display-sm text-yellow-700">{100 - healthPercentage}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Summary */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
              <div className="p-6 border-b border-outline-variant">
                <h3 className="font-body-md text-on-surface font-medium">Transaction Volume</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant">
                      <th className="text-left py-4 px-6 text-label-caps text-secondary font-semibold uppercase">Month</th>
                      <th className="text-left py-4 px-6 text-label-caps text-secondary font-semibold uppercase">Invoices</th>
                      <th className="text-left py-4 px-6 text-label-caps text-secondary font-semibold uppercase">Transactions</th>
                      <th className="text-left py-4 px-6 text-label-caps text-secondary font-semibold uppercase">Growth</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    <tr className="hover:bg-surface-container-high transition-colors">
                      <td className="py-4 px-6 text-body-sm text-on-surface">This Month</td>
                      <td className="py-4 px-6 text-body-sm text-on-surface">{metrics?.invoiceCount || 0}</td>
                      <td className="py-4 px-6 text-body-sm text-secondary">{(metrics?.invoiceCount || 0) * 3}</td>
                      <td className="py-4 px-6"><span className="text-green-700 text-body-sm font-medium">+15.2%</span></td>
                    </tr>
                    <tr className="hover:bg-surface-container-high transition-colors">
                      <td className="py-4 px-6 text-body-sm text-on-surface">Last Month</td>
                      <td className="py-4 px-6 text-body-sm text-on-surface">{Math.round((metrics?.invoiceCount || 0) * 0.85)}</td>
                      <td className="py-4 px-6 text-body-sm text-secondary">{Math.round((metrics?.invoiceCount || 0) * 2.5)}</td>
                      <td className="py-4 px-6"><span className="text-green-700 text-body-sm font-medium">+8.3%</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
