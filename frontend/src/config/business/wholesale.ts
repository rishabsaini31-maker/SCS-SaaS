import type { BusinessConfig } from "./types";

export const wholesaleConfig: BusinessConfig = {
  key: "WHOLESALE_DISTRIBUTOR",
  label: "Wholesale Distributor",
  dashboardCards: [
    { key: "inventoryValue", title: "Inventory Value", description: "Current stock valuation" },
    { key: "todaysSales", title: "Today's Sales", description: "Sales completed today" },
    { key: "todaysPurchase", title: "Today's Purchase", description: "Purchases recorded today" },
    { key: "lowStock", title: "Low Stock", description: "Items needing replenishment" },
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
    { key: "supplier", label: "Supplier" },
    { key: "brand", label: "Brand" },
    { key: "batch", label: "Batch" },
  ],
  productFields: [
    { key: "name", label: "Product Name", type: "text" },
    { key: "category", label: "Category", type: "text" },
    { key: "brand", label: "Brand", type: "text" },
    { key: "batchNumber", label: "Batch Number", type: "text" },
    { key: "expiryDate", label: "Expiry Date", type: "date" },
    { key: "purchasePrice", label: "Purchase Price", type: "number" },
    { key: "sellingPrice", label: "Selling Price", type: "number" },
    { key: "mrp", label: "MRP", type: "number" },
    { key: "stock", label: "Opening Stock", type: "number" },
    { key: "supplier", label: "Supplier", type: "text" },
  ],
  reports: ["Stock Report", "Expiry Report", "Supplier Report"],
  quickActions: ["Bulk Update", "Barcode Print", "Low Stock Alert"],
};
