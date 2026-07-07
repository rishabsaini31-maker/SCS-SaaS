import type { BusinessConfig } from "@/config/business/types";
import Link from "next/link";

export function QuickActions({
  config,
  onToggleForm,
}: {
  config: BusinessConfig;
  onToggleForm?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {config.quickActions.map((action) => {
          if (action === "Quick Add") {
            return (
              <button
                key={action}
                onClick={onToggleForm}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
              >
                {action}
              </button>
            );
          }
          if (action === "Barcode Print") {
            return (
              <Link
                key={action}
                href="/barcode"
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
              >
                {action}
              </Link>
            );
          }
          if (action === "Reports" || action === "Stock Report" || action === "Reorder") {
            return (
              <Link
                key={action}
                href="/reports"
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
              >
                {action}
              </Link>
            );
          }

          return (
            <button
              key={action}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
            >
              {action}
            </button>
          );
        })}
      </div>
    </div>
  );
}
