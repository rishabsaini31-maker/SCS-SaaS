import type { BusinessConfig } from "./types";

export const electronicsConfig: BusinessConfig = {
  key: "ELECTRONICS",
  label: "Electronics",
  dashboardCards: [
    { key: "inventoryValue", title: "Inventory Value", description: "Current stock value" },
    { key: "warrantyItems", title: "Warranty Items", description: "Products under warranty" },
    { key: "lowStock", title: "Low Stock", description: "Fast moving items" },
    { key: "todaysSales", title: "Today's Sales", description: "Sales completed today" },
  ],
  tableColumns: [
    { key: "image", label: "Image" },
    { key: "product", label: "Product" },
    { key: "brand", label: "Brand" },
    { key: "model", label: "Model" },
    { key: "serial", label: "Serial" },
    { key: "stock", label: "Stock" },
    { key: "price", label: "Price" },
  ],
  filters: [
    { key: "brand", label: "Brand" },
    { key: "model", label: "Model" },
    { key: "warranty", label: "Warranty" },
  ],
  productFields: [
    { key: "name", label: "Product Name", type: "text" },
    { key: "brand", label: "Brand", type: "text" },
    { key: "model", label: "Model", type: "text" },
    { key: "serialNumber", label: "Serial Number", type: "text" },
    { key: "warranty", label: "Warranty", type: "text" },
    { key: "voltage", label: "Voltage", type: "text" },
    { key: "purchasePrice", label: "Purchase Price", type: "number" },
    { key: "sellingPrice", label: "Selling Price", type: "number" },
    { key: "stock", label: "Stock", type: "number" },
  ],
  reports: ["Warranty Report", "Serial Report"],
  quickActions: ["Warranty Check", "Serial Lookup", "Stock Sync"],
};
