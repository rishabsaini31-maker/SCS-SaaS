"use client";

import { useState } from "react";
import Link from "next/link";

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
  const [taxCalculation, setTaxCalculation] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [barcodeSystem, setBarcodeSystem] = useState(false);
  const [paymentReminders, setPaymentReminders] = useState(true);
  const [whatsappUpdates, setWhatsappUpdates] = useState(false);
  const [lastAction, setLastAction] = useState("Ready");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("Staff");

  return (
    <div className="max-w-5xl mx-auto py-2">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/settings" className="text-sm font-semibold text-blue-600 hover:underline">
              ← Back to Settings
            </Link>
            <span className="text-slate-300">|</span>
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
            <button className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:opacity-90 active:scale-95 transition-all" onClick={() => setLastAction("Business profile saved")} type="button">Save Changes</button>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1.5">
                <label className="text-label-caps font-label-caps text-on-surface-variant uppercase">Business Name</label>
                <input className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-body-md" type="text" defaultValue="Metro Wholesale &amp; Logistics" />
              </div>
              <div className="space-y-1.5">
                <label className="text-label-caps font-label-caps text-on-surface-variant uppercase">Owner Name</label>
                <input className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-body-md" type="text" defaultValue="Alex Rivera" />
              </div>
              <div className="space-y-1.5">
                <label className="text-label-caps font-label-caps text-on-surface-variant uppercase">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">+1</span>
                  <input className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-body-md" type="tel" defaultValue="(555) 123-4567" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-label-caps font-label-caps text-on-surface-variant uppercase">Email Address</label>
                <input className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-body-md" type="email" defaultValue="alex@metrowholesale.com" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-label-caps font-label-caps text-on-surface-variant uppercase">Business Address</label>
                <textarea className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-body-md resize-none" rows={3} defaultValue="402 Industrial Pkwy, Suite 100, North Austin, TX 78758"></textarea>
              </div>
              <div className="space-y-1.5">
                <label className="text-label-caps font-label-caps text-on-surface-variant uppercase">GST Number</label>
                <input className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] font-mono-data text-mono-data focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none uppercase" type="text" defaultValue="TX22AM9034L1Z5" />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {section === "billing-gst" ? (
        <section className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-h1 text-h1">Billing &amp; GST</h3>
          </div>
          <div className="p-6 space-y-6 flex-1">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Tax Calculation</p>
                <p className="text-xs text-slate-500">Automatically calculate GST on invoices</p>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <input checked={taxCalculation} className="sr-only peer" onChange={(event) => {
                  setTaxCalculation(event.target.checked);
                  setLastAction(`Tax calculation ${event.target.checked ? "enabled" : "disabled"}`);
                }} type="checkbox" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-label-caps font-label-caps text-on-surface-variant uppercase">Default GST %</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-body-md bg-white">
                  <option>18% Standard</option>
                  <option>12% Reduced</option>
                  <option>28% Luxury</option>
                  <option>5% Essential</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-label-caps font-label-caps text-on-surface-variant uppercase">Invoice Prefix</label>
                <input className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] font-mono-data text-mono-data focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" type="text" defaultValue="INV-" />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {section === "inventory" ? (
        <section className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-h1 text-h1">Inventory Rules</h3>
          </div>
          <div className="p-6 space-y-6 flex-1">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Low Stock Alerts</p>
                <p className="text-xs text-slate-500">Notify dashboard when stock is critical</p>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <input checked={lowStockAlerts} className="sr-only peer" onChange={(event) => {
                  setLowStockAlerts(event.target.checked);
                  setLastAction(`Low stock alerts ${event.target.checked ? "enabled" : "disabled"}`);
                }} type="checkbox" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Barcode System</p>
                <p className="text-xs text-slate-500">Enable scanning for stock movement</p>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <input checked={barcodeSystem} className="sr-only peer" onChange={(event) => {
                  setBarcodeSystem(event.target.checked);
                  setLastAction(`Barcode system ${event.target.checked ? "enabled" : "disabled"}`);
                }} type="checkbox" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-700">Min. Stock Threshold</label>
                <input className="w-20 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-center font-mono-data text-mono-data focus:ring-2 focus:ring-blue-500/20 outline-none" type="number" defaultValue="15" />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {section === "users-roles" ? (
        <section className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-h1 text-h1">Users &amp; Roles</h3>
            <button className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all" onClick={() => setIsUserModalOpen(true)} type="button">
              <span className="material-symbols-outlined text-sm">person_add</span>
              <span>Add User</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/30 text-left border-b border-slate-100">
                  <th className="px-6 py-3 text-label-caps font-label-caps text-slate-500 uppercase">User</th>
                  <th className="px-6 py-3 text-label-caps font-label-caps text-slate-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-label-caps font-label-caps text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-label-caps font-label-caps text-slate-500 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">AR</div>
                      <div>
                        <p className="text-sm font-semibold">Alex Rivera</p>
                        <p className="text-xs text-slate-500">alex@metrowholesale.com</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-primary-fixed text-on-primary-fixed-variant rounded-full text-[10px] font-bold uppercase">Owner</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="text-xs text-emerald-700 font-medium">Active</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-slate-600" onClick={() => setLastAction("User action menu opened")} type="button"><span className="material-symbols-outlined">more_horiz</span></button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">SM</div>
                      <div>
                        <p className="text-sm font-semibold">Sarah Miller</p>
                        <p className="text-xs text-slate-500">s.miller@metrowholesale.com</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase">Staff</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="text-xs text-emerald-700 font-medium">Active</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-slate-600" onClick={() => setLastAction("User action menu opened")} type="button"><span className="material-symbols-outlined">more_horiz</span></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {section === "notifications" ? (
        <section className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-6 max-w-xl">
          <h3 className="font-h1 text-h1 border-b border-slate-100 pb-4">Notifications</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Payment Reminders</span>
              <div className="relative inline-flex items-center cursor-pointer">
                <input checked={paymentReminders} className="sr-only peer" onChange={(event) => {
                  setPaymentReminders(event.target.checked);
                  setLastAction(`Payment reminders ${event.target.checked ? "enabled" : "disabled"}`);
                }} type="checkbox" />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">WhatsApp Updates</span>
              <div className="relative inline-flex items-center cursor-pointer">
                <input checked={whatsappUpdates} className="sr-only peer" onChange={(event) => {
                  setWhatsappUpdates(event.target.checked);
                  setLastAction(`WhatsApp updates ${event.target.checked ? "enabled" : "disabled"}`);
                }} type="checkbox" />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {section === "integrations" ? (
        <section className="bg-white rounded-xl border border-[#E2E8F0] p-6 max-w-2xl">
          <h3 className="font-h1 text-h1 border-b border-slate-100 pb-4 mb-6">Integrations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="p-4 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/20 transition-all cursor-pointer group text-left" onClick={() => setLastAction("WhatsApp integration opened")} type="button">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <span className="material-symbols-outlined text-emerald-600">chat</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">Connected</span>
              </div>
              <h4 className="text-sm font-bold">WhatsApp Business</h4>
              <p className="text-xs text-slate-500 mt-1">Send automated stock alerts and invoices.</p>
            </button>
            <button className="p-4 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/20 transition-all cursor-pointer group text-left" onClick={() => setLastAction("Stripe integration opened")} type="button">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <span className="material-symbols-outlined text-blue-600">account_balance_wallet</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">Configure</span>
              </div>
              <h4 className="text-sm font-bold">Stripe Payments</h4>
              <p className="text-xs text-slate-500 mt-1">Accept digital payments from wholesale buyers.</p>
            </button>
          </div>
        </section>
      ) : null}

      <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between items-center text-slate-500">
        <p className="text-xs">© 2024 WholesalePro Management Suite. All rights reserved.</p>
        <div className="flex space-x-6 text-xs">
          <button className="hover:text-blue-600 transition-colors" onClick={() => setLastAction("Opened privacy policy")} type="button">Privacy Policy</button>
          <button className="hover:text-blue-600 transition-colors" onClick={() => setLastAction("Opened terms of service")} type="button">Terms of Service</button>
          <button className="hover:text-blue-600 transition-colors" onClick={() => setLastAction("Opened contact support")} type="button">Contact Support</button>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">Last action: {lastAction}</p>
      {isUserModalOpen ? (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <form
            className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl p-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              setLastAction(`Invited ${newUserName.trim()} as ${newUserRole}`);
              setIsUserModalOpen(false);
              setNewUserName("");
              setNewUserEmail("");
              setNewUserRole("Staff");
            }}
          >
            <h3 className="text-base font-bold text-slate-900">Add User Form</h3>
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
              <button className="px-3 py-2 text-sm bg-primary text-white rounded-lg" type="submit">
                Save User
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
