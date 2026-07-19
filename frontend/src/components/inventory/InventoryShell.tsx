"use client";

import { useMemo } from "react";
import { getBusinessConfig } from "@/config/business";
import { formatINR } from "@/lib/currency";
import { InventoryCards } from "./InventoryCards";
import { InventoryFilters } from "./InventoryFilters";
import { InventoryTable } from "./InventoryTable";
import { InventoryCostTable } from "./InventoryCostTable";
import { DynamicProductForm, type ProductFormData } from "./DynamicProductForm";

type InventoryShellProps = {
  tenantBusinessType?: string | null;
  products: Array<{
    id: string;
    name: string;
    category?: string | null;
    stock: number;
    purchasePrice: number;
    sellingPrice: number;
    gst: number;
    status: string;
    expiryDate?: string | null;
  }>;
  availableCategories: string[];
  onEdit: (product: any) => void;
  onActivate: (product: any) => void;
  showActivationModal: boolean;
  activatingProduct: { id: string; name: string; sellingPrice?: number; purchasePrice?: number } | undefined;
  activationForm: { sellingPrice: string };
  onActivationFormChange: (field: string, value: string) => void;
  onCancelActivation: () => void;
  onSubmitActivation: (event: React.FormEvent) => void;
  onAddProduct: (event: React.FormEvent) => void;
  onToggleForm: () => void;
  showForm: boolean;
  formData: ProductFormData;
  onFieldChange: (field: string, value: string) => void;
  onCancelForm: () => void;
  submitting: boolean;
  editingProductId: string | null;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddCategory: () => void;
  lowStockOnly: boolean;
  onToggleLowStock: () => void;
  lowStockCount: number;
};

export function InventoryShell({
  tenantBusinessType,
  products,
  availableCategories,
  onEdit,
  onActivate,
  showActivationModal,
  activatingProduct,
  activationForm,
  onActivationFormChange,
  onCancelActivation,
  onSubmitActivation,
  onAddProduct,
  onToggleForm,
  showForm,
  formData,
  onFieldChange,
  onCancelForm,
  submitting,
  editingProductId,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  onAddCategory,
  lowStockOnly,
  onToggleLowStock,
  lowStockCount,
}: InventoryShellProps) {
  const config = useMemo(() => getBusinessConfig(tenantBusinessType), [tenantBusinessType]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">{config.label}</p>
          <h1 className="text-3xl font-bold text-slate-900">Inventory</h1>
          <p className="mt-1 text-sm text-slate-500">Business configuration is loaded from the tenant profile.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onToggleLowStock}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
              lowStockOnly
                ? "bg-amber-700 hover:bg-amber-800"
                : "bg-amber-500 hover:bg-amber-600"
            }`}
          >
            Low Stock Products{lowStockCount > 0 ? ` (${lowStockCount})` : ""}
          </button>
          <button
            type="button"
            onClick={onAddCategory}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            + Add Category
          </button>
          <button
            type="button"
            onClick={onToggleForm}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Add Product
          </button>
        </div>
      </div>

      <InventoryCards config={config} products={products} />
      <InventoryFilters
        config={config}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        availableCategories={availableCategories}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Filter by Category</h2>
          <button
            type="button"
            onClick={() => onCategoryChange("")}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              selectedCategory === ""
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({products.length})
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableCategories.length === 0 ? (
            <p className="text-sm text-slate-500">No categories available.</p>
          ) : (
            availableCategories.map((category) => {
              const count = products.filter((p) => p.category === category).length;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => onCategoryChange(category)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    selectedCategory === category
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {category} ({count})
                </button>
              );
            })
          )}
        </div>
      </div>

      {showForm ? (
        <DynamicProductForm
          config={config}
          formData={formData}
          onChange={onFieldChange}
          onSubmit={onAddProduct}
          onCancel={onCancelForm}
          submitting={submitting}
          editing={Boolean(editingProductId)}
          categoryOptions={availableCategories}
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.7fr_0.7fr]">
        <InventoryTable config={config} products={products} onEdit={onEdit} onActivate={onActivate} />
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
              <h2 className="text-lg font-bold text-slate-900">Categories</h2>
              <span className="text-xs font-semibold text-slate-500">{availableCategories.length} total</span>
            </div>
            {availableCategories.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">No categories yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {availableCategories.map((category) => {
                  const count = products.filter((p) => p.category === category).length;
                  return (
                    <li
                      key={category}
                      className={`flex cursor-pointer items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-slate-50 ${
                        selectedCategory === category ? "bg-blue-50" : ""
                      }`}
                      onClick={() => onCategoryChange(category)}
                    >
                      <span className="font-medium text-slate-700">{category}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                        {count} items
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      <InventoryCostTable products={products} />

      {showActivationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">
              Activate Product{activatingProduct ? `: ${activatingProduct.name}` : ""}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Set the selling price to activate this product.
            </p>
            {activatingProduct && (
              <div className="mt-3 rounded-lg bg-slate-50 px-4 py-3 text-sm">
                <span className="font-semibold text-slate-700">Product Cost (Buying Price): </span>
                <span className="font-bold text-slate-900">{formatINR(activatingProduct.purchasePrice || 0)}</span>
              </div>
            )}
            <form onSubmit={onSubmitActivation} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Selling Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={activationForm.sellingPrice}
                  onChange={(event) => onActivationFormChange("sellingPrice", event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Enter selling price"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onCancelActivation}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                >
                  Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
