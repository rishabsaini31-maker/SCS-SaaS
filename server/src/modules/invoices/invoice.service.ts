import { AppError } from "../../common/errors/AppError";
import { InvoiceInput } from "./invoice.types";

// This is a placeholder for actual DB logic
export async function createInvoiceService(data: InvoiceInput) {
  // 1. Calculate subtotal, GST, total
  const subtotal = data.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );
  const gst = subtotal * 0.18; // 18% GST for example
  const total = subtotal + gst;

  // 2. Reduce product stock (simulate)
  // 3. Create ledger entry (simulate)
  // 4. Update outstanding (simulate)

  // Simulate DB save and return
  return {
    ...data,
    subtotal,
    gst,
    total,
    id: Math.floor(Math.random() * 100000),
    createdAt: new Date().toISOString(),
  };
}
