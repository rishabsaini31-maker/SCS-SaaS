"use client";

export function Topbar() {
  return (
    <header className="fixed top-0 right-0 h-[64px] w-[calc(100%-240px)] bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex justify-between items-center px-8 z-40 shadow-sm dark:shadow-none">
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full group focus-within:ring-2 focus-within:ring-blue-500 rounded-lg">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            search
          </span>
          <input
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-10 pr-16 text-sm focus:ring-0 focus:outline-none"
            placeholder="Search invoices, products, customers..."
            type="text"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
            Cmd+K
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 ml-8">
        <button className="bg-primary text-white px-4 py-2 rounded-lg font-body-sm flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm active:scale-95">
          <span className="material-symbols-outlined text-sm">add</span>
          + Create Invoice
        </button>
        <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-body-sm flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm active:scale-95">
          <span className="material-symbols-outlined text-sm text-slate-500">
            inventory
          </span>
          + Product
        </button>
        <div className="h-6 w-px bg-slate-200 mx-2"></div>
        <button className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          <span className="material-symbols-outlined">help_outline</span>
        </button>
      </div>
    </header>
  );
}
