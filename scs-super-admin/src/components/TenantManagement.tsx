"use client";
import React from 'react';
import Link from 'next/link';

export default function TenantManagement() {
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
      
{/* SideNavBar */}
<aside className="bg-surface-container-low dark:bg-surface-container-lowest w-sidebar-width h-screen sticky top-0 left-0 border-r border-outline-variant dark:border-outline flex flex-col py-6 shrink-0 z-[60]">
<div className="px-6 mb-8 flex items-center gap-3">
<div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center overflow-hidden">
<img alt="SCS Platform Logo" className="w-full h-full object-cover" data-alt="A clean, minimalist logo icon for a SaaS platform. The icon features a geometric, abstract design using primary blue and white, set against a solid dark blue background. The aesthetic is modern, professional, and high-tech, reflecting stability and efficiency in wholesale management software." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHBEeJusLwdlxChcqpOvRmSqAzHJd7FLPtprnGC0gGzkE7zaBUxf-1pB6J04NUVMfD9W_VRMXjtP5t3uXXHOmbZ4bQbqkYZDVQBixu0VEVirTI-F-nf1bCJv-1IBijnFvPeXBJVLGLGDNGyNSuifxJQfxvYHsF8fQ-ofKrw_TWZCUrmXNH8bq9yHPgJCL0aB4ncDJtu1WQg27dGgXF-6Mj04VnKk4LEiUHkxV-6EY5im8BcdUqY8oDG1Grv_IkqFDVVuMiOIz8v2o"/>
</div>
<div>
<h1 className="font-h1 text-h1 text-primary dark:text-primary-fixed-dim leading-none">SCS Admin</h1>
<p className="font-body-sm text-body-sm text-secondary opacity-70">Super Admin Panel</p>
</div>
</div>
<nav className="flex-1 px-3 space-y-1">
<Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-body-md text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high transition-colors duration-150 ease-in-out active:scale-[0.98]" href="/">
<span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span>Dashboard</span>
</Link>
{/* Active State */}
<Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-body-md bg-secondary-container dark:bg-on-primary-fixed-variant text-on-secondary-container dark:text-on-primary-container border-l-4 border-primary active:scale-[0.98] transition-transform duration-150" href="/tenants">
<span className="material-symbols-outlined" data-icon="storefront" style={{fontVariationSettings: "FILL 1"}}>storefront</span>
<span>Tenants / Shops</span>
</Link>
<Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-body-md text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high transition-colors duration-150 ease-in-out active:scale-[0.98]" href="/onboard">
<span className="material-symbols-outlined" data-icon="add_business">add_business</span>
<span>Create Shop</span>
</Link>
<Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-body-md text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high transition-colors duration-150 ease-in-out active:scale-[0.98]" href="/users">
<span className="material-symbols-outlined" data-icon="group">group</span>
<span>Active Users</span>
</Link>
<Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-body-md text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high transition-colors duration-150 ease-in-out active:scale-[0.98]" href="/reports">
<span className="material-symbols-outlined" data-icon="analytics">analytics</span>
<span>SaaS Reports</span>
</Link>
<Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-body-md text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high transition-colors duration-150 ease-in-out active:scale-[0.98]" href="/settings">
<span className="material-symbols-outlined" data-icon="settings">settings</span>
<span>System Settings</span>
</Link>
</nav>
<div className="px-3 mt-auto pt-6 border-t border-outline-variant">
<Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-body-md text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high transition-colors duration-150 ease-in-out active:scale-[0.98]" href="/">
<span className="material-symbols-outlined" data-icon="logout">logout</span>
<span>Logout</span>
</Link>
</div>
</aside>
<div className="flex-1 flex flex-col min-w-0">
{/* TopAppBar */}
<header className="h-header-height w-full sticky top-0 z-50 bg-surface-container-lowest dark:bg-surface-dim border-b border-outline-variant dark:border-outline shadow-sm dark:shadow-none flex items-center justify-between px-container-padding shrink-0">
<div className="flex items-center gap-4 flex-1">
<div className="relative w-full max-w-md">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" data-icon="search">search</span>
<input className="w-full pl-10 pr-4 py-2 bg-surface-container rounded-full border-none focus:ring-2 focus:ring-primary font-body-md text-on-surface" placeholder="Search tenants, owners or GST..." type="text"/>
<div className="absolute right-3 top-1/2 -translate-y-1/2 text-label-caps font-label-caps text-outline bg-surface-variant px-1.5 py-0.5 rounded border border-outline-variant">⌘K</div>
</div>
</div>
<div className="flex items-center gap-6">
<div className="flex items-center gap-4">
<button className="material-symbols-outlined text-secondary hover:text-primary transition-colors focus:ring-2 focus:ring-primary rounded-full p-1" data-icon="notifications">notifications</button>
<button className="material-symbols-outlined text-secondary hover:text-primary transition-colors focus:ring-2 focus:ring-primary rounded-full p-1" data-icon="account_tree">account_tree</button>
</div>
<div className="h-8 w-[1px] bg-outline-variant"></div>
<div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
<div className="text-right hidden sm:block">
<p className="font-label-caps text-label-caps text-on-surface font-bold uppercase">SCS Admin</p>
<p className="text-[10px] text-secondary">alex.rivera@scs.com</p>
</div>
<img alt="SCS Admin Profile" className="w-9 h-9 rounded-full border border-outline-variant object-cover" data-alt="Professional portrait of a male executive in his late 30s with a confident and friendly expression. He is wearing a sharp, tailored navy blue suit and a clean white shirt. The background is a blurred high-end office interior with soft architectural lighting, echoing a professional corporate environment. The image is crisp, with natural skin tones and a clean, high-fidelity finish." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzLp2kbyWJQpa4kakCPPf9W3o3NAq9Y2KSKWsa-6ymrrj8BVbeIKkKVJKLCzoYZRdEmjvhXqj6RycizTw9_PNgjYNKVBo1MmcMWX-26fkCBrxibsKfEbMQxWhvCzsDgBADK74nGxFVo4dkIDwLJP4t4ARFhS980xnbw4ez7awSXAJmm88rIa22t9tSOx6oNJ5vBaT95hPamaqs84jXplTO-Rv0l6nInuUHWTVb8XNt0kSTxmu2qz20GLb8qhvZ4_kZ7lcOoSR9h9M"/>
</div>
</div>
</header>
{/* Main Content */}
<main className="flex-1 overflow-y-auto p-container-padding bg-background">
<div className="max-w-[1400px] mx-auto space-y-6">
{/* Page Header & Actions */}
<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
<div>
<h2 className="font-display-sm text-display-sm text-on-surface">Tenants / Shops</h2>
<p className="font-body-md text-body-md text-secondary">Manage your active wholesale business partners and retail outlets.</p>
</div>
<div className="flex items-center gap-3">
<div className="relative inline-block text-left">
<button className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface hover:bg-surface-container-low transition-colors duration-150">
<span className="material-symbols-outlined text-[20px]" data-icon="filter_list">filter_list</span>
<span>Status: All</span>
<span className="material-symbols-outlined text-[18px]" data-icon="expand_more">expand_more</span>
</button>
</div>
<button className="flex items-center gap-2 px-5 py-2 bg-primary text-on-primary rounded-lg font-body-md font-semibold hover:bg-primary-container transition-all active:scale-95 shadow-sm">
<span className="material-symbols-outlined text-[20px]" data-icon="add">add</span>
<span>Create Shop</span>
</button>
</div>
</div>
{/* Table Container */}
<div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low border-b border-outline-variant">
<th className="px-6 py-4 font-label-caps text-label-caps text-outline uppercase tracking-wider">Business Name</th>
<th className="px-6 py-4 font-label-caps text-label-caps text-outline uppercase tracking-wider">Owner / Email</th>
<th className="px-6 py-4 font-label-caps text-label-caps text-outline uppercase tracking-wider">GST Number</th>
<th className="px-6 py-4 font-label-caps text-label-caps text-outline uppercase tracking-wider text-center">Status</th>
<th className="px-6 py-4 font-label-caps text-label-caps text-outline uppercase tracking-wider">Created Date</th>
<th className="px-6 py-4 font-label-caps text-label-caps text-outline uppercase tracking-wider">Last Login</th>
<th className="px-6 py-4 font-label-caps text-label-caps text-outline uppercase tracking-wider text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant">
{/* Row 1 */}
<tr className="hover:bg-surface-bright transition-colors group">
<td className="px-6 py-table-row-height">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-primary-fixed flex items-center justify-center text-primary font-bold text-xs">MW</div>
<span className="font-semibold text-on-surface">Metro Wholesale</span>
</div>
</td>
<td className="px-6 py-table-row-height">
<div className="flex flex-col">
<span className="text-on-surface">Alex Rivera</span>
<span className="text-body-sm text-secondary">alex.r@metrowholesale.com</span>
</div>
</td>
<td className="px-6 py-table-row-height">
<span className="font-mono-data text-mono-data bg-surface-container-high px-2 py-0.5 rounded text-on-surface-variant">27AADCM3948N1Z5</span>
</td>
<td className="px-6 py-table-row-height text-center">
<span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-bold uppercase tracking-tight bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                            Active
                                        </span>
</td>
<td className="px-6 py-table-row-height">
<span className="text-on-surface-variant">Oct 12, 2023</span>
</td>
<td className="px-6 py-table-row-height text-on-surface-variant">
<div className="flex flex-col">
<span>2h ago</span>
<span className="text-[10px] text-outline">10.0.0.42</span>
</div>
</td>
<td className="px-6 py-table-row-height text-right">
<div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button className="p-2 text-secondary hover:text-primary transition-colors" title="View"><span className="material-symbols-outlined text-[20px]" data-icon="visibility">visibility</span></button>
<button className="p-2 text-secondary hover:text-primary transition-colors" title="Edit"><span className="material-symbols-outlined text-[20px]" data-icon="edit">edit</span></button>
<button className="p-2 text-secondary hover:text-error transition-colors" title="More"><span className="material-symbols-outlined text-[20px]" data-icon="more_vert">more_vert</span></button>
</div>
</td>
</tr>
{/* Row 2 */}
<tr className="hover:bg-surface-bright transition-colors group">
<td className="px-6 py-table-row-height">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-tertiary-fixed flex items-center justify-center text-tertiary font-bold text-xs">SL</div>
<span className="font-semibold text-on-surface">Skyline Logistics</span>
</div>
</td>
<td className="px-6 py-table-row-height">
<div className="flex flex-col">
<span className="text-on-surface">Sarah Chen</span>
<span className="text-body-sm text-secondary">schen@skyline.io</span>
</div>
</td>
<td className="px-6 py-table-row-height">
<span className="font-mono-data text-mono-data bg-surface-container-high px-2 py-0.5 rounded text-on-surface-variant">07AABCS1022L1Z9</span>
</td>
<td className="px-6 py-table-row-height text-center">
<span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-bold uppercase tracking-tight bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                            Active
                                        </span>
</td>
<td className="px-6 py-table-row-height">
<span className="text-on-surface-variant">Nov 04, 2023</span>
</td>
<td className="px-6 py-table-row-height text-on-surface-variant">
<div className="flex flex-col">
<span>5m ago</span>
<span className="text-[10px] text-outline">192.168.1.1</span>
</div>
</td>
<td className="px-6 py-table-row-height text-right">
<div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button className="p-2 text-secondary hover:text-primary transition-colors" title="View"><span className="material-symbols-outlined text-[20px]" data-icon="visibility">visibility</span></button>
<button className="p-2 text-secondary hover:text-primary transition-colors" title="Edit"><span className="material-symbols-outlined text-[20px]" data-icon="edit">edit</span></button>
<button className="p-2 text-secondary hover:text-error transition-colors" title="More"><span className="material-symbols-outlined text-[20px]" data-icon="more_vert">more_vert</span></button>
</div>
</td>
</tr>
{/* Row 3 */}
<tr className="hover:bg-surface-bright transition-colors group">
<td className="px-6 py-table-row-height">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-secondary-fixed flex items-center justify-center text-secondary font-bold text-xs">PR</div>
<span className="font-semibold text-on-surface">Pinnacle Retail</span>
</div>
</td>
<td className="px-6 py-table-row-height">
<div className="flex flex-col">
<span className="text-on-surface">Mark Thompson</span>
<span className="text-body-sm text-secondary">m.thompson@pinnacle.com</span>
</div>
</td>
<td className="px-6 py-table-row-height">
<span className="font-mono-data text-mono-data bg-surface-container-high px-2 py-0.5 rounded text-on-surface-variant">29AAACP9981M1Z2</span>
</td>
<td className="px-6 py-table-row-height text-center">
<span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-bold uppercase tracking-tight bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                            Inactive
                                        </span>
</td>
<td className="px-6 py-table-row-height">
<span className="text-on-surface-variant">Aug 18, 2023</span>
</td>
<td className="px-6 py-table-row-height text-on-surface-variant">
<div className="flex flex-col">
<span>14 days ago</span>
<span className="text-[10px] text-outline">172.16.254.1</span>
</div>
</td>
<td className="px-6 py-table-row-height text-right">
<div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button className="p-2 text-secondary hover:text-primary transition-colors" title="View"><span className="material-symbols-outlined text-[20px]" data-icon="visibility">visibility</span></button>
<button className="p-2 text-secondary hover:text-primary transition-colors" title="Edit"><span className="material-symbols-outlined text-[20px]" data-icon="edit">edit</span></button>
<button className="p-2 text-secondary hover:text-error transition-colors" title="More"><span className="material-symbols-outlined text-[20px]" data-icon="more_vert">more_vert</span></button>
</div>
</td>
</tr>
{/* Row 4 */}
<tr className="hover:bg-surface-bright transition-colors group">
<td className="px-6 py-table-row-height">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-error-container flex items-center justify-center text-error font-bold text-xs">GF</div>
<span className="font-semibold text-on-surface">Global Freight</span>
</div>
</td>
<td className="px-6 py-table-row-height">
<div className="flex flex-col">
<span className="text-on-surface">Elena Rodriguez</span>
<span className="text-body-sm text-secondary">elena.ro@globalfreight.net</span>
</div>
</td>
<td className="px-6 py-table-row-height">
<span className="font-mono-data text-mono-data bg-surface-container-high px-2 py-0.5 rounded text-on-surface-variant">33AAABG4421A1Z0</span>
</td>
<td className="px-6 py-table-row-height text-center">
<span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-bold uppercase tracking-tight bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                            Active
                                        </span>
</td>
<td className="px-6 py-table-row-height">
<span className="text-on-surface-variant">Dec 01, 2023</span>
</td>
<td className="px-6 py-table-row-height text-on-surface-variant">
<div className="flex flex-col">
<span>Just now</span>
<span className="text-[10px] text-outline">10.12.3.89</span>
</div>
</td>
<td className="px-6 py-table-row-height text-right">
<div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button className="p-2 text-secondary hover:text-primary transition-colors" title="View"><span className="material-symbols-outlined text-[20px]" data-icon="visibility">visibility</span></button>
<button className="p-2 text-secondary hover:text-primary transition-colors" title="Edit"><span className="material-symbols-outlined text-[20px]" data-icon="edit">edit</span></button>
<button className="p-2 text-secondary hover:text-error transition-colors" title="More"><span className="material-symbols-outlined text-[20px]" data-icon="more_vert">more_vert</span></button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
{/* Pagination */}
<div className="px-6 py-4 border-t border-outline-variant bg-surface-container-low flex items-center justify-between">
<span className="text-body-sm text-secondary">Showing <span className="font-semibold text-on-surface">1 - 10</span> of <span className="font-semibold text-on-surface">42</span> tenants</span>
<div className="flex items-center gap-2">
<button className="p-2 rounded-lg border border-outline-variant text-secondary opacity-50 cursor-not-allowed hover:bg-surface-container-high transition-colors">
<span className="material-symbols-outlined text-[20px]" data-icon="chevron_left">chevron_left</span>
</button>
<div className="flex items-center gap-1">
<button className="w-8 h-8 rounded-lg bg-primary text-on-primary font-bold text-[13px]">1</button>
<button className="w-8 h-8 rounded-lg hover:bg-surface-container-high text-on-surface text-[13px] transition-colors">2</button>
<button className="w-8 h-8 rounded-lg hover:bg-surface-container-high text-on-surface text-[13px] transition-colors">3</button>
<span className="px-1 text-outline">...</span>
<button className="w-8 h-8 rounded-lg hover:bg-surface-container-high text-on-surface text-[13px] transition-colors">5</button>
</div>
<button className="p-2 rounded-lg border border-outline-variant text-secondary hover:bg-surface-container-high transition-colors">
<span className="material-symbols-outlined text-[20px]" data-icon="chevron_right">chevron_right</span>
</button>
</div>
</div>
</div>
{/* Summary Bento Grid Section (High-end UI detail) */}
<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
<div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between mb-4">
<span className="material-symbols-outlined p-2 bg-primary/10 text-primary rounded-lg" data-icon="trending_up">trending_up</span>
<span className="text-[12px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">+12.5%</span>
</div>
<div>
<p className="text-label-caps font-label-caps text-outline uppercase">Total Shops</p>
<h3 className="font-display-sm text-display-sm text-on-surface">42</h3>
</div>
</div>
<div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between mb-4">
<span className="material-symbols-outlined p-2 bg-green-500/10 text-green-600 rounded-lg" data-icon="verified_user">verified_user</span>
</div>
<div>
<p className="text-label-caps font-label-caps text-outline uppercase">Active Now</p>
<h3 className="font-display-sm text-display-sm text-on-surface">38</h3>
</div>
</div>
<div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between mb-4">
<span className="material-symbols-outlined p-2 bg-red-500/10 text-red-600 rounded-lg" data-icon="warning">warning</span>
</div>
<div>
<p className="text-label-caps font-label-caps text-outline uppercase">Payment Pending</p>
<h3 className="font-display-sm text-display-sm text-on-surface">4</h3>
</div>
</div>
<div className="bg-primary text-on-primary p-5 rounded-xl border border-primary shadow-lg flex flex-col justify-between relative overflow-hidden group">
<div className="absolute -right-4 -bottom-4 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
<span className="material-symbols-outlined text-[120px]" data-icon="inventory_2">inventory_2</span>
</div>
<p className="text-label-caps font-label-caps text-on-primary-container opacity-80 uppercase">Quick Report</p>
<h3 className="font-display-sm text-display-sm">Download Tenant Logs</h3>
<div className="mt-4 flex items-center gap-2 text-sm font-semibold">
<span>Export CSV</span>
<span className="material-symbols-outlined text-[18px]" data-icon="download">download</span>
</div>
</div>
</div>
</div>
</main>
</div>
{/* Micro-interaction Scripts */}

    </div>
  );
}
