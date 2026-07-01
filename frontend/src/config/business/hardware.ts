import type { BusinessConfig } from "./types";

export const hardwareConfig: BusinessConfig = {
  key: "HARDWARE",
  label: "Hardware",
  dashboardCards: [
    { key: "inventoryValue", title: "Inventory Value", description: "Stock valuation" },
    { key: "lowStock", title: "Low Stock", description: "Critical stock" },
    { key: "supplier", title: "Supplier", description: "Active suppliers" },
    { key: "todaysSales", title: "Today's Sales", description: "Sales today" },
  ],
  tableColumns: [
    { key: "image", label: "Image" },
    { key: "product", label: "Part" },
    { key: "material", label: "Material" },
    { key: "dimensions", label: "Dimensions" },
    { key: "weight", label: "Weight" },
    { key: "stock", label: "Stock" },
    { key: "price", label: "Price" },
  ],
  filters: [
    { key: "material", label: "Material" },
    { key: "supplier", label: "Supplier" },
    { key: "dimensions", label: "Dimensions" },
  ],
  productFields: [
    { key: "name", label: "Part Number", type: "text" },
    { key: "material", label: "Material", type: "text" },
    { key: "dimensions", label: "Dimensions", type: "text" },
    { key: "weight", label: "Weight", type: "text" },
    { key: "supplier", label: "Supplier", type: "text" },
    { key: "purchasePrice", label: "Purchase Price", type: "number" },
    { key: "sellingPrice", label: "Selling Price", type: "number" },
    { key: "stock", label: "Stock", type: "number" },
  ],
  reports: ["Material Report", "Supplier Report"],
  quickActions: ["Reorder", "Supplier Follow-up", "Stock Transfer"],
};
