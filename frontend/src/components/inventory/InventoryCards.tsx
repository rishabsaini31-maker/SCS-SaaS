import type { BusinessConfig } from "@/config/business/types";

export function InventoryCards({
  config,
  products = [],
}: {
  config: BusinessConfig;
  products?: any[];
}) {
  const inventoryValue = products.reduce((acc, p) => acc + (p.stock * (p.purchasePrice || 0)), 0);
  const lowStockCount = products.filter((p) => p.stock < 10).length;

  const getValueForCard = (title: string) => {
    if (title.includes("Inventory Value") || title.includes("Stock valuation")) {
      return `₹${inventoryValue.toLocaleString("en-IN")}`;
    }
    if (title.includes("Low Stock")) {
      return lowStockCount;
    }
    if (title.includes("Today's Sales")) {
      return "₹0"; // Pending real sales API
    }
    return "—";
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {config.dashboardCards.map((card) => (
        <div key={card.key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">{card.title}</p>
          <p className="mt-2 text-sm text-slate-500">{card.description}</p>
          <div className="mt-4 text-2xl font-bold text-blue-600">{getValueForCard(card.title)}</div>
        </div>
      ))}
    </div>
  );
}
