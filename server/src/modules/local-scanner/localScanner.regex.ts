export const regexLib = {
  gstin: /[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}/i,
  hsn: /\b([0-9]{4,8})\b/,
  pan: /[A-Z]{5}[0-9]{4}[A-Z]{1}/i,
  
  invoiceNumberKeys: /(?:invoice|inv|bill|cash memo)(?:\s*no\.?|#|\s*number)?\s*[:\-]?\s*([A-Za-z0-9\-\/]+)/i,
  invoiceDateKeys: /(?:date|dt)\s*[:\-]?\s*(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4}|\d{4}[-\/\.]\d{1,2}[-\/\.]\d{1,2})/i,
  poNumberKeys: /(?:po|purchase order)(?:\s*no\.?|#|\s*number)?\s*[:\-]?\s*([A-Za-z0-9\-\/]+)/i,
  deliveryChallanKeys: /(?:challan|dc|delivery)(?:\s*no\.?|#|\s*number)?\s*[:\-]?\s*([A-Za-z0-9\-\/]+)/i,
  vehicleKeys: /(?:vehicle|veh)(?:\s*no\.?|#|\s*number)?\s*[:\-]?\s*([A-Za-z0-9\-\s]+)/i,
  
  phone: /(?:ph|phone|mob|mobile|contact)?\s*[:\-]?\s*(\+?91[\-\s]?\d{10}|\d{10}|\d{5}\s\d{5})/i,
  email: /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i,
  pinCode: /\b([1-9][0-9]{5})\b/,

  // Table row headers (Qty, Rate, Amount, etc.)
  qtyHeader: /(?:qty|quantity|qnty)/i,
  rateHeader: /(?:rate|price|mrp)/i,
  amountHeader: /(?:amount|amt|total|value)/i,
  hsnHeader: /(?:hsn|sac)/i,
  gstHeader: /(?:gst|cgst|sgst|igst|tax)/i,
  
  // Generic currency/amount format
  amount: /(?:rs\.?|₹|inr)?\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)/i,
};
