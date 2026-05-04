export const mockInventory = [
  {
    id: "1",
    name: "Titanium Chronograph",
    category: "Electronics",
    stock: 142,
    price: 299.0,
    barcode: "8429103948",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAO6dgf_9K-Smxq18SNgWgWekODvz7x7vxPZ-j5e6bxI7UBQBZ37JLvkbF5l8MPFCgvRrxNxWxXmvlO9RrP5xxuL1DztXYLyycXbXJEwv-WW3zkriqWD8e7FUkvk0SHd4VBWRqaL7DAXM3U0GFpVCLb-P9PS9TQnyoKUmUBtCm5DZeBv_t-3EauIdXvOl8PyXO32B93BGrBGXmPew-Y9yNxujaSFAPln8Ltibw1DMsYu74T84rzIIcn-3OR-3oxEoj-iDOW3jmSdQQ",
    status: "in-stock",
    stockRatio: 70,
  },
  {
    id: "2",
    name: "SonicWave Over-Ear",
    category: "Electronics",
    stock: 4,
    price: 189.5,
    barcode: "5529188371",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAppNp6ZtDa9vTWZ7rWmvbeFxzLCYJWla8b59WpgW_nGSyHjXFz-FYd03GruudE4ZDYHbbHcWA_-29a-X-BQ5ljo4tkmOGDll8kPltoQPOdDP9P1Uewk-MqkLEOMFjIeZv2tHlCj0c-3lApcg3c2v7UxeqGsis6xMp-xEuqIFsff0Lf5RZ1Lkl1OyYtFXW-ZBYBRI_AIqpyFivAp4bk6lkVrDxG_26enj1fbKtNa1cBdwQ08xWB115kw0ou0sPGLy4C7gYVPt51PbU",
    status: "low-stock",
    stockRatio: 10,
  },
  {
    id: "3",
    name: "Velocity X-1 Trainers",
    category: "Apparel",
    stock: 88,
    price: 120.0,
    barcode: "3391028475",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBUR1Cu5jjpcoREVYtAtn05qXJKNfMJInGNHS7dfgw8sD31zebwtf3cva4PV6h-GHqZYPDwKr8Xbt2QGi8tLuwAGPzOYG-eNhjGbY67rEr-J5AhMb7A5Msx8cYRo6_VA5ZJ0knqL5DxGpF0XY1k1Cnw3FV68jcpcbhth-nVb0fqHlyABWcAadelxJ9Zu9qFAxqEdP-uDDoEcqEOjjKOY0a4xg907beRuRYME2sDuuI6Rk-w_3V9fioF_49dWoYQoLKMpleVZA7JoGQ",
    status: "in-stock",
    stockRatio: 45,
  },
  {
    id: "4",
    name: "RetroCam 400",
    category: "Electronics",
    stock: 0,
    price: 45.0,
    barcode: "1109283746",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCnP8EyIf71LrJqDF7xrBkMcZALw9TY7nHk3mLRAHglpXOKt29ZxpGZQM8-29zMqySZQr_a2EoJY9fiBWB7IQXxeZNlHWcf6bPZzsvlnXu3UyP7Ig1V4cgO7sd1TSH0DvEwgQDCI9Uf5pXl6VRqRCcbBk_zNKnlJKJ39i_aOKaTr7R2Z1Qg8ZD3mePDJQLDJknWRkrGDw2qGFyP8Tr9enn6EbvzrEhtcG0L0TT_rtIrxldg4ItDykTZ7Nxma7JFnOSeq4h27BNRMHI",
    status: "out-of-stock",
    stockRatio: 0,
  },
];

export const mockDashboardMetrics = {
  totalSales: 48290.0,
  salesTrend: "+12.4%",
  totalOrders: 1284,
  ordersTrend: "Stable",
  averageMargin: "24.8%",
  pendingInvoices: 14,
  pendingInvoicesAmount: 12450,
};

export const mockRecentTransactions = [
  {
    id: "INV-9021",
    party: "Modern Retailers Pvt Ltd",
    type: "Bank Transfer",
    amount: 12400.0,
    status: "SUCCESS",
    date: "Today, 02:45 PM",
  },
  {
    id: "CSH-4421",
    party: "Sharma General Stores",
    type: "Cash",
    amount: 3200.0,
    status: "SUCCESS",
    date: "Today, 11:15 AM",
  },
  {
    id: "UPI-8812",
    party: "Global Imports Co.",
    type: "UPI",
    amount: 24500.0,
    status: "PENDING",
    date: "Yesterday, 06:10 PM",
  },
  {
    id: "INV-8955",
    party: "Krishna Logistics",
    type: "Bank Transfer",
    amount: 18250.0,
    status: "FAILED",
    date: "Yesterday, 10:20 AM",
  },
];

export const mockParties = [
  {
    id: "1",
    name: "Metro Logistics Group",
    balance: -12450.0,
    phone: "+1 (555) 012-4455",
    status: "Debit",
  },
  {
    id: "2",
    name: "Sunrise Foods Co.",
    balance: 3210.5,
    phone: "+1 (555) 088-1293",
    status: "Credit",
  },
  {
    id: "3",
    name: "Global Distribution Inc.",
    balance: -8900.0,
    phone: "+1 (555) 044-8822",
    status: "Debit",
  },
  {
    id: "4",
    name: "Alpha Retailers",
    balance: 1120.0,
    phone: "+1 (555) 099-3311",
    status: "Credit",
  },
  {
    id: "5",
    name: "Pacific Imports",
    balance: 0.0,
    phone: "+1 (555) 077-4400",
    status: "Settled",
  },
];
