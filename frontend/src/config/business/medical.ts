import type { BusinessConfig } from "./types";

export const medicalConfig: BusinessConfig = {
  key: "MEDICAL",
  label: "Medical Store",
  dashboardCards: [
    { key: "inventoryValue", title: "Inventory Value", description: "Medicine stock value" },
    { key: "expiringSoon", title: "Expiring Soon", description: "Near expiry batch" },
    { key: "lowStock", title: "Low Stock", description: "Critical stock items" },
    { key: "todaysSales", title: "Today's Sales", description: "Sales today" },
  ],
  tableColumns: [
    { key: "image", label: "Image" },
    { key: "product", label: "Medicine" },
    { key: "batch", label: "Batch" },
    { key: "expiry", label: "Expiry" },
    { key: "composition", label: "Composition" },
    { key: "stock", label: "Stock" },
    { key: "price", label: "Price" },
  ],
  filters: [
    { key: "batch", label: "Batch" },
    { key: "expiry", label: "Expiry" },
    { key: "schedule", label: "Schedule" },
    { key: "manufacturer", label: "Manufacturer" },
  ],
  productFields: [
    { key: "name", label: "Medicine", type: "text" },
    { key: "batchNumber", label: "Batch", type: "text" },
    { key: "expiryDate", label: "Expiry", type: "date" },
    { key: "composition", label: "Composition", type: "text" },
    { key: "schedule", label: "Schedule", type: "text" },
    { key: "manufacturer", label: "Manufacturer", type: "text" },
    { key: "purchasePrice", label: "Purchase Price", type: "number" },
    { key: "sellingPrice", label: "Selling Price", type: "number" },
    { key: "stock", label: "Stock", type: "number" },
  ],
  reports: ["Expiry Report", "Medicine Report"],
  quickActions: ["Expiry Alert", "Batch Review", "Reorder"],
};
