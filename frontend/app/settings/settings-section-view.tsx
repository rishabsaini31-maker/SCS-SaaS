"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSettings } from "@/hooks/useSettings";
import { toast } from "@/lib/toast";

export type SettingsSectionKey =
  | "business-profile"
  | "billing-gst"
  | "users-roles"
  | "inventory"
  | "notifications"
  | "integrations";

const sectionLabels: Record<SettingsSectionKey, string> = {
  "business-profile": "Business Profile",
  "billing-gst": "Billing & GST",
  "users-roles": "Users & Roles",
  inventory: "Inventory",
  notifications: "Notifications",
  integrations: "Integrations",
};

const sectionLinks: Array<{ key: SettingsSectionKey; href: string }> = [
  { key: "business-profile", href: "/settings/business-profile" },
  { key: "billing-gst", href: "/settings/billing-gst" },
  { key: "users-roles", href: "/settings/users-roles" },
  { key: "inventory", href: "/settings/inventory" },
  { key: "notifications", href: "/settings/notifications" },
  { key: "integrations", href: "/settings/integrations" },
];

function SectionNav({ activeSection }: { activeSection: SettingsSectionKey }) {
  return (
    <div className="border-b border-slate-200 mb-8">
      <div className="flex space-x-6 overflow-x-auto hide-scrollbar">
        {sectionLinks.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={`relative py-3 text-sm whitespace-nowrap ${
              activeSection === item.key
                ? "font-semibold text-blue-600"
                : "font-medium text-slate-500 hover:text-slate-700 transition-colors"
            }`}
          >
            {sectionLabels[item.key]}
            {activeSection === item.key ? (
              <div className="absolute -bottom-px left-0 right-0 h-0.5 bg-surface-tint" />
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function SettingsSectionView({
  section,
}: {
  section: SettingsSectionKey;
}) {
  const { settings, isLoading, updateSettings, isUpdating } = useSettings();
  const [taxCalculation, setTaxCalculation] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [barcodeSystem, setBarcodeSystem] = useState(false);
  const [paymentReminders, setPaymentReminders] = useState(true);
  const [whatsappUpdates, setWhatsappUpdates] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("Staff");

  // Business profile form state
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [invoicePrefix, setInvoicePrefix] = useState("INV-");
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  // Initialize form with settings data when loaded
  useEffect(() => {
    if (settings) {
      setBusinessName(settings.businessName || "");
      setGstNumber(settings.gstNumber || "");
      setInvoicePrefix(settings.invoicePrefix || "INV-");
      setLowStockThreshold(settings.lowStockThreshold || 10);
    }
  }, [settings]);

  const handleSaveBusinessProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings({
        businessName: businessName.trim() || undefined,
        gstNumber: gstNumber.trim() || undefined,
      });
      toast.success("Business profile saved successfully");
    } catch {
      toast.error("Failed to save business profile");
    }
  };

  const handleSaveBillingSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings({
        invoicePrefix: invoicePrefix.trim() || "INV-",
        gstNumber: gstNumber.trim() || undefined,
      });
      toast.success("Billing settings saved successfully");
    } catch {
      toast.error("Failed to save billing settings");
    }
  };

  const handleSaveInventorySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings({
        lowStockThreshold: Math.max(1, lowStockThreshold),
      });
      toast.success("Inventory settings saved successfully");
    } catch {
      toast.error("Failed to save inventory settings");
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-2">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              {sectionLabels[section]}
            </p>
          </div>
          <h2 className="font-display-sm text-display-sm text-on-surface mt-2">
            {sectionLabels[section]}
          </h2>
          <p className="font-body-md text-on-surface-variant mt-1">
            Manage only the {sectionLabels[section].toLowerCase()} section here.
          </p>
        </div>
      </div>

      <SectionNav activeSection={section} />

      {section === "business-profile" ? (
        <section className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-h1 text-h1">Business Profile</h3>
            <button
              className={`px-4 py-2 text-on-primary rounded-lg text-sm font-semibold hover:opacity-90 active:scale-95 transition-all ${
                isUpdating || isLoading ? "bg-slate-300 cursor-not-allowed" : "bg-primary"
              }`}
              onClick={handleSaveBusinessProfile}
              disabled={isUpdating || isLoading}
              type="button"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
          <div className="p-8">
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-slate-500">Loading settings...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <label className="text-label-caps font-label-caps text-on-surface-variant uppercase">
                    Business Name
                  </label>
                  <input
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-body-md"
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g., Metro Wholesale"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-label-caps font-label-caps text-on-surface-variant uppercase">
                    Owner Name
                  </label>
                  <input
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-body-md"
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g., Alex Rivera"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-label-caps font-label-caps text-on-surface-variant uppercase">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      +91
                    </span>
                    <input
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-body-md"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit number"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-label-caps font-label-caps text-on-surface-variant uppercase">
                    Email Address
                  </label>
                  <input
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-body-md"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g., hello@business.com"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-label-caps font-label-caps text-on-surface-variant uppercase">
                    Business Address
                  </label>
                  <textarea
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-body-md resize-none"
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, City, State, Zip"
                  ></textarea>
                </div>
                <div className="space-y-1.5">
                  <label className="text-label-caps font-label-caps text-on-surface-variant uppercase">
                    GST Number
                  </label>
                  <input
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] font-mono-data text-mono-data focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none uppercase"
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="15-digit GST number"
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      ) : null}

      {section === "billing-gst" ? (
        <section className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-h1 text-h1">Billing &amp; GST</h3>
            <button
              className={`px-4 py-2 text-on-primary rounded-lg text-sm font-semibold hover:opacity-90 active:scale-95 transition-all ${
                isUpdating || isLoading ? "bg-slate-300 cursor-not-allowed" : "bg-primary"
              }`}
              onClick={handleSaveBillingSettings}
              disabled={isUpdating || isLoading}
              type="button"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
          <div className="p-6 space-y-6 flex-1">
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-slate-500">Loading settings...</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Tax Calculation</p>
                    <p className="text-xs text-slate-500">
                      Automatically calculate GST on invoices
                    </p>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      checked={taxCalculation}
                      className="sr-only peer"
                      onChange={(event) => {
                        setTaxCalculation(event.target.checked);
                      }}
                      type="checkbox"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-label-caps font-label-caps text-on-surface-variant uppercase">
                      Default GST %
                    </label>
                    <select className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-body-md bg-white">
                      <option>18% Standard</option>
                      <option>12% Reduced</option>
                      <option>28% Luxury</option>
                      <option>5% Essential</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-label-caps font-label-caps text-on-surface-variant uppercase">
                      Invoice Prefix
                    </label>
                    <input
                      className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] font-mono-data text-mono-data focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                      type="text"
                      value={invoicePrefix}
                      onChange={(e) => setInvoicePrefix(e.target.value.toUpperCase())}
                      placeholder="e.g., INV-"
                      maxLength={10}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Example: {invoicePrefix}20260518-00001
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      ) : null}

      {section === "inventory" ? (
        <section className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-h1 text-h1">Inventory Rules</h3>
            <button
              className={`px-4 py-2 text-on-primary rounded-lg text-sm font-semibold hover:opacity-90 active:scale-95 transition-all ${
                isUpdating || isLoading ? "bg-slate-300 cursor-not-allowed" : "bg-primary"
              }`}
              onClick={handleSaveInventorySettings}
              disabled={isUpdating || isLoading}
              type="button"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
          <div className="p-6 space-y-6 flex-1">
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-slate-500">Loading settings...</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Low Stock Alerts</p>
                    <p className="text-xs text-slate-500">
                      Notify dashboard when stock is critical
                    </p>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      checked={lowStockAlerts}
                      className="sr-only peer"
                      onChange={(event) => {
                        setLowStockAlerts(event.target.checked);
                      }}
                      type="checkbox"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Barcode System</p>
                    <p className="text-xs text-slate-500">
                      Enable scanning for stock movement
                    </p>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      checked={barcodeSystem}
                      className="sr-only peer"
                      onChange={(event) => {
                        setBarcodeSystem(event.target.checked);
                      }}
                      type="checkbox"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700">
                      Min. Stock Threshold
                    </label>
                    <input
                      className="w-20 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-center font-mono-data text-mono-data focus:ring-2 focus:ring-blue-500/20 outline-none"
                      type="number"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      max="1000"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      ) : null}

      {section === "users-roles" ? (
        <section className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-h1 text-h1">Users &amp; Roles</h3>
            <button
              className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all"
              onClick={() => setIsUserModalOpen(true)}
              type="button"
            >
              <span className="material-symbols-outlined text-sm">
                person_add
              </span>
              <span>Add User</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/30 text-left border-b border-slate-100">
                  <th className="px-6 py-3 text-label-caps font-label-caps text-slate-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-label-caps font-label-caps text-slate-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-label-caps font-label-caps text-slate-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-label-caps font-label-caps text-slate-500 uppercase text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                        AR
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Alex Rivera</p>
                        <p className="text-xs text-slate-500">
                          alex@metrowholesale.com
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-primary-fixed text-on-primary-fixed-variant rounded-full text-[10px] font-bold uppercase">
                      Owner
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="text-xs text-emerald-700 font-medium">
                        Active
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="text-slate-400 hover:text-slate-600"
                      onClick={() => {}}
                      type="button"
                    >
                      <span className="material-symbols-outlined">
                        more_horiz
                      </span>
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                        SM
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Sarah Miller</p>
                        <p className="text-xs text-slate-500">
                          s.miller@metrowholesale.com
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase">
                      Staff
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="text-xs text-emerald-700 font-medium">
                        Active
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="text-slate-400 hover:text-slate-600"
                      onClick={() => {}}
                      type="button"
                    >
                      <span className="material-symbols-outlined">
                        more_horiz
                      </span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {section === "notifications" ? (
        <section className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-6 max-w-xl">
          <h3 className="font-h1 text-h1 border-b border-slate-100 pb-4">
            Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Payment Reminders</span>
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  checked={paymentReminders}
                  className="sr-only peer"
                  onChange={(event) => {
                    setPaymentReminders(event.target.checked);
                  }}
                  type="checkbox"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">WhatsApp Updates</span>
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  checked={whatsappUpdates}
                  className="sr-only peer"
                  onChange={(event) => {
                    setWhatsappUpdates(event.target.checked);
                  }}
                  type="checkbox"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {section === "integrations" ? (
        <section className="bg-white rounded-xl border border-[#E2E8F0] p-6 max-w-2xl">
          <h3 className="font-h1 text-h1 border-b border-slate-100 pb-4 mb-6">
            Integrations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              className="p-4 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/20 transition-all cursor-pointer group text-left"
              onClick={() => {}}
              type="button"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <span className="material-symbols-outlined text-emerald-600">
                    chat
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                  Connected
                </span>
              </div>
              <h4 className="text-sm font-bold">WhatsApp Business</h4>
              <p className="text-xs text-slate-500 mt-1">
                Send automated stock alerts and invoices.
              </p>
            </button>
            <button
              className="p-4 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/20 transition-all cursor-pointer group text-left"
              onClick={() => {}}
              type="button"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <span className="material-symbols-outlined text-blue-600">
                    account_balance_wallet
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">
                  Configure
                </span>
              </div>
              <h4 className="text-sm font-bold">Stripe Payments</h4>
              <p className="text-xs text-slate-500 mt-1">
                Accept digital payments from wholesale buyers.
              </p>
            </button>
          </div>
        </section>
      ) : null}

      <div className="fixed bottom-6 right-6 z-40 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
        <p className="text-sm font-semibold leading-none">
          <span className="text-slate-900">Powered by </span>
          <span className="text-blue-600">SCS Technologies</span>
        </p>
      </div>
      {isUserModalOpen ? (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <form
            className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl p-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              toast.success(`Invited ${newUserName.trim()} as ${newUserRole}`);
              setIsUserModalOpen(false);
              setNewUserName("");
              setNewUserEmail("");
              setNewUserRole("Staff");
            }}
          >
            <h3 className="text-base font-bold text-slate-900">
              Add User Form
            </h3>
            <input
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              onChange={(event) => setNewUserName(event.target.value)}
              placeholder="Full name"
              required
              value={newUserName}
            />
            <input
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              onChange={(event) => setNewUserEmail(event.target.value)}
              placeholder="Email address"
              required
              type="email"
              value={newUserEmail}
            />
            <select
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              onChange={(event) => setNewUserRole(event.target.value)}
              value={newUserRole}
            >
              <option>Staff</option>
              <option>Manager</option>
              <option>Owner</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
                onClick={() => setIsUserModalOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 text-sm bg-primary text-white rounded-lg"
                type="submit"
              >
                Save User
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
