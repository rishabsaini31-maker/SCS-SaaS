import type { BusinessConfig } from "@/config/business/types";

export function QuickActions({ config }: { config: BusinessConfig }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {config.quickActions.map((action) => (
          <span key={action} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
            {action}
          </span>
        ))}
      </div>
    </div>
  );
}
