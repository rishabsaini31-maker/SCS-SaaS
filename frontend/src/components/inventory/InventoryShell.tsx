"use client";

import { useMemo } from "react";
import { getBusinessConfig } from "@/config/business";
import { InventoryCards } from "./InventoryCards";
import { InventoryFilters } from "./InventoryFilters";
import { InventoryTable } from "./InventoryTable";
import { DynamicProductForm, type ProductFormData } from "./DynamicProductForm";
import { QuickActions } from "./QuickActions";
import { BusinessReports } from "./BusinessReports";

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
};

export function InventoryShell({
  tenantBusinessType,
  products,
  availableCategories,
  onEdit,
  onActivate,
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
        <button
          type="button"
          onClick={onToggleForm}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Add Product
        </button>
      </div>

      <InventoryCards config={config} />
      <InventoryFilters
        config={config}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        availableCategories={availableCategories}
      />

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
          <QuickActions config={config} />
          <BusinessReports config={config} />
        </div>
      </div>
    </div>
  );
}
