// Format number as Indian Rupees (₹)
export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format amount without currency symbol (for PDF generation)
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format for PDF - uses "Rs." prefix instead of ₹ symbol (jsPDF font compatibility)
export const formatINRForPdf = (amount: number): string => {
  const formatted = formatAmount(amount);
  return `Rs. ${formatted}`;
};
