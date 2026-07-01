import type { BusinessConfig } from "@/config/business/types";

export function BusinessReports({ config }: { config: BusinessConfig }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">Reports</h2>
      <ul className="mt-3 space-y-2 text-sm text-slate-700">
        {config.reports.map((report) => (
          <li key={report} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
            {report}
          </li>
        ))}
      </ul>
    </div>
  );
}
