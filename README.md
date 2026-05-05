# 🧾 SCS Inventory SaaS

A modern desktop-first SaaS application for wholesalers and retailers to manage billing, inventory, purchases, and payments.

---

## 🚀 Core Features

- Sales Invoice (Billing)
- Purchase Management
- Inventory Tracking
- Customer & Supplier Management
- Payments & Outstanding Tracking
- Reports & Analytics

---

## 🧠 Core Concept: Line Items

### What are Line Items?

A line item represents a single product entry inside an invoice.

Each invoice can have multiple line items.

---

## 📦 Example Invoice

| Product | Quantity | Price | Total |
|--------|----------|-------|-------|
| Rice   | 2        | 50    | 100   |
| Oil    | 1        | 120   | 120   |

👉 Each row = one line item

---

## ⚙️ How Line Items Work

### 1. Adding Items

User selects:
- Product
- Quantity
- Price

This creates a line item entry.

---

### 2. Row Calculation

Each line item calculates its total:

text Row Total = Quantity × Price + GST 

---

### 3. Invoice Total

All line items are summed:

text Invoice Total = Sum of all line item totals 

---

## 📦 Inventory Impact

### Sales Invoice:
- Stock decreases based on quantity

### Purchase Invoice:
- Stock increases based on quantity

---

## 💰 Accounting Impact

Line items contribute to:
- Invoice total
- Customer outstanding
- Supplier payable
- Ledger entries

---

## 🗂️ Data Structure

### Invoice Table

Stores:
- id
- customer_id / supplier_id
- total_amount
- created_at

---

### Line Items Table

Stores:
- id
- invoice_id
- product_id
- quantity
- price
- gst
- total

---

### Relationship

text One Invoice → Many Line Items 

---

## 🔄 Workflow

### Sales Flow

1. Create invoice
2. Add line items
3. Calculate totals
4. Reduce stock
5. Update customer outstanding

---

### Purchase Flow

1. Create purchase
2. Add line items
3. Increase stock
4. Update supplier payable

---

## 🧩 Frontend Behavior

Line items are stored as an array:

js [   { productId: 1, quantity: 2, price: 50 },   { productId: 2, quantity: 1, price: 120 } ] 

---

## 🔐 Backend Responsibility

- Validate all line items
- Recalculate totals
- Update stock correctly
- Maintain data consistency using transactions

---

## ⚠️ Important Rules

- Do NOT trust frontend totals
- Always calculate totals on backend
- Always update stock per line item
- Keep line items in a separate table

---

## 🏗️ Tech Stack

- Frontend: Next.js + Tailwind CSS
- Backend: Node.js + Express
- Database: PostgreSQL (Supabase planned)
- State Management: React Query + Zustand

---

## 🎯 Goal

Build a fast, reliable, and scalable SaaS system optimized for real-world shop and wholesaler workflows.

---

## 📌 Future Improvements

- Barcode support
- WhatsApp integration
- Advanced reports
- Multi-user roles

---

## 👨‍💻 Author

SCS Techn
