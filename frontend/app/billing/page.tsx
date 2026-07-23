"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import api from "@/lib/api";
import { formatINR, formatINRForPdf } from "@/lib/currency";
import { useSettings } from "@/hooks/useSettings";
import { waitForAuthenticatedSession } from "@/lib/session";

type Invoice = {
  id: string;
  invoiceNumber: string;
  customer: { name: string; email: string };
  lineItems: {
    quantity: number;
    unitPrice: number;
    product: { name: string };
  }[];
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  status: string;
  invoiceDate: string;
  notes?: string;
};

type Payment = {
  id: string;
  invoiceId?: string;
  amount: number;
  paymentMethod?: string;
};

type Customer = { id: string; name: string; email: string };
type Product = {
  id: string;
  name: string;
  stock: number;
  sellingPrice: number;
  barcode?: string;
};

type LineItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

const formatShortDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatRangeLabel = (range: string) => {
  if (range === "daily") return "Daily";
  if (range === "weekly") return "Weekly";
  if (range === "monthly") return "Monthly";
  if (range === "yearly") return "Yearly";
  return "All bills";
};

const getInvoiceStatusMeta = (status: string) => {
  const normalized = status.trim().toLowerCase();

  if (normalized === "paid") {
    return { label: "Paid", className: "bg-emerald-50 text-emerald-700" };
  }
  if (normalized === "pending") {
    return { label: "Pending", className: "bg-amber-50 text-amber-700" };
  }
  if (normalized === "partial") {
    return { label: "Partial", className: "bg-orange-50 text-orange-700" };
  }
  if (normalized === "cancelled") {
    return { label: "Cancelled", className: "bg-rose-50 text-rose-700" };
  }
  if (normalized === "created") {
    return { label: "Created", className: "bg-blue-50 text-blue-700" };
  }

  const titleCase = status
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return {
    label: titleCase || "Unknown",
    className: "bg-slate-100 text-slate-700",
  };
};

const formatPaymentMethod = (value: string) =>
  value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const getInvoiceShareText = (invoice: Invoice, paidAmount: number) => {
  const lines = [
    `Invoice: ${invoice.invoiceNumber}`,
    `Customer: ${invoice.customer.name}`,
    `Date: ${formatShortDate(invoice.invoiceDate)}`,
    `Status: ${getInvoiceStatusMeta(invoice.status).label}`,
    "",
    "Line Items:",
    ...invoice.lineItems.map(
      (item) =>
        `- ${item.product.name} x${item.quantity} = ${formatINR(item.quantity * item.unitPrice)}`,
    ),
    "",
    `Subtotal: ${formatINR(invoice.subtotal)}`,
    `GST: ${formatINR(invoice.gstAmount)}`,
    `Total: ${formatINR(invoice.totalAmount)}`,
    `Paid: ${formatINR(paidAmount)}`,
    `Pending: ${formatINR(Math.max(0, invoice.totalAmount - paidAmount))}`,
  ];

  if (invoice.notes) {
    lines.push("", `Notes: ${invoice.notes}`);
  }

  return lines.join("\n");
};

const getInvoiceFileName = (invoiceNumber: string) =>
  `${invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, "_")}.pdf`;

const numberToWords = (num: number): string => {
  if (num === 0) return "Zero";
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const convert = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + convert(n % 10000000) : "");
  };
  return convert(Math.round(num)) + " Rupees Only";
};

