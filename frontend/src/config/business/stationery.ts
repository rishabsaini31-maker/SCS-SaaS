import type { BusinessConfig } from "./types";

export const stationeryConfig: BusinessConfig = {
  key: "STATIONERY",
  label: "Stationery",
  dashboardCards: [
    { key: "inventoryValue", title: "Inventory Value", description: "Stock value" },
    { key: "lowStock", title: "Low Stock", description: "Need restock" },
    { key: "topBrands", title: "Top Brands", description: "Best sellers" },
    { key: "todaysSales", title: "Today's Sales", description: "Sales today" },
  ],
  tableColumns: [
    { key: "image", label: "Image" },
    { key: "product", label: "Product" },
    { key: "size", label: "Notebook Size" },
    { key: "pages", label: "Pages" },
    { key: "paperType", label: "Paper Type" },
    { key: "brand", label: "Brand" },
    { key: "stock", label: "Stock" },
    { key: "price", label: "Price" },
  ],
  filters: [
    { key: "category", label: "Category" },
    { key: "brand", label: "Brand" },
    { key: "paperType", label: "Paper Type" },
  ],
  productFields: [
    { key: "name", label: "Product", type: "text" },
    { key: "notebookSize", label: "Notebook Size", type: "text" },
    { key: "pages", label: "Pages", type: "number" },
    { key: "paperType", label: "Paper Type", type: "text" },
    { key: "brand", label: "Brand", type: "text" },
    { key: "purchasePrice", label: "Purchase Price", type: "number" },
    { key: "sellingPrice", label: "Selling Price", type: "number" },
    { key: "stock", label: "Stock", type: "number" },
  ],
  reports: ["Category Report", "Brand Report"],
  quickActions: ["Reorder", "Bundle Pack", "Brand Offer"],
};
