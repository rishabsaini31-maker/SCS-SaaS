 "use client";

import { FormEvent, useState } from "react";

type Customer = {
  id: string;
  display: string;
  address: string;
  gst: boolean;
};

export default function BillingPage() {
  const [lastAction, setLastAction] = useState("Ready");
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: "aman",
      display: "Aman Traders - 9876543210",
      address: "Aman Traders, 22 Market Road, Jaipur, Rajasthan 302001",
      gst: true,
    },
    {
      id: "global",
      display: "Global Wholesale Corp - 8877665544",
      address: "Global Wholesale Corp, 45 Ring Rd, Surat, Gujarat 395002",
      gst: true,
    },
    {
      id: "retail",
      display: "Retail Hub Ltd - 9900112233",
      address: "Retail Hub Ltd, 8 Residency Lane, Pune, Maharashtra 411001",
      gst: false,
    },
  ]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [newPartyName, setNewPartyName] = useState("");
  const [newPartyPhone, setNewPartyPhone] = useState("");
  const [newPartyAddress, setNewPartyAddress] = useState("");
  const [newPartyGst, setNewPartyGst] = useState(false);

  const selectedCustomer = customers.find(
    (customer) => customer.id === selectedCustomerId,
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setLastAction("Invoice draft saved");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-display-sm text-display-sm text-on-surface">
            Sales Invoice
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Create a new bill for retail or wholesale transaction.
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            className="flex items-center px-4 py-2 bg-white border border-outline-variant text-slate-700 rounded-lg hover:bg-slate-50 transition-all active:scale-95 shadow-sm font-medium text-sm"
            onClick={() => setLastAction("Opened recent invoices")}
            type="button"
          >
            <span className="material-symbols-outlined mr-2 text-lg">
              history
            </span>
            Recent
          </button>
          <button
            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-all active:scale-95 shadow-sm font-medium text-sm"
            onClick={() => setIsPartyModalOpen(true)}
            type="button"
          >
            <span className="material-symbols-outlined mr-2 text-lg">add</span>
            New Party
          </button>
        </div>
      </div>

      {/* Bento Layout: Metadata & Customer */}
      <div className="grid grid-cols-12 gap-6">
        {/* Customer Selection Card */}
        <div className="col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">
              Customer Details
            </label>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                selectedCustomer?.gst
                  ? "bg-blue-50 text-blue-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {selectedCustomer?.gst
                ? "GST REGISTERED"
                : "GST NOT AVAILABLE"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500">
                Select Customer / Party
              </label>
              <div className="relative group">
                <select
                  className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  onChange={(event) => {
                    const value = event.target.value;
                    setSelectedCustomerId(value);
                    const customer = customers.find((item) => item.id === value);
                    if (customer) {
                      setLastAction(`Selected customer: ${customer.display}`);
                    }
                  }}
                  value={selectedCustomerId}
                >
                  <option value="">Search customer name or mobile...</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.display}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500">
                Billing Address
              </label>
              <div className="bg-slate-50 border border-slate-200 rounded-lg py-2 px-4 text-xs text-slate-600 italic min-h-10 flex items-center">
                {selectedCustomer?.address ?? "Select a customer to auto-fill address..."}
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Metadata Card */}
        <div className="col-span-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <label className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-4 block">
            Invoice Metadata
          </label>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500">
                Invoice No.
              </span>
              <span className="font-mono-data text-mono-data font-bold text-slate-900">
                INV-2024-00432
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500">
                Billing Date
              </span>
              <input
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary"
                type="date"
                defaultValue="2024-05-24"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500">
                Payment Terms
              </span>
              <select className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-primary">
                <option>Due on Receipt</option>
                <option>Net 15</option>
                <option>Net 30</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Product Entry Section */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-blue-600">
              barcode_scanner
            </span>
            <span className="font-bold text-sm text-slate-700">Quick Entry</span>
          </div>
          <div className="flex items-center space-x-2">
            <kbd className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-mono shadow-sm">
              Alt + P
            </kbd>
            <span className="text-xs text-slate-500">to add empty row</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 font-label-caps text-label-caps text-slate-500 uppercase w-[20%]">
                  Barcode
                </th>
                <th className="px-6 py-3 font-label-caps text-label-caps text-slate-500 uppercase w-[35%]">
                  Product Name
                </th>
                <th className="px-6 py-3 font-label-caps text-label-caps text-slate-500 uppercase w-[10%] text-center">
                  Qty
                </th>
                <th className="px-6 py-3 font-label-caps text-label-caps text-slate-500 uppercase w-[15%] text-right">
                  Price (₹)
                </th>
                <th className="px-6 py-3 font-label-caps text-label-caps text-slate-500 uppercase w-[15%] text-right">
                  Total (₹)
                </th>
                <th className="px-4 py-3 w-[5%]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/50 transition-colors h-[48px]">
                <td className="px-6 py-2">
                  <div className="relative">
                    <input
                      className="w-full bg-white border border-slate-200 rounded-md py-1.5 px-3 text-sm focus:ring-2 focus:ring-primary outline-none font-mono"
                      placeholder="Scan to add"
                      type="text"
                    />
                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 text-sm">
                      qr_code_scanner
                    </span>
                  </div>
                </td>
                <td className="px-6 py-2">
                  <input
                    className="w-full bg-white border border-slate-200 rounded-md py-1.5 px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Start typing product name..."
                    type="text"
                  />
                </td>
                <td className="px-6 py-2">
                  <input
                    className="w-full bg-white border border-slate-200 rounded-md py-1.5 px-3 text-sm text-center focus:ring-2 focus:ring-primary outline-none"
                    type="number"
                    defaultValue="1"
                  />
                </td>
                <td className="px-6 py-2">
                  <input
                    className="w-full bg-white border border-slate-200 rounded-md py-1.5 px-3 text-sm text-right focus:ring-2 focus:ring-primary outline-none font-mono"
                    placeholder="0.00"
                    type="text"
                  />
                </td>
                <td className="px-6 py-2 text-right">
                  <span className="font-mono-data text-mono-data text-slate-400">
                    0.00
                  </span>
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    className="text-slate-300 hover:text-error transition-colors"
                    onClick={() => setLastAction("Removed draft line")}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-lg">
                      delete
                    </span>
                  </button>
                </td>
              </tr>
              {/* Repeat Row for visual density */}
              <tr className="bg-slate-50/30 h-[48px]">
                <td className="px-6 py-2">
                  <div className="relative">
                    <input
                      className="w-full bg-transparent border-none py-1.5 px-3 text-sm focus:ring-0 outline-none font-mono text-slate-900"
                      type="text"
                      defaultValue="890123456789"
                    />
                  </div>
                </td>
                <td className="px-6 py-2">
                  <span className="text-sm font-medium text-slate-700">
                    Premium Wireless Headphones v2
                  </span>
                </td>
                <td className="px-6 py-2">
                  <input
                    className="w-full bg-white border border-slate-200 rounded-md py-1.5 px-3 text-sm text-center focus:ring-2 focus:ring-primary outline-none"
                    type="number"
                    defaultValue="5"
                  />
                </td>
                <td className="px-6 py-2 text-right">
                  <span className="text-sm text-slate-700">4,250.00</span>
                </td>
                <td className="px-6 py-2 text-right">
                  <span className="font-mono-data text-mono-data text-slate-900 font-bold">
                    21,250.00
                  </span>
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    className="text-slate-400 hover:text-error transition-colors"
                    onClick={() => setLastAction("Removed line item")}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-lg">
                      delete
                    </span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50/50 border-t border-slate-100">
          <button
            className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center transition-colors"
            onClick={() => setLastAction("Added product line")}
            type="button"
          >
            <span className="material-symbols-outlined mr-1 text-base">
              add_circle
            </span>
            ADD PRODUCT LINE
          </button>
        </div>
      </div>

      {/* Bottom Section: Summary & Actions */}
      <div className="grid grid-cols-12 gap-8">
        {/* Notes & Keyboard Shortcuts */}
        <div className="col-span-7 space-y-6">
          <div className="space-y-2">
            <label className="font-label-caps text-label-caps text-slate-500 uppercase">
              Notes &amp; Special Instructions
            </label>
            <textarea
              className="w-full h-24 bg-white border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
              placeholder="Write any specific terms, delivery notes or bank details here..."
            ></textarea>
          </div>
          <div className="bg-slate-100/50 rounded-xl p-4 border border-slate-200">
            <label className="font-label-caps text-label-caps text-slate-500 uppercase mb-3 block">
              Keyboard Shortcuts
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono shadow-sm">
                  F2
                </kbd>
                <span className="text-[11px] text-slate-600">Save Invoice</span>
              </div>
              <div className="flex items-center space-x-2">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono shadow-sm">
                  Ctrl + P
                </kbd>
                <span className="text-[11px] text-slate-600">
                  Print Preview
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono shadow-sm">
                  Esc
                </kbd>
                <span className="text-[11px] text-slate-600">
                  Discard Entry
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono shadow-sm">
                  Alt + S
                </kbd>
                <span className="text-[11px] text-slate-600">
                  Apply Settlement
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Totals Card */}
        <div className="col-span-5 bg-white border-2 border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-sm">Subtotal</span>
            <span className="font-mono-data text-sm">₹ 21,250.00</span>
          </div>
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-sm">CGST (9%)</span>
            <span className="font-mono-data text-sm">₹ 1,912.50</span>
          </div>
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-sm">SGST (9%)</span>
            <span className="font-mono-data text-sm">₹ 1,912.50</span>
          </div>
          <div className="pt-4 border-t-2 border-dashed border-slate-100">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900">Grand Total</span>
              <span className="font-mono-data text-xl font-extrabold text-blue-700">
                ₹ 25,075.00
              </span>
            </div>
            <p className="text-[10px] text-slate-400 text-right mt-1 italic">
              Rupees Twenty Five Thousand Seventy Five Only
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-4">
            <button
              className="col-span-2 bg-primary text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-all shadow-md flex items-center justify-center space-x-2 active:scale-[0.98]"
              onClick={handleSubmit}
              type="button"
            >
              <span className="material-symbols-outlined">save</span>
              <span>SAVE INVOICE (F2)</span>
            </button>
            <button
              className="bg-white border border-slate-200 py-2.5 rounded-lg hover:bg-slate-50 text-slate-700 text-sm font-semibold flex items-center justify-center transition-all"
              onClick={() => setLastAction("Print preview opened")}
              type="button"
            >
              <span className="material-symbols-outlined mr-2 text-lg">
                print
              </span>
              Print
            </button>
            <button
              className="bg-white border border-slate-200 py-2.5 rounded-lg hover:bg-slate-50 text-slate-700 text-sm font-semibold flex items-center justify-center transition-all"
              onClick={() => setLastAction("PDF export clicked")}
              type="button"
            >
              <span className="material-symbols-outlined mr-2 text-lg">
                picture_as_pdf
              </span>
              PDF
            </button>
            <button
              className="col-span-2 bg-[#25D366]/10 text-[#075E54] border border-[#25D366]/30 py-2.5 rounded-lg hover:bg-[#25D366]/20 text-sm font-bold flex items-center justify-center transition-all"
              onClick={() => setLastAction("WhatsApp share clicked")}
              type="button"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="WhatsApp Icon"
                className="w-4 h-4 mr-2"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKGNZR_kCjCJvR3mkQzz_C1XsNbd9cdXXZOvs_FCPW0e_1EEnpDd-yAi3WOgdrOt3SLTgbIFljK8u7YGyd9JrG5KIAMbFOfdajIK8oA3G-I-QzCPVfnPi2Hvt2DtEoIEMCsLsSgwFjwX7MSoWAgi7IdlQNr6g3r_0jPA1SIPwhOdfTj7IJLuDWYLTD_5xKlYX42mTneo1EjoGbte45fTn9-540yLK0Htl3_QF15K9YyP7RzAeof75pALhx4qKgPvRbYS_Vuon8Fd8"
              />
              Send via WhatsApp
            </button>
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-500">Last action: {lastAction}</p>
      {isPartyModalOpen ? (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <form
            className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl p-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const id = `party-${Date.now()}`;
              const customer: Customer = {
                id,
                display: `${newPartyName.trim()} - ${newPartyPhone.trim()}`,
                address: newPartyAddress.trim(),
                gst: newPartyGst,
              };
              setCustomers((previous) => [...previous, customer]);
              setSelectedCustomerId(id);
              setLastAction(`New party added: ${customer.display}`);
              setIsPartyModalOpen(false);
              setNewPartyName("");
              setNewPartyPhone("");
              setNewPartyAddress("");
              setNewPartyGst(false);
            }}
          >
            <h3 className="text-base font-bold text-slate-900">New Party Form</h3>
            <input
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              onChange={(event) => setNewPartyName(event.target.value)}
              placeholder="Party name"
              required
              value={newPartyName}
            />
            <input
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              onChange={(event) => setNewPartyPhone(event.target.value)}
              placeholder="Phone number"
              required
              value={newPartyPhone}
            />
            <textarea
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none"
              onChange={(event) => setNewPartyAddress(event.target.value)}
              placeholder="Billing address"
              required
              rows={3}
              value={newPartyAddress}
            />
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                checked={newPartyGst}
                onChange={(event) => setNewPartyGst(event.target.checked)}
                type="checkbox"
              />
              GST registered
            </label>
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
                onClick={() => setIsPartyModalOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 text-sm bg-primary text-white rounded-lg"
                type="submit"
              >
                Save Party
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
