"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useCreateTenant, useLogout } from "@/lib/hooks";
import { useRouter } from "next/navigation";

export default function OnboardShop() {
  const router = useRouter();
  const createTenant = useCreateTenant();
  const logout = useLogout();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    password: "",
    phone: "",
    gstNumber: "",
    address: "",
  });
  const [error, setError] = useState("");

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.push("/");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !formData.businessName ||
      !formData.ownerName ||
      !formData.email ||
      !formData.password
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      await createTenant.mutateAsync(formData);
      router.push("/tenants");
    } catch (err: any) {
      setError(err.message || "Failed to create tenant");
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
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary-container text-on-secondary-container border-l-4 border-primary transition-colors"
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
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary hover:bg-surface-container-high transition-colors"
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
            Create New Shop
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
        <div className="p-8 overflow-y-auto flex-1 flex items-center justify-center">
          <div className="w-full max-w-2xl">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-8">
              <div className="mb-8">
                <h1 className="font-display-sm text-display-sm text-on-surface mb-2">
                  Onboard New Shop
                </h1>
                <p className="text-secondary font-body-md">
                  Fill in the details below to create and register a new tenant
                  shop.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-error-container text-error rounded-lg text-body-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Business Name */}
                  <div className="md:col-span-2">
                    <label className="block text-body-sm text-on-surface mb-2 font-medium">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline rounded-lg text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., ABC Wholesale Pvt Ltd"
                      required
                    />
                  </div>

                  {/* Owner Name */}
                  <div>
                    <label className="block text-body-sm text-on-surface mb-2 font-medium">
                      Owner Name *
                    </label>
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline rounded-lg text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., John Doe"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-body-sm text-on-surface mb-2 font-medium">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline rounded-lg text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., owner@business.com"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-body-sm text-on-surface mb-2 font-medium">
                      Initial Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pr-20 bg-surface-container-low border border-outline rounded-lg text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter a secure password"
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-primary hover:text-primary/80"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-body-sm text-on-surface mb-2 font-medium">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline rounded-lg text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., +91 98765 43210"
                    />
                  </div>

                  {/* GST Number */}
                  <div>
                    <label className="block text-body-sm text-on-surface mb-2 font-medium">
                      GST Number
                    </label>
                    <input
                      type="text"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline rounded-lg text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., 27AABCT1234H1Z0"
                    />
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-body-sm text-on-surface mb-2 font-medium">
                      Business Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline rounded-lg text-body-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      placeholder="Enter the business address..."
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-6 border-t border-outline-variant">
                  <button
                    type="submit"
                    disabled={createTenant.isPending}
                    className="flex-1 px-6 py-3 bg-primary text-on-primary rounded-lg text-body-md font-medium hover:bg-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createTenant.isPending
                      ? "Creating Shop..."
                      : "Create Shop"}
                  </button>
                  <Link
                    href="/tenants"
                    className="flex-1 px-6 py-3 bg-surface-container-high text-on-surface rounded-lg text-body-md font-medium hover:bg-surface-container-highest transition-colors text-center"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
