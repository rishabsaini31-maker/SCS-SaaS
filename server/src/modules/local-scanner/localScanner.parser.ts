import { regexLib } from "./localScanner.regex";

export interface ExtractedProductItem {
  productName: string;
  productCode?: string | null;
  description?: string | null;
  barcode?: string | null;
  hsn?: string | null;
  quantity: number;
  unit?: string | null;
  purchaseRate: number;
  mrp?: number | null;
  gstPercent?: number | null;
  discount?: number | null;
  batchNumber?: string | null;
  expiryDate?: string | null;
  amount: number;
  matchedProductId?: string;
  matchedProductName?: string;
  matchType?: string;
  pastPrice?: number;
}

export interface ExtractedBillData {
  scanId: string;
  supplierName?: string;
  supplierGstin?: string;
  supplierAddress?: string | null;
  invoiceNumber?: string;
  invoiceDate?: string;
  poNumber?: string | null;
  paymentTerms?: string | null;
  dueDate?: string | null;
  subtotal?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  cess?: number;
  discount?: number;
  taxAmount?: number;
  roundOff?: number;
  freight?: number;
  grandTotal?: number;
  lineItems: ExtractedProductItem[];
  debug?: any;
}

export function parseLocalInvoice(rawText: string, scanId: string): ExtractedBillData {
  const result: ExtractedBillData = {
    scanId,
    lineItems: []
  };

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  
  // Extract top-level fields
  for (const line of lines) {
    if (!result.supplierGstin) {
      const match = line.match(regexLib.gstin);
      if (match) result.supplierGstin = match[0].toUpperCase();
    }
    if (!result.invoiceNumber) {
      const match = line.match(regexLib.invoiceNumberKeys);
      if (match) result.invoiceNumber = match[1];
    }
    if (!result.invoiceDate) {
      const match = line.match(regexLib.invoiceDateKeys);
      if (match) result.invoiceDate = match[1];
    }
    if (!result.poNumber) {
      const match = line.match(regexLib.poNumberKeys);
      if (match) result.poNumber = match[1];
    }
    // Very basic supplier name heuristic (first few lines)
    if (!result.supplierName && lines.indexOf(line) < 5) {
      if (!line.toLowerCase().includes("invoice") && !line.toLowerCase().includes("date") && !line.match(regexLib.gstin)) {
        result.supplierName = line;
      }
    }
  }

  // Very basic Table Extraction Heuristics (Line Items)
  // We'll look for lines that look like: <Product Name> <Qty> <Rate> <Amount>
  // This is a naive regex parser for demonstration; in reality, table parsing requires complex positional logic.
  let inTable = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] || "";
    if (!line) continue;
    
    // Check for table headers to start parsing
    if (regexLib.qtyHeader.test(line) && regexLib.amountHeader.test(line)) {
      inTable = true;
      continue;
    }

    if (inTable) {
      // End of table check (totals line)
      if (/total|subtotal|discount|cgst|sgst|amount chargeable/i.test(line)) {
        inTable = false;
        
        // Extract totals from this line if possible
        if (/total/i.test(line)) {
           const amtMatch = line.match(/(\d+(?:,\d+)*(?:\.\d{1,2})?)$/);
           if (amtMatch && amtMatch[1]) result.grandTotal = parseFloat(amtMatch[1].replace(/,/g, ""));
        }
        continue;
      }

      // Try to parse a product row: (Name) (HSN) (Qty) (Rate) (Amount)
      // E.g., "SD-23 8414 10 250.00 2500.00"
      const rowTokens = line.split(/\s+/);
      if (rowTokens.length >= 3) {
        const lastToken = rowTokens[rowTokens.length - 1] || "";
        const secondLastToken = rowTokens[rowTokens.length - 2] || "";
        const thirdLastToken = rowTokens[rowTokens.length - 3] || "";

        const amount = parseFloat(lastToken.replace(/,/g, ""));
        const rate = parseFloat(secondLastToken.replace(/,/g, ""));
        let qty = parseFloat(thirdLastToken.replace(/,/g, ""));
        
        // Fallback for missing/merged tokens
        if (isNaN(qty)) qty = 1;

        if (!isNaN(amount) && !isNaN(rate)) {
          let nameTokens = rowTokens.slice(0, rowTokens.length - (isNaN(qty) ? 2 : 3));
          
          // Strip Sr. No. if the first token is purely numeric
          if (nameTokens.length > 1 && /^\d+$/.test(nameTokens[0] || "")) {
             nameTokens.shift();
          }

          result.lineItems.push({
            productName: nameTokens.join(" ") || "UNKNOWN PRODUCT",
            quantity: qty,
            purchaseRate: rate,
            amount: amount,
          });
        }
      }
    }
  }

  return result;
}
