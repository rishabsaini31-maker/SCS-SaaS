import type { BusinessConfig } from "@/config/business/types";

export function InventoryCards({ config }: { config: BusinessConfig }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {config.dashboardCards.map((card) => (
        <div key={card.key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">{card.title}</p>
          <p className="mt-2 text-sm text-slate-500">{card.description}</p>
          <div className="mt-4 text-2xl font-bold text-blue-600">—</div>
        </div>
      ))}
    </div>
  );
}
