import type { BusinessConfig } from "@/config/business/types";

export function InventoryFilters({
  config,
  selectedCategory,
  onCategoryChange,
  availableCategories,
}: {
  config: BusinessConfig;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  availableCategories: string[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Filters</h2>
        <span className="text-sm text-slate-500">{config.label}</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
          <select
            value={selectedCategory}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {availableCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        {config.filters.map((filter) => (
          <div key={filter.key}>
            <label className="mb-1 block text-sm font-medium text-slate-700">{filter.label}</label>
            <input
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              placeholder={filter.label}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
