export interface InvoiceItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface InvoiceInput {
  customerId: string;
  items: InvoiceItem[];
  date?: string;
  notes?: string;
}
