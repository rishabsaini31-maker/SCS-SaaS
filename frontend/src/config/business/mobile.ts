import type { BusinessConfig } from "./types";

export const mobileConfig: BusinessConfig = {
  key: "MOBILE",
  label: "Mobile Shop",
  dashboardCards: [
    { key: "inventoryValue", title: "Inventory Value", description: "Stock value" },
    { key: "warrantyItems", title: "Warranty Items", description: "Devices with warranty" },
    { key: "lowStock", title: "Low Stock", description: "Low stock devices" },
    { key: "todaysSales", title: "Today's Sales", description: "Sales today" },
  ],
  tableColumns: [
    { key: "image", label: "Image" },
    { key: "product", label: "Product" },
    { key: "imei", label: "IMEI" },
    { key: "ram", label: "RAM" },
    { key: "storage", label: "Storage" },
    { key: "color", label: "Color" },
    { key: "stock", label: "Stock" },
    { key: "price", label: "Price" },
  ],
  filters: [
    { key: "brand", label: "Brand" },
    { key: "model", label: "Model" },
    { key: "warranty", label: "Warranty" },
  ],
  productFields: [
    { key: "name", label: "Product", type: "text" },
    { key: "imei", label: "IMEI", type: "text" },
    { key: "ram", label: "RAM", type: "text" },
    { key: "storage", label: "Storage", type: "text" },
    { key: "color", label: "Color", type: "text" },
    { key: "warranty", label: "Warranty", type: "text" },
    { key: "brand", label: "Brand", type: "text" },
    { key: "model", label: "Model", type: "text" },
    { key: "purchasePrice", label: "Purchase Price", type: "number" },
    { key: "sellingPrice", label: "Selling Price", type: "number" },
    { key: "stock", label: "Stock", type: "number" },
  ],
  reports: ["IMEI Report", "Warranty Report"],
  quickActions: ["Warranty Check", "Device Setup", "Stock Audit"],
};
