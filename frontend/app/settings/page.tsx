import Link from "next/link";

const sections = [
  {
    title: "Business Profile",
    description: "Company details, contact info, and GST identifiers.",
    href: "/settings/business-profile",
  },
  {
    title: "Billing & GST",
    description: "Invoice defaults, tax handling, and billing rules.",
    href: "/settings/billing-gst",
  },
  {
    title: "Users & Roles",
    description: "Team access, roles, and invitations.",
    href: "/settings/users-roles",
  },
  {
    title: "Inventory",
    description: "Stock alerts, barcode controls, and inventory thresholds.",
    href: "/settings/inventory",
  },
  {
    title: "Notifications",
    description: "Payment reminders and WhatsApp updates.",
    href: "/settings/notifications",
  },
  {
    title: "Integrations",
    description: "Connect messaging and payment tools.",
    href: "/settings/integrations",
  },
];

export default function SettingsPage() {
  return (
    <div className="max-w-5xl mx-auto py-2 space-y-8">
      <div>
        <h2 className="font-display-sm text-display-sm text-on-surface">
          Settings
        </h2>
        <p className="font-body-md text-on-surface-variant mt-1">
          Open a section to manage only that part of your business settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => (
          <Link
            key={section.title}
            href={section.href}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-blue-200 hover:bg-blue-50/30 transition-all"
          >
            <h3 className="text-lg font-bold text-slate-900">{section.title}</h3>
            <p className="text-sm text-slate-500 mt-2">{section.description}</p>
            <span className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-blue-600">
              Open section
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