const downloadInvoicePdf = (invoice: Invoice, paidAmount: number, paymentMethod?: string, settings?: any) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  
  // Tax Invoice Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("TAX INVOICE", margin, margin + 4);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setDrawColor(150, 150, 150);
  doc.rect(margin + 25, margin, 40, 5);
  doc.text("ORIGINAL FOR RECIPIENT", margin + 27, margin + 3.5);
  
  // Top boxes layout
  doc.setDrawColor(0, 0, 0);
  
  // Box 1 (Shop Details) & Box 2 (Invoice Details)
  const topBoxY = margin + 8;
  const topBoxHeight = 25;
  const midDividerX = pageWidth / 2;
  
  doc.rect(margin, topBoxY, pageWidth - 2 * margin, topBoxHeight); // Outer box
  doc.line(midDividerX, topBoxY, midDividerX, topBoxY + topBoxHeight); // Vertical divider
  
  // Shop details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  const shopName = settings?.businessName || "SMV ENTERPRIZES";
  doc.text(shopName, margin + 2, topBoxY + 5);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const addressText = settings?.address || "HPJC+8F8, Phase 1, Hinjawadi Rajiv Gandhi Infotech Park,\nHinjawadi, Pimpri-Chinchwad, Maharashtra, 411057";
  const addressLines = doc.splitTextToSize(addressText, midDividerX - margin - 4);
  doc.text(addressLines, margin + 2, topBoxY + 10);
  
  const afterAddressY = topBoxY + 10 + (addressLines.length * 4);
  doc.setFont("helvetica", "bold");
  doc.text(`GSTIN: ${settings?.gstNumber || "N/A"}`, margin + 2, afterAddressY);
  
  // Invoice details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Invoice No.", midDividerX + 10, topBoxY + 8);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.invoiceNumber, midDividerX + 10, topBoxY + 12);
  
  doc.setFont("helvetica", "bold");
  doc.text("Invoice Date", midDividerX + 50, topBoxY + 8);
  doc.setFont("helvetica", "normal");
  doc.text(formatShortDate(invoice.invoiceDate), midDividerX + 50, topBoxY + 12);
  
  // Box 3 (Bill To) & Box 4 (Ship To)
  const billBoxY = topBoxY + topBoxHeight;
  const billBoxHeight = 20;
  doc.rect(margin, billBoxY, pageWidth - 2 * margin, billBoxHeight);
  doc.line(midDividerX, billBoxY, midDividerX, billBoxY + billBoxHeight);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("BILL TO", margin + 2, billBoxY + 4);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(invoice.customer.name.toUpperCase(), margin + 2, billBoxY + 9);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Place of Supply: Maharashtra`, margin + 2, billBoxY + 14); // Hardcoded or dynamic
  
  doc.text("SHIP TO", midDividerX + 2, billBoxY + 4);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(invoice.customer.name.toUpperCase(), midDividerX + 2, billBoxY + 9);
  
  // Table
  const tableStartY = billBoxY + billBoxHeight;
  
  const tableData = invoice.lineItems.map((item, index) => [
    index + 1,
    item.product.name,
    String(item.quantity),
    formatINRForPdf(item.unitPrice).replace("Rs. ", "").replace("₹", ""),
    formatINRForPdf(item.quantity * item.unitPrice).replace("Rs. ", "").replace("₹", "")
  ]);
  
  autoTable(doc, {
    startY: tableStartY,
    head: [['S.NO.', 'ITEMS', 'QTY.', 'RATE', 'AMOUNT']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8, textColor: 0, font: "helvetica", lineWidth: 0.1, lineColor: 0 },
    headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold', halign: 'center' },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { halign: 'left', cellWidth: 'auto' },
      2: { halign: 'right', cellWidth: 25 },
      3: { halign: 'right', cellWidth: 25 },
      4: { halign: 'right', cellWidth: 25 },
    },
    margin: { left: margin, right: margin }
  });
  
  let finalY = (doc as any).lastAutoTable.finalY;
  
  // Totals rows manually below table
  doc.setDrawColor(0);
  doc.setLineWidth(0.1);
  const rowHeight = 6;
  const col4X = pageWidth - margin - 25;
  const col3X = pageWidth - margin - 50;
  
  // TOTAL
  doc.rect(margin, finalY, pageWidth - 2 * margin, rowHeight);
  doc.line(col3X, finalY, col3X, finalY + rowHeight);
  doc.line(col4X, finalY, col4X, finalY + rowHeight);
  
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL", col3X - 5, finalY + 4, { align: "right" });
  doc.text(invoice.lineItems.reduce((acc, it) => acc + it.quantity, 0).toString(), col4X - 2, finalY + 4, { align: "right" });
  doc.text(formatINRForPdf(invoice.subtotal).replace("Rs. ", "").replace("₹", ""), pageWidth - margin - 2, finalY + 4, { align: "right" });
  finalY += rowHeight;
  

  
  // CURRENT BALANCE
  doc.rect(margin, finalY, pageWidth - 2 * margin, rowHeight);
  doc.line(col4X, finalY, col4X, finalY + rowHeight);
  doc.setFont("helvetica", "bold");
  doc.text("CURRENT BALANCE", col4X - 5, finalY + 4, { align: "right" });
  doc.text(formatINRForPdf(invoice.totalAmount).replace("Rs. ", "").replace("₹", ""), pageWidth - margin - 2, finalY + 4, { align: "right" });
  finalY += rowHeight;
  
  // Tax Breakdown Table
  // Assuming 18% GST default, split into 9% CGST and 9% SGST
  const taxRate = 9;
  const cgstAmount = invoice.gstAmount / 2;
  const sgstAmount = invoice.gstAmount / 2;
  
  autoTable(doc, {
    startY: finalY + 2,
    head: [
      [
        { content: 'HSN/SAC', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'Taxable Value', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'CGST', colSpan: 2, styles: { halign: 'center' } },
        { content: 'SGST', colSpan: 2, styles: { halign: 'center' } },
        { content: 'Total Tax Amount', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }
      ],
      [
        { content: 'Rate', styles: { halign: 'center' } },
        { content: 'Amount', styles: { halign: 'center' } },
        { content: 'Rate', styles: { halign: 'center' } },
        { content: 'Amount', styles: { halign: 'center' } }
      ]
    ],
    body: [
      [
        '2201', 
        formatINRForPdf(invoice.subtotal).replace("Rs. ", "").replace("₹", ""),
        `${taxRate}%`,
        formatINRForPdf(cgstAmount).replace("Rs. ", "").replace("₹", ""),
        `${taxRate}%`,
        formatINRForPdf(sgstAmount).replace("Rs. ", "").replace("₹", ""),
        formatINRForPdf(invoice.gstAmount).replace("Rs. ", "").replace("₹", "")
      ],
      [
        { content: 'Total', styles: { fontStyle: 'bold', halign: 'right' } },
        { content: formatINRForPdf(invoice.subtotal).replace("Rs. ", "").replace("₹", ""), styles: { fontStyle: 'bold', halign: 'right' } },
        '',
        { content: formatINRForPdf(cgstAmount).replace("Rs. ", "").replace("₹", ""), styles: { fontStyle: 'bold', halign: 'right' } },
        '',
        { content: formatINRForPdf(sgstAmount).replace("Rs. ", "").replace("₹", ""), styles: { fontStyle: 'bold', halign: 'right' } },
        { content: formatINRForPdf(invoice.gstAmount).replace("Rs. ", "").replace("₹", ""), styles: { fontStyle: 'bold', halign: 'right' } }
      ]
    ],
    theme: 'grid',
    styles: { fontSize: 8, textColor: 0, font: "helvetica", lineWidth: 0.1, lineColor: 0 },
    headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
    margin: { left: margin, right: margin }
  });
  
  finalY = (doc as any).lastAutoTable.finalY;
  
  // Total Amount (in words)
  doc.rect(margin, finalY, pageWidth - 2 * margin, 10);
  doc.setFont("helvetica", "normal");
  doc.text("Total Amount (in words)", margin + 2, finalY + 4);
  doc.setFont("helvetica", "bold");
  doc.text(numberToWords(invoice.totalAmount), margin + 2, finalY + 8);
  finalY += 10;
  
  // Footer: Terms and Conditions & Authorized Signatory
  doc.rect(margin, finalY, pageWidth - 2 * margin, 20);
  doc.line(pageWidth / 2, finalY, pageWidth / 2, finalY + 20);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Terms and Conditions", margin + 2, finalY + 4);
  doc.text("1. Goods once sold will not be taken back or exchanged", margin + 2, finalY + 8);
  doc.text("2. All disputes are subject to [CITY] jurisdiction", margin + 2, finalY + 12);
  doc.text("only", margin + 2, finalY + 16);
  
  doc.text("Authorised Signatory For", pageWidth - margin - 2, finalY + 14, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.text(shopName, pageWidth - margin - 2, finalY + 18, { align: "right" });
  
  doc.save(getInvoiceFileName(invoice.invoiceNumber));
};

export default function BillingPage() {
  const queryClient = useQueryClient();
  const barcodeInputRef = useRef<HTMLInputElement | null>(null);
  const barcodeScanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [invoiceEditForm, setInvoiceEditForm] = useState({
    status: "Pending",
    notes: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [billSearch, setBillSearch] = useState("");
  const [billRange, setBillRange] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { productId: "", quantity: 0, unitPrice: 0 },
  ]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const { settings } = useSettings();
  const [applyGst, setApplyGst] = useState(true);
  const [canOverridePrice, setCanOverridePrice] = useState(false);
  const [formData, setFormData] = useState({
    customerId: "",
    notes: "",
    gst: 18,
    barcodeInput: "",
    paymentMethod: "upi",
    paymentStatus: "Paid",
    paidAmount: "",
  });

  useEffect(() => {
    if (settings) {
      setApplyGst(settings.taxCalculation ?? true);
      setFormData((prev) => ({
        ...prev,
        gst: settings.defaultGst ?? 18,
      }));
    }
  }, [settings]);

  useEffect(() => {
    const loadSession = async () => {
      const session = await waitForAuthenticatedSession();
      if (session?.user) {
        if (session.user.role === "OWNER" || session.user.canOverridePrice) {
          setCanOverridePrice(true);
        }
      }
    };
    void loadSession();
  }, []);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: "",
    phone: "",
    address: "",
    gstin: "",
  });
  const [submittingCustomer, setSubmittingCustomer] = useState(false);

  const {
    data: invoices = [],
    isLoading: invoicesLoading,
    isError: invoicesError,
  } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const res = await api.get<Invoice[]>("/invoices");
      return res.data;
    },
  });

  const {
    data: customers = [],
    isLoading: customersLoading,
    isError: customersError,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await api.get<Customer[]>("/customers");
      return res.data;
    },
  });

  const {
    data: products = [],
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery({
    queryKey: ["products", { status: "active" }],
    queryFn: async () => {
      const res = await api.get<Product[]>("/products", { params: { status: "active" } });
      return res.data;
    },
  });

  const {
    data: payments = [],
    isLoading: paymentsLoading,
    isError: paymentsError,
  } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const res = await api.get<Payment[]>("/payments");
      return res.data;
    },
  });

  const loading =
    invoicesLoading || customersLoading || productsLoading || paymentsLoading;
  const hasError =
    invoicesError || customersError || productsError || paymentsError;

  useEffect(() => {
    if (showForm) {
      window.requestAnimationFrame(() => {
        barcodeInputRef.current?.focus();
        barcodeInputRef.current?.select();
      });
    }
  }, [showForm]);

  useEffect(() => {
    return () => {
      if (barcodeScanTimerRef.current) {
        clearTimeout(barcodeScanTimerRef.current);
      }
    };
  }, []);

  const invoicePaidAmounts = useMemo(() => {
    const map = new Map<string, number>();
    payments.forEach((p) => {
      if (p.invoiceId) {
        map.set(p.invoiceId, (map.get(p.invoiceId) || 0) + p.amount);
      }
    });
    return map;
  }, [payments]);

  const getInvoicePaidAmount = (invoiceId: string) =>
    invoicePaidAmounts.get(invoiceId) || 0;

  const filteredCustomers = useMemo(() => {
    const query = customerSearch.trim().toLowerCase();
    if (!query) return customers.slice(0, 100);
    return customers.filter((c) => c.name.toLowerCase().includes(query)).slice(0, 100);
  }, [customers, customerSearch]);

  const customerOptions = useMemo(() => {
    const list = [...filteredCustomers];
    if (formData.customerId && !list.some((c) => c.id === formData.customerId)) {
      const selectedCust = customers.find((c) => c.id === formData.customerId);
      if (selectedCust) {
        list.push(selectedCust);
      }
    }
    return list;
  }, [filteredCustomers, formData.customerId, customers]);

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    if (!query) return products.slice(0, 100);
    return products.filter((p) => p.name.toLowerCase().includes(query)).slice(0, 100);
  }, [products, productSearch]);

  const getProductOptionsForLineItem = (selectedProductId: string) => {
    const list = [...filteredProducts];
    if (selectedProductId && !list.some((p) => p.id === selectedProductId)) {
      const selectedProd = products.find((p) => p.id === selectedProductId);
      if (selectedProd) {
        list.push(selectedProd);
      }
    }
    return list;
  };

  const matchesBillRange = (invoiceDate: string) => {
    if (billRange === "all") return true;

    const invoice = new Date(invoiceDate);
    const today = new Date();
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    if (billRange === "daily") {
      return invoice >= startOfToday && invoice <= endOfToday;
    }

    if (billRange === "weekly") {
      const startOfWeek = new Date(startOfToday);
      const day = startOfWeek.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      startOfWeek.setDate(startOfWeek.getDate() + diff);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      return invoice >= startOfWeek && invoice <= endOfWeek;
    }

    if (billRange === "monthly") {
      return (
        invoice.getFullYear() === today.getFullYear() &&
        invoice.getMonth() === today.getMonth()
      );
    }

    if (billRange === "yearly") {
      return invoice.getFullYear() === today.getFullYear();
    }

    return true;
  };

  const normalizedBillSearch = billSearch.trim().toLowerCase();
  const visibleInvoices = invoices.filter((invoice) => {
    const searchHaystack = [
      invoice.invoiceNumber,
      invoice.customer.name,
      invoice.customer.email,
      invoice.notes || "",
      getInvoiceStatusMeta(invoice.status).label,
      ...invoice.lineItems.map((item) => item.product.name),
    ]
      .join(" ")
      .toLowerCase();

    return (
      matchesBillRange(invoice.invoiceDate) &&
      (normalizedBillSearch === "" ||
        searchHaystack.includes(normalizedBillSearch))
    );
  });
  const visibleBillTotal = visibleInvoices.reduce(
    (sum, invoice) => sum + invoice.totalAmount,
    0,
  );
  const visiblePaidTotal = visibleInvoices.reduce(
    (sum, invoice) => sum + getInvoicePaidAmount(invoice.id),
    0,
  );

  const handleDownloadInvoice = (invoice: Invoice) => {
    const paidAmount = getInvoicePaidAmount(invoice.id);
    const invoicePayments = payments.filter(p => p.invoiceId === invoice.id);
    const paymentMethod = invoicePayments.length > 0 ? invoicePayments[0].paymentMethod : undefined;
    downloadInvoicePdf(invoice, paidAmount, paymentMethod, settings);
  };

  const handleShareInvoice = async (invoice: Invoice) => {
    const paidAmount = getInvoicePaidAmount(invoice.id);
    const content = getInvoiceShareText(invoice, paidAmount);

    if (navigator.share) {
      await navigator.share({
        title: `Invoice ${invoice.invoiceNumber}`,
        text: content,
      });
      return;
    }

    await navigator.clipboard.writeText(content);
    alert("Invoice details copied to clipboard");
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { productId: "", quantity: 0, unitPrice: 0 }]);
  };

  const removeLineItem = (idx: number) => {
    setLineItems(lineItems.filter((_, i) => i !== idx));
  };

  const updateLineItem = (
    idx: number,
    field: keyof LineItem,
    value: LineItem[keyof LineItem],
  ) => {
    setLineItems((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    const gst = applyGst ? (subtotal * (formData.gst / 100)) : 0;
    return { subtotal, gst, total: subtotal + gst };
  };

  const handleBarcodeInput = async (barcode: string) => {
    const code = barcode.trim();
    if (!code) return;

    if (barcodeScanTimerRef.current) {
      clearTimeout(barcodeScanTimerRef.current);
      barcodeScanTimerRef.current = null;
    }

    try {
      const foundInCache = products.find((p) => p.barcode === code);
      const foundProduct = foundInCache
        ? foundInCache
        : (
            await api.get<Product[]>("/products", { params: { barcode: code, status: "active" } })
          ).data.find((p) => p.barcode === code);

      if (foundProduct) {
        if (foundProduct.stock <= 0) {
          alert("This product is out of stock");
          return;
        }

        setLineItems((prev) => [
          ...prev,
          {
            productId: foundProduct.id,
            quantity: 1,
            unitPrice: foundProduct.sellingPrice,
          },
        ]);
        setFormData((prev) => ({ ...prev, barcodeInput: "" }));
        window.requestAnimationFrame(() => {
          barcodeInputRef.current?.focus();
        });
      } else {
        alert("Product not found");
      }
    } catch (error) {
      console.error("Error scanning barcode:", error);
      alert("Failed to scan barcode");
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.customerId ||
      lineItems.some((item) => !item.productId || item.quantity === 0)
    ) {
      alert("Please select customer and add line items");
      return;
    }

    for (const item of lineItems) {
      const selectedProduct = products.find((p) => p.id === item.productId);
      if (!selectedProduct) {
        alert("Selected product not found");
        return;
      }

      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty <= 0) {
        alert(`Please enter a valid quantity for ${selectedProduct.name}`);
        return;
      }

      if (qty > selectedProduct.stock) {
        alert(
          `${selectedProduct.name}: entered quantity (${qty}) is more than stock (${selectedProduct.stock})`,
        );
        return;
      }
    }

    const { total } = calculateTotals();
    const isPending = formData.paymentStatus === "Pending";
    const paidAmount = isPending
      ? Math.max(0, Number(formData.paidAmount) || 0)
      : total;

    if (paidAmount > total) {
      alert("Paid amount cannot be greater than total amount");
      return;
    }

    setSubmitting(true);
    try {
      const invoiceRes = await api.post("/invoices", {
        customerId: formData.customerId,
        lineItems: lineItems.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          unitPrice: parseFloat(String(item.unitPrice)),
        })),
        status: formData.paymentStatus,
        notes: formData.notes || "",
        gstRate: applyGst ? formData.gst : 0,
      });

      if (paidAmount > 0) {
        await api.post("/payments", {
          customerId: formData.customerId,
          invoiceId: invoiceRes.data.id,
          amount: paidAmount,
          paymentMethod: formData.paymentMethod,
          notes: `Payment for invoice ${invoiceRes.data.invoiceNumber}`,
        });
      }

      setShowForm(false);
      setFormData({
        customerId: "",
        notes: "",
        gst: 18,
        barcodeInput: "",
        paymentMethod: "upi",
        paymentStatus: "Paid",
        paidAmount: "",
      });
      setLineItems([{ productId: "", quantity: 0, unitPrice: 0 }]);
      await queryClient.invalidateQueries({ queryKey: ["invoices"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["payments"] });
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
    } catch (error) {
      console.error("Error creating invoice:", error);
      const message =
        (
          error as {
            response?: { data?: { error?: string; message?: string } };
          }
        ).response?.data?.error ||
        (
          error as {
            response?: { data?: { error?: string; message?: string } };
          }
        ).response?.data?.message ||
        "Failed to create invoice";
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const openInvoiceEditor = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setInvoiceEditForm({
      status: invoice.status,
      notes: invoice.notes || "",
    });
  };

  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;

    setSubmitting(true);
    try {
      await api.patch(`/invoices/${editingInvoice.id}`, invoiceEditForm);
      setEditingInvoice(null);
      setSelectedInvoice(null);
      await queryClient.invalidateQueries({ queryKey: ["invoices"] });
    } catch (error) {
      console.error("Error updating invoice:", error);
      alert("Failed to update invoice");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerForm.name || !newCustomerForm.phone) {
      alert("Please fill name and phone number");
      return;
    }

    setSubmittingCustomer(true);
    try {
      const res = await api.post("/customers", {
        ...newCustomerForm,
        status: "active",
      });
      setShowAddCustomerModal(false);
      setNewCustomerForm({ name: "", phone: "", address: "", gstin: "" });
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      setFormData(prev => ({ ...prev, customerId: res.data.id }));
      setCustomerSearch("");
    } catch (error) {
      console.error("Error adding customer:", error);
      alert("Failed to add customer.");
    } finally {
      setSubmittingCustomer(false);
    }
  };

  if (loading) {
    return <div className="text-slate-500">Loading billing...</div>;
  }

  if (hasError) {
    return <div className="text-red-600">Failed to load billing data.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Billing & Invoices</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Create Invoice
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_0.8fr_auto]">
          <div>
            <label className="block text-sm font-medium mb-1">
              Search past bills
            </label>
            <input
              type="text"
              value={billSearch}
              onChange={(e) => setBillSearch(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              placeholder="Invoice no, customer, email, notes, product"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date view</label>
            <select
              value={billRange}
              onChange={(e) => setBillRange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="all">All bills</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setBillSearch("");
                setBillRange("all");
              }}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
            >
              Clear filters
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-xs uppercase text-slate-500">Visible bills</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {visibleInvoices.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {formatRangeLabel(billRange)} view
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-xs uppercase text-slate-500">Billed amount</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {formatINR(visibleBillTotal)}
            </p>
            <p className="text-xs text-slate-500 mt-1">Filtered total</p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-xs uppercase text-slate-500">Collected</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {formatINR(visiblePaidTotal)}
            </p>
            <p className="text-xs text-slate-500 mt-1">Across visible bills</p>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold">Create New Invoice</h2>
          <form onSubmit={handleCreateInvoice} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium">
                    Customer *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddCustomerModal(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    + Add Customer
                  </button>
                </div>
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Search customer..."
                  className="w-full mb-2 px-3 py-2 border border-slate-300 rounded-lg"
                />
                <select
                  value={formData.customerId}
                  onChange={(e) =>
                    setFormData({ ...formData, customerId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Select customer</option>
                  {customerOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  GST % (Editable)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.gst}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gst: parseFloat(e.target.value),
                      })
                    }
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="18"
                  />
                  <button
                    type="button"
                    onClick={() => setApplyGst(!applyGst)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      applyGst
                        ? "bg-blue-600 text-white"
                        : "bg-slate-300 text-slate-700"
                    }`}
                  >
                    {applyGst ? "Applied" : "Skip"}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Scan Product Barcode
              </label>
              <div className="flex gap-2">
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={formData.barcodeInput}
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    setFormData({ ...formData, barcodeInput: nextValue });

                    if (barcodeScanTimerRef.current) {
                      clearTimeout(barcodeScanTimerRef.current);
                    }

                    const trimmed = nextValue.trim();
                    if (!trimmed) {
                      return;
                    }

                    barcodeScanTimerRef.current = setTimeout(() => {
                      void handleBarcodeInput(trimmed);
                    }, 180);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void handleBarcodeInput(formData.barcodeInput);
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="Scan barcode or enter product code"
                />
                <button
                  type="button"
                  onClick={() => handleBarcodeInput(formData.barcodeInput)}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
                >
                  Scan
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Or manually select products below
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">
                  Line Items *
                </label>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="text-sm text-blue-600 hover:underline"
                >
                  + Add Item
                </button>
              </div>
              <div className="relative mb-2">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  search
                </span>
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-1 border border-slate-300 rounded text-sm"
                />
              </div>
              <div className="space-y-2 border border-slate-200 rounded-lg p-3">
                {lineItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <select
                        value={item.productId}
                        onChange={(e) => {
                          const prod = products.find(
                            (p) => p.id === e.target.value,
                          );
                          updateLineItem(idx, "productId", e.target.value);
                          if (prod)
                            updateLineItem(idx, "unitPrice", prod.sellingPrice);
                        }}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                      >
                        <option value="">Select product</option>
                        {getProductOptionsForLineItem(item.productId).map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Stock: {p.stock},{" "}
                            {formatINR(p.sellingPrice)})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        value={item.quantity === 0 ? "" : item.quantity}
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (raw === "") {
                            updateLineItem(idx, "quantity", 0);
                            return;
                          }

                          updateLineItem(
                            idx,
                            "quantity",
                            Math.max(0, Number(raw) || 0),
                          );
                        }}
                        className="w-16 px-2 py-1 border border-slate-300 rounded text-sm"
                        placeholder="Qty"
                        title="Quantity"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        Stock:{" "}
                        {item.productId
                          ? (products.find((p) => p.id === item.productId)
                              ?.stock ?? "-")
                          : "-"}
                      </p>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitPrice === 0 ? "" : item.unitPrice}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === "") {
                          updateLineItem(idx, "unitPrice", 0);
                        } else {
                          updateLineItem(idx, "unitPrice", parseFloat(raw));
                        }
                      }}
                      onFocus={(e) => e.target.select()}
                      disabled={!canOverridePrice}
                      className="w-20 px-2 py-1 border border-slate-300 rounded text-sm disabled:opacity-50"
                      placeholder="Price"
                      title="Unit Price"
                    />
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(idx)}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded space-y-2">
              {(() => {
                const { subtotal, gst, total } = calculateTotals();
                const isPending = formData.paymentStatus === "Pending";
                const paidAmount = isPending
                  ? Math.max(0, Number(formData.paidAmount) || 0)
                  : total;
                const pendingAmount = Math.max(0, total - paidAmount);

                return (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>{formatINR(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>GST ({formData.gst}%):</span>
                      <span>{formatINR(gst)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatINR(total)}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-200 mt-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Payment Method
                        </label>
                        <select
                          value={formData.paymentMethod}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              paymentMethod: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        >
                          <option value="upi">UPI</option>
                          <option value="cash">Cash</option>
                          <option value="cheque">Cheque</option>
                          <option value="bank_transfer">Bank Transfer</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Payment Status
                        </label>
                        <select
                          value={formData.paymentStatus}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              paymentStatus: e.target.value,
                              paidAmount:
                                e.target.value === "Pending"
                                  ? formData.paidAmount
                                  : "",
                            })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        >
                          <option value="Paid">Paid</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </div>

                      {isPending && (
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Paid Amount
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max={total}
                            value={formData.paidAmount}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                paidAmount: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            placeholder="Enter paid amount"
                          />
                          <p className="text-xs text-slate-600 mt-1">
                            Pending: {formatINR(pendingAmount)}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                placeholder="Invoice notes..."
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {submitting ? "Creating..." : "Create Invoice"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-slate-400 text-white rounded-lg hover:bg-slate-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full min-w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Items
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Created
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Subtotal
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    GST (18%)
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Paid
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Pending
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {visibleInvoices.map((invoice) =>
                  (() => {
                    const paidAmount = getInvoicePaidAmount(invoice.id);
                    const pendingAmount = Math.max(
                      0,
                      invoice.totalAmount - paidAmount,
                    );
                    const statusMeta = getInvoiceStatusMeta(invoice.status);

                    return (
                      <tr
                        key={invoice.id}
                        className="hover:bg-slate-50 cursor-pointer"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {invoice.customer.name}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {invoice.lineItems.length}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {formatShortDate(invoice.invoiceDate)}
                        </td>
                        <td className="px-6 py-4">
                          {formatINR(invoice.subtotal)}
                        </td>
                        <td className="px-6 py-4">
                          {formatINR(invoice.gstAmount)}
                        </td>
                        <td className="px-6 py-4 font-bold">
                          {formatINR(invoice.totalAmount)}
                        </td>
                        <td className="px-6 py-4 text-emerald-700 font-semibold">
                          {formatINR(paidAmount)}
                        </td>
                        <td className="px-6 py-4 text-orange-700 font-semibold">
                          {formatINR(pendingAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center justify-center px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${
                              statusMeta.className
                            }`}
                          >
                            {statusMeta.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedInvoice(invoice);
                              }}
                              className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-md text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                            >
                              View Bill
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDownloadInvoice(invoice);
                              }}
                              className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
                            >
                              Download
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleShareInvoice(invoice);
                              }}
                              className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-md text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100"
                            >
                              Share
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })(),
                )}
              </tbody>
            </table>
            {visibleInvoices.length === 0 && (
              <div className="px-6 py-8 text-center text-slate-500">
                No invoices match the selected filters.
              </div>
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sticky top-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">
                  {selectedInvoice ? "Invoice Details" : "Billing Overview"}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedInvoice
                    ? "Full bill view with payment actions."
                    : "Use the search and date filters to track bills by day, week, month, or year."}
                </p>
              </div>
              {selectedInvoice && (
                <button
                  className="text-slate-400 hover:text-slate-600"
                  onClick={() => setSelectedInvoice(null)}
                >
                  ✕
                </button>
              )}
            </div>

            {!selectedInvoice ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase text-slate-500">
                    Active view
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {formatRangeLabel(billRange)} bills
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    Search: {billSearch.trim() || "all bills"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="text-xs uppercase text-slate-500">Bills</p>
                    <p className="mt-1 text-2xl font-bold">
                      {visibleInvoices.length}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="text-xs uppercase text-slate-500">Total</p>
                    <p className="mt-1 text-2xl font-bold">
                      {formatINR(visibleBillTotal)}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
                  Select any row to view the full bill, line items, payment
                  status, download the PDF, share it, or edit the invoice.
                </div>
              </div>
            ) : !editingInvoice ? (
              <>
                <div className="space-y-4 pb-4 border-b">
                  <div>
                    <p className="text-xs text-slate-500 uppercase">
                      Invoice Number
                    </p>
                    <p className="font-bold text-slate-900">
                      {selectedInvoice.invoiceNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Customer</p>
                    <p className="font-bold text-slate-900">
                      {selectedInvoice.customer.name}
                    </p>
                    <p className="text-sm text-slate-600">
                      {selectedInvoice.customer.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Date</p>
                    <p className="font-bold text-slate-900">
                      {formatShortDate(selectedInvoice.invoiceDate)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 py-4 border-b">
                  <h4 className="font-bold text-slate-900 mb-3">Line Items</h4>
                  {selectedInvoice.lineItems.map((item, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-slate-200 p-3"
                    >
                      <div className="flex justify-between gap-3 text-sm">
                        <span className="text-slate-700 font-medium">
                          {item.product.name}
                        </span>
                        <span className="font-semibold">
                          {formatINR(item.quantity * item.unitPrice)}
                        </span>
                      </div>
                      <div className="mt-1 flex justify-between text-xs text-slate-500">
                        <span>Qty: {item.quantity}</span>
                        <span>Rate: {formatINR(item.unitPrice)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 py-4">
                  {(() => {
                    const paidAmount = getInvoicePaidAmount(selectedInvoice.id);
                    const pendingAmount = Math.max(
                      0,
                      selectedInvoice.totalAmount - paidAmount,
                    );

                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Subtotal</span>
                          <span className="font-medium">
                            {formatINR(selectedInvoice.subtotal)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">GST (18%)</span>
                          <span className="font-medium">
                            {formatINR(selectedInvoice.gstAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t">
                          <span>Total</span>
                          <span>{formatINR(selectedInvoice.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Paid Amount</span>
                          <span className="font-medium text-emerald-700">
                            {formatINR(paidAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Pending Amount</span>
                          <span className="font-medium text-orange-700">
                            {formatINR(pendingAmount)}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {selectedInvoice.notes && (
                  <div className="mt-4 p-3 bg-slate-50 rounded text-sm text-slate-700">
                    <p className="text-xs text-slate-500 uppercase mb-1">
                      Notes
                    </p>
                    <p>{selectedInvoice.notes}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadInvoice(selectedInvoice)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
                  >
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleShareInvoice(selectedInvoice)}
                    className="px-4 py-2 rounded-lg border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                  >
                    Share
                  </button>
                  <button
                    type="button"
                    onClick={() => openInvoiceEditor(selectedInvoice)}
                    className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-700 transition"
                  >
                    Edit Invoice
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleUpdateInvoice} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <select
                    value={invoiceEditForm.status}
                    onChange={(e) =>
                      setInvoiceEditForm({
                        ...invoiceEditForm,
                        status: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Notes
                  </label>
                  <textarea
                    value={invoiceEditForm.notes}
                    onChange={(e) =>
                      setInvoiceEditForm({
                        ...invoiceEditForm,
                        notes: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                  >
                    {submitting ? "Saving..." : "Save Status"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingInvoice(null)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {showAddCustomerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Customer</h2>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    value={newCustomerForm.name}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone *</label>
                  <input
                    type="text"
                    value={newCustomerForm.phone}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="+91-XXXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={newCustomerForm.gstin}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, gstin: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="27AABCU9603R1Z0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  value={newCustomerForm.address}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="Enter address"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCustomer}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submittingCustomer ? "Adding..." : "Add Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
