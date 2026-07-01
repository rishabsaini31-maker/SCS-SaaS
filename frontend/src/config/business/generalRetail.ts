import type { BusinessConfig } from "./types";

export const generalRetailConfig: BusinessConfig = {
  key: "GENERAL_RETAIL",
  label: "General Retail",
  dashboardCards: [
    { key: "inventoryValue", title: "Inventory Value", description: "Stock valuation" },
    { key: "lowStock", title: "Low Stock", description: "Items needing replenishment" },
    { key: "todaysSales", title: "Today's Sales", description: "Sales completed today" },
  ],
  tableColumns: [
    { key: "image", label: "Image" },
    { key: "product", label: "Product" },
    { key: "category", label: "Category" },
    { key: "stock", label: "Stock" },
    { key: "price", label: "Price" },
    { key: "barcode", label: "Barcode" },
  ],
  filters: [
    { key: "category", label: "Category" },
    { key: "brand", label: "Brand" },
  ],
  productFields: [
    { key: "name", label: "Product Name", type: "text" },
    { key: "category", label: "Category", type: "text" },
    { key: "brand", label: "Brand", type: "text" },
    { key: "purchasePrice", label: "Purchase Price", type: "number" },
    { key: "sellingPrice", label: "Selling Price", type: "number" },
    { key: "stock", label: "Stock", type: "number" },
  ],
  reports: ["Stock Report"],
  quickActions: ["Quick Add", "Barcode Print", "Reorder"],
};
