import type { BusinessConfig } from "./types";

export const cosmeticsConfig: BusinessConfig = {
  key: "COSMETICS",
  label: "Cosmetics",
  dashboardCards: [
    { key: "inventoryValue", title: "Inventory Value", description: "Stock value" },
    { key: "expiringSoon", title: "Expiring Soon", description: "Near expiry stock" },
    { key: "lowStock", title: "Low Stock", description: "Need restock" },
    { key: "todaysSales", title: "Today's Sales", description: "Sales today" },
  ],
  tableColumns: [
    { key: "image", label: "Image" },
    { key: "product", label: "Product" },
    { key: "shade", label: "Shade" },
    { key: "skinType", label: "Skin Type" },
    { key: "expiry", label: "Expiry" },
    { key: "brand", label: "Brand" },
    { key: "stock", label: "Stock" },
    { key: "price", label: "Price" },
  ],
  filters: [
    { key: "brand", label: "Brand" },
    { key: "expiry", label: "Expiry" },
    { key: "skinType", label: "Skin Type" },
  ],
  productFields: [
    { key: "name", label: "Product", type: "text" },
    { key: "shade", label: "Shade", type: "text" },
    { key: "skinType", label: "Skin Type", type: "text" },
    { key: "expiryDate", label: "Expiry", type: "date" },
    { key: "batchNumber", label: "Batch", type: "text" },
    { key: "brand", label: "Brand", type: "text" },
    { key: "purchasePrice", label: "Purchase Price", type: "number" },
    { key: "sellingPrice", label: "Selling Price", type: "number" },
    { key: "stock", label: "Stock", type: "number" },
  ],
  reports: ["Expiry Report", "Brand Report"],
  quickActions: ["Batch Check", "Expiry Alert", "Reorder"],
};
