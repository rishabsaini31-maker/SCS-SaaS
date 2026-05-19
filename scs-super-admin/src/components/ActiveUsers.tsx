"use client";
import React from 'react';
import Link from 'next/link';

export default function ActiveUsers() {
  return (
    <div className="bg-background font-body-md text-on-background flex min-h-screen">
      {/* SVG Gradient Definitions */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="line-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#004ac6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#004ac6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      
<div className="flex min-h-screen">
{/* SideNavBar Component */}
<aside className="bg-surface-container-low dark:bg-surface-container-lowest w-sidebar-width h-screen sticky top-0 left-0 border-r border-outline-variant dark:border-outline flex flex-col h-full py-6">
<div className="px-6 mb-8">
<div className="flex items-center gap-3">
<img alt="SCS Platform Logo" className="w-8 h-8 rounded-lg" data-alt="A sophisticated and abstract logo for a high-performance software platform. The design features sharp, geometric lines in deep blue and metallic silver, set against a clean, minimalist white background. The overall aesthetic is professional, modern, and utilitarian, suggesting stability and technical precision." src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6gPkKeE3DU4y3BjSWJPApDVnKbdJc0UIUeLt2ZPhLSnUAlb1MrBFzPrRy_2rb9KVwCRF-L2FlB2KUd0T1AvtsgcVwJP6biV77dmTknBuP9JjdYEukRimJG3ooZjDMQzs8s4WTnXPUnTvW1wjPrxq1W4tBe_dOhKstqN4UK8txOc96MEC-qh0YuB66_vS-09-XNLAppROLsofoe9LOVpSNEGZtufdkOPFMIDjg2JFhzSr5P5EJMWClRoF_QU037-dGhOsuxJbuL50"/>
<span className="font-h1 text-h1 text-primary dark:text-primary-fixed-dim">SCS Admin</span>
</div>
<p className="text-[10px] uppercase tracking-widest text-outline mt-1 px-1">Super Admin Panel</p>
</div>
<nav className="flex-1 px-3 space-y-1">
{/* Dashboard */}
<Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-colors duration-150 ease-in-out font-body-md text-body-md" href="/">
<span className="material-symbols-outlined text-[20px]" data-icon="dashboard">dashboard</span>
<span>Dashboard</span>
</Link>
{/* Tenants / Shops */}
<Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-colors duration-150 ease-in-out font-body-md text-body-md" href="/tenants">
<span className="material-symbols-outlined text-[20px]" data-icon="storefront">storefront</span>
<span>Tenants / Shops</span>
</Link>
{/* Create Shop */}
<Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-colors duration-150 ease-in-out font-body-md text-body-md" href="/onboard">
<span className="material-symbols-outlined text-[20px]" data-icon="add_business">add_business</span>
<span>Create Shop</span>
</Link>
{/* Active Users (ACTIVE) */}
<Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary-container dark:bg-on-primary-fixed-variant text-on-secondary-container dark:text-on-primary-container border-l-4 border-primary active:scale-[0.98] transition-all duration-150 font-body-md text-body-md" href="/users">
<span className="material-symbols-outlined text-[20px]" data-icon="group" style={{fontVariationSettings: "FILL 1"}}>group</span>
<span className="font-bold">Active Users</span>
</Link>
{/* SaaS Reports */}
<Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-colors duration-150 ease-in-out font-body-md text-body-md" href="/reports">
<span className="material-symbols-outlined text-[20px]" data-icon="analytics">analytics</span>
<span>SaaS Reports</span>
</Link>
{/* System Settings */}
<Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-colors duration-150 ease-in-out font-body-md text-body-md" href="/settings">
<span className="material-symbols-outlined text-[20px]" data-icon="settings">settings</span>
<span>System Settings</span>
</Link>
</nav>
<div className="px-3 pt-6 border-t border-outline-variant">
<Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:bg-error-container hover:text-on-error-container transition-colors duration-150 ease-in-out font-body-md text-body-md" href="/">
<span className="material-symbols-outlined text-[20px]" data-icon="logout">logout</span>
<span>Logout</span>
</Link>
</div>
</aside>
{/* Main Content Canvas */}
<main className="flex-1 flex flex-col min-w-0 bg-surface-bright">
{/* TopAppBar Component */}
<header className="h-header-height w-full sticky top-0 z-50 bg-surface-container-lowest dark:bg-surface-dim border-b border-outline-variant dark:border-outline shadow-sm dark:shadow-none flex items-center justify-between px-container-padding">
<div className="flex items-center flex-1 max-w-2xl">
<div className="relative w-full max-w-md group">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" data-icon="search">search</span>
<input className="w-full bg-surface-container-low border-none rounded-lg pl-10 pr-4 py-2 font-body-sm text-body-sm focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all outline-none" placeholder="Search sessions, IPs, or tenants (Cmd+K)" type="text"/>
</div>
</div>
<div className="flex items-center gap-4">
<button className="relative p-2 text-secondary hover:text-primary transition-colors focus:ring-2 focus:ring-primary rounded-full">
<span className="material-symbols-outlined" data-icon="notifications">notifications</span>
<span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
</button>
<button className="p-2 text-secondary hover:text-primary transition-colors focus:ring-2 focus:ring-primary rounded-full">
<span className="material-symbols-outlined" data-icon="account_tree">account_tree</span>
</button>
<div className="h-8 w-[1px] bg-outline-variant mx-2"></div>
<div className="flex items-center gap-3 pl-2">
<div className="text-right hidden sm:block">
<p className="font-label-caps text-label-caps text-on-surface">Admin Session</p>
<p className="text-[10px] text-outline font-mono-data">IP: 192.168.1.1</p>
</div>
<img alt="SCS Admin Profile" className="w-10 h-10 rounded-full border-2 border-surface-container-highest" data-alt="A professional headshot of a senior system administrator in a high-tech environment. The individual is wearing a modern, charcoal gray polo shirt. The background is a soft-focus data center with subtle blue and white LED indicators, creating a sense of expertise, authority, and technological sophistication in a light-mode workspace." src="https://lh3.googleusercontent.com/aida-public/AB6AXuATjknw6NHcjFMQ5mUvgub8xKaohB9S_26PQeIEYat9OfOoroxUpn7WvPFKS_cDGN1KHEAac--gexsxCM-BEu2MLwbgx6vjYz0A-w8S9pxaoe9cjzlREs5uALVjyd7tWJcMWkXfRg_xwHeFGMXKHgNjNNvMS6E1TD5Rc7e6gsqHDlRCeY8gqCPHTaK9Xmpe0tf2IdU3siGMmUus8uMXyXx4ZowMtUqaLGxgzNdIsfwVkWRnjg7gzfpfZvUr4JbgyAyoJzrG6kwlO8o"/>
</div>
</div>
</header>
<div className="p-container-padding flex-1 overflow-auto">
{/* Page Header & Stats */}
<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
<div>
<h1 className="font-display-sm text-display-sm text-on-surface flex items-center gap-3">
                            Active User Sessions
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-fixed text-on-primary-fixed">
                                428 Live
                            </span>
</h1>
<p className="text-secondary mt-1 font-body-md">Real-time monitoring of all authenticated access points across the platform.</p>
</div>
<div className="flex gap-3">
<button className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-secondary hover:bg-surface-container-high transition-all font-body-sm">
<span className="material-symbols-outlined text-[18px]" data-icon="filter_list">filter_list</span>
                            Filter
                        </button>
<button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-all font-body-sm shadow-md active:scale-95">
<span className="material-symbols-outlined text-[18px]" data-icon="refresh">refresh</span>
                            Live Refresh
                        </button>
</div>
</div>
{/* Stats Grid */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
<div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
<p className="text-outline font-label-caps text-label-caps mb-1">Total Requests/min</p>
<p className="font-display-sm text-display-sm text-on-surface">1.2k</p>
<div className="mt-2 flex items-center text-xs text-tertiary">
<span className="material-symbols-outlined text-[14px] mr-1" data-icon="trending_up">trending_up</span>
                            8% from last hour
                        </div>
</div>
<div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
<p className="text-outline font-label-caps text-label-caps mb-1">Unique IP Addresses</p>
<p className="font-display-sm text-display-sm text-on-surface">312</p>
<div className="mt-2 flex items-center text-xs text-outline">
<span className="material-symbols-outlined text-[14px] mr-1" data-icon="public">public</span>
                            Global Distribution
                        </div>
</div>
<div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
<p className="text-outline font-label-caps text-label-caps mb-1">Mobile Users</p>
<p className="font-display-sm text-display-sm text-on-surface">142</p>
<div className="mt-2 flex items-center text-xs text-secondary">
<span className="material-symbols-outlined text-[14px] mr-1" data-icon="smartphone">smartphone</span>
                            33% of total traffic
                        </div>
</div>
<div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm border-l-4 border-error">
<p className="text-outline font-label-caps text-label-caps mb-1">High Risk Logins</p>
<p className="font-display-sm text-display-sm text-error">3</p>
<div className="mt-2 flex items-center text-xs text-error">
<span className="material-symbols-outlined text-[14px] mr-1" data-icon="warning">warning</span>
                            Action Required
                        </div>
</div>
</div>
{/* Main Monitoring Table */}
<div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low border-b border-outline-variant">
<th className="px-6 py-4 font-label-caps text-label-caps text-secondary">Tenant / User</th>
<th className="px-6 py-4 font-label-caps text-label-caps text-secondary">Activity Status</th>
<th className="px-6 py-4 font-label-caps text-label-caps text-secondary">Session / Device</th>
<th className="px-6 py-4 font-label-caps text-label-caps text-secondary">IP Address</th>
<th className="px-6 py-4 font-label-caps text-label-caps text-secondary text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant">
{/* Row 1 */}
<tr className="session-row hover:bg-surface-container-low transition-colors h-table-row-height">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold text-xs">NL</div>
<div>
<p className="font-body-md text-on-surface font-semibold">Nordic Logistics</p>
<p className="font-body-sm text-outline">oscar.l@nordic.com</p>
</div>
</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2">
<span className="w-2 h-2 bg-tertiary rounded-full animate-pulse"></span>
<span className="text-on-surface font-body-sm">Active Now</span>
<span className="text-[10px] text-outline ml-2 font-mono-data">Updating orders...</span>
</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2 text-secondary">
<span className="material-symbols-outlined text-[18px]" data-icon="laptop_mac">laptop_mac</span>
<span className="font-body-sm">Chrome / MacOS Sonoma</span>
</div>
</td>
<td className="px-6 py-4 font-mono-data text-outline">185.22.102.44</td>
<td className="px-6 py-4 text-right">
<button className="force-logout-btn opacity-0 px-3 py-1 bg-on-error-container text-on-error bg-error/90 rounded text-xs font-semibold hover:bg-error transition-all">Force Logout</button>
</td>
</tr>
{/* Row 2 */}
<tr className="session-row hover:bg-surface-container-low transition-colors h-table-row-height bg-surface-bright/30">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed font-bold text-xs">GH</div>
<div>
<p className="font-body-md text-on-surface font-semibold">Global Harvest</p>
<p className="font-body-sm text-outline">admin@harvest.io</p>
</div>
</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2 text-outline">
<span className="w-2 h-2 bg-outline rounded-full"></span>
<span className="font-body-sm">Idle 12m</span>
</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2 text-secondary">
<span className="material-symbols-outlined text-[18px]" data-icon="smartphone">smartphone</span>
<span className="font-body-sm">SCS Android App (v2.4)</span>
</div>
</td>
<td className="px-6 py-4 font-mono-data text-outline">92.118.3.15</td>
<td className="px-6 py-4 text-right">
<button className="force-logout-btn opacity-0 px-3 py-1 bg-error/90 text-on-error rounded text-xs font-semibold hover:bg-error transition-all">Force Logout</button>
</td>
</tr>
{/* Row 3 - Warning State */}
<tr className="session-row hover:bg-error-container/20 transition-colors h-table-row-height bg-error-container/5">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-error-container flex items-center justify-center text-on-error-container font-bold text-xs">TS</div>
<div>
<p className="font-body-md text-on-surface font-semibold">Titan Supply</p>
<p className="font-body-sm text-error">unknown@titan.co</p>
</div>
</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2 text-error font-semibold">
<span className="material-symbols-outlined text-[18px]" data-icon="gpp_maybe">gpp_maybe</span>
<span className="font-body-sm">New Location Login</span>
</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2 text-secondary">
<span className="material-symbols-outlined text-[18px]" data-icon="terminal">terminal</span>
<span className="font-body-sm">Unknown / CLI tool</span>
</div>
</td>
<td className="px-6 py-4 font-mono-data text-error font-bold">203.0.113.88</td>
<td className="px-6 py-4 text-right">
<button className="px-3 py-1 bg-error text-on-error rounded text-xs font-semibold hover:scale-105 active:scale-95 shadow-sm transition-all">Force Logout</button>
</td>
</tr>
{/* Row 4 */}
<tr className="session-row hover:bg-surface-container-low transition-colors h-table-row-height">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed font-bold text-xs">BP</div>
<div>
<p className="font-body-md text-on-surface font-semibold">Blue Prime</p>
<p className="font-body-sm text-outline">sarah.k@blueprime.com</p>
</div>
</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2">
<span className="w-2 h-2 bg-tertiary rounded-full"></span>
<span className="text-on-surface font-body-sm">Active Now</span>
</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2 text-secondary">
<span className="material-symbols-outlined text-[18px]" data-icon="laptop_windows">laptop_windows</span>
<span className="font-body-sm">Firefox / Windows 11</span>
</div>
</td>
<td className="px-6 py-4 font-mono-data text-outline">74.125.19.106</td>
<td className="px-6 py-4 text-right">
<button className="force-logout-btn opacity-0 px-3 py-1 bg-error/90 text-on-error rounded text-xs font-semibold hover:bg-error transition-all">Force Logout</button>
</td>
</tr>
{/* Row 5 */}
<tr className="session-row hover:bg-surface-container-low transition-colors h-table-row-height bg-surface-bright/30">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-primary-fixed-dim flex items-center justify-center text-on-primary-fixed-variant font-bold text-xs">EK</div>
<div>
<p className="font-body-md text-on-surface font-semibold">Emerald Knitwear</p>
<p className="font-body-sm text-outline">m.green@emerald.ie</p>
</div>
</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2 text-outline">
<span className="w-2 h-2 bg-outline rounded-full"></span>
<span className="font-body-sm">Idle 2h</span>
</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2 text-secondary">
<span className="material-symbols-outlined text-[18px]" data-icon="tablet_mac">tablet_mac</span>
<span className="font-body-sm">Safari / iPad Pro</span>
</div>
</td>
<td className="px-6 py-4 font-mono-data text-outline">109.155.22.9</td>
<td className="px-6 py-4 text-right">
<button className="force-logout-btn opacity-0 px-3 py-1 bg-error/90 text-on-error rounded text-xs font-semibold hover:bg-error transition-all">Force Logout</button>
</td>
</tr>
</tbody>
</table>
</div>
<div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex items-center justify-between">
<p className="text-outline font-body-sm">Showing 5 of 428 active sessions</p>
<div className="flex gap-2">
<button className="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container-lowest transition-colors font-body-sm text-secondary">Previous</button>
<button className="px-3 py-1 bg-primary text-on-primary rounded hover:opacity-90 transition-all font-body-sm">Next</button>
</div>
</div>
</div>
{/* Footer Context */}
<div className="mt-8 p-6 bg-surface-container-high/30 rounded-xl border border-dashed border-outline-variant">
<div className="flex items-start gap-4">
<span className="material-symbols-outlined text-primary" data-icon="info">info</span>
<div>
<p className="font-body-md font-bold text-on-surface">Security Policy Information</p>
<p className="font-body-sm text-secondary mt-1 max-w-3xl">
                                System administrators have the authority to terminate any session immediately. A 'Force Logout' will invalidate the user's JWT and redirect them to the login screen on their next request. All administrative session terminations are logged for auditing purposes.
                            </p>
</div>
</div>
</div>
</div>
</main>
</div>
{/* Micro-interaction: CMD+K Shortcut Simulation */}

    </div>
  );
}
