import type { BusinessConfig } from "@/config/business/types";

export type ProductFormData = {
  name: string;
  category: string;
  stock: string;
  purchasePrice: string;
  sellingPrice: string;
  gst: string;
  expiryDate: string;
  [key: string]: string;
};

export function DynamicProductForm({
  config,
  formData,
  onChange,
  onSubmit,
  onCancel,
  submitting,
  editing,
  categoryOptions,
}: {
  config: BusinessConfig;
  formData: ProductFormData;
  onChange: (field: string, value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
  submitting: boolean;
  editing: boolean;
  categoryOptions: string[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">{editing ? "Edit Product" : "Add New Product"}</h2>
      <p className="mt-1 text-sm text-slate-500">{config.label} oriented product form</p>
      <form onSubmit={onSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Product Name *</label>
          <input
            value={formData.name}
            onChange={(event) => onChange("name", event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="Enter product name"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
          <select
            value={formData.category}
            onChange={(event) => onChange("category", event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          >
            <option value="">Select a category</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        {config.productFields.map((field) => (
          <div key={field.key}>
            <label className="mb-1 block text-sm font-medium text-slate-700">{field.label}</label>
            {field.type === "number" ? (
              <input
                type="number"
                step="0.01"
                value={formData[field.key] || ""}
                onChange={(event) => onChange(field.key, event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            ) : field.type === "date" ? (
              <input
                type="date"
                value={formData[field.key] || ""}
                onChange={(event) => onChange(field.key, event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            ) : (
              <input
                type="text"
                value={formData[field.key] || ""}
                onChange={(event) => onChange(field.key, event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            )}
          </div>
        ))}
        <div className="md:col-span-2 flex gap-2">
          <button type="submit" disabled={submitting} className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-gray-400">
            {submitting ? "Saving..." : editing ? "Save Changes" : "Add Product"}
          </button>
          <button type="button" onClick={onCancel} className="rounded-lg bg-slate-400 px-4 py-2 text-white hover:bg-slate-500">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
