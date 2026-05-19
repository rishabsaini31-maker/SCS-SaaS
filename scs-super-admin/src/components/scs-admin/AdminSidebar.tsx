"use client"
import Link from 'next/link'
import React from 'react'

export default function AdminSidebar() {
  return (
    <aside className="bg-surface-container-low dark:bg-surface-container-lowest w-sidebar-width h-screen sticky top-0 left-0 border-r border-outline-variant dark:border-outline flex flex-col h-full py-6 shrink-0 z-40">
      <div className="px-6 mb-8">
        <h1 className="font-h1 text-h1 text-primary dark:text-primary-fixed-dim">SCS Admin</h1>
        <p className="text-secondary text-[11px] font-medium tracking-wider">Super Admin Panel</p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary-container dark:bg-on-primary-fixed-variant text-on-secondary-container dark:text-on-primary-container border-l-4 border-primary transition-colors duration-150 active:scale-[0.98]">
          <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
          <span className="font-body-md">Dashboard</span>
        </Link>
        <Link href="/shops" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-colors duration-150">
          <span className="material-symbols-outlined" data-icon="storefront">storefront</span>
          <span className="font-body-md">Tenants / Shops</span>
        </Link>
        <Link href="/create-shop" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-colors duration-150">
          <span className="material-symbols-outlined" data-icon="add_business">add_business</span>
          <span className="font-body-md">Create Shop</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-colors duration-150">
          <span className="material-symbols-outlined" data-icon="group">group</span>
          <span className="font-body-md">Active Users</span>
        </Link>
        <Link href="/reports" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-colors duration-150">
          <span className="material-symbols-outlined" data-icon="analytics">analytics</span>
          <span className="font-body-md">SaaS Reports</span>
        </Link>
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-colors duration-150">
          <span className="material-symbols-outlined" data-icon="settings">settings</span>
          <span className="font-body-md">System Settings</span>
        </Link>
      </nav>
      <div className="px-3 mt-auto border-t border-outline-variant pt-4">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-error hover:bg-error-container/20 transition-colors duration-150">
          <span className="material-symbols-outlined" data-icon="logout">logout</span>
          <span className="font-body-md">Logout</span>
        </button>
      </div>
    </aside>
  )
}
