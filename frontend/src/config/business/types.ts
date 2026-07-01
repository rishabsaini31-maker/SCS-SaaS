export type BusinessType =
  | "WHOLESALE_DISTRIBUTOR"
  | "GROCERY"
  | "CLOTHING"
  | "ELECTRONICS"
  | "MEDICAL"
  | "HARDWARE"
  | "STATIONERY"
  | "MOBILE"
  | "COSMETICS"
  | "RESTAURANT"
  | "GENERAL_RETAIL";

export type BusinessConfig = {
  key: BusinessType;
  label: string;
  dashboardCards: Array<{ key: string; title: string; description: string }>;
  tableColumns: Array<{ key: string; label: string }>;
  filters: Array<{ key: string; label: string }>;
  productFields: Array<{ key: string; label: string; type: "text" | "number" | "date" | "select" }>;
  reports: string[];
  quickActions: string[];
};
