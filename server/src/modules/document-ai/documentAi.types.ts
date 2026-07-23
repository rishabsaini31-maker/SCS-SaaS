export interface DocumentAiExtractedInvoice {
  supplierName?: string;
  supplierGstin?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  poNumber?: string;
  paymentTerms?: string;
  deliveryChallanNumber?: string;
  subtotal?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  cess?: number;
  discount?: number;
  roundOff?: number;
  freight?: number;
  grandTotal?: number;
  lineItems: DocumentAiLineItem[];
}

export interface DocumentAiLineItem {
  productDescription: string;
  productCode?: string;
  barcode?: string;
  hsn?: string;
  quantity: number;
  unit?: string;
  rate: number;
  mrp?: number;
  gstRate?: number;
  discount?: number;
  batch?: string;
  expiry?: string;
  amount: number;
  confidenceScore: number;
}
