import type { BusinessConfig } from "./types";

export const restaurantConfig: BusinessConfig = {
  key: "RESTAURANT",
  label: "Restaurant",
  dashboardCards: [
    { key: "inventoryValue", title: "Inventory Value", description: "Kitchen stock value" },
    { key: "lowStock", title: "Low Stock", description: "Ingredient shortages" },
    { key: "expiringSoon", title: "Expiring Soon", description: "Items near expiry" },
    { key: "todaysSales", title: "Today's Sales", description: "Sales today" },
  ],
  tableColumns: [
    { key: "image", label: "Image" },
    { key: "product", label: "Ingredient" },
    { key: "unit", label: "Unit" },
    { key: "storageLocation", label: "Storage Location" },
    { key: "supplier", label: "Supplier" },
    { key: "expiry", label: "Expiry" },
    { key: "stock", label: "Stock" },
    { key: "price", label: "Price" },
  ],
  filters: [
    { key: "category", label: "Category" },
    { key: "supplier", label: "Supplier" },
    { key: "storageLocation", label: "Storage Location" },
    { key: "expiry", label: "Expiry" },
  ],
  productFields: [
    { key: "name", label: "Ingredient", type: "text" },
    { key: "unit", label: "Unit", type: "text" },
    { key: "storageLocation", label: "Storage Location", type: "text" },
    { key: "supplier", label: "Supplier", type: "text" },
    { key: "expiryDate", label: "Expiry", type: "date" },
    { key: "purchasePrice", label: "Purchase Price", type: "number" },
    { key: "sellingPrice", label: "Selling Price", type: "number" },
    { key: "stock", label: "Stock", type: "number" },
  ],
  reports: ["Ingredient Consumption", "Kitchen Stock"],
  quickActions: ["Recipe Usage", "Restock", "Waste Log"],
};
