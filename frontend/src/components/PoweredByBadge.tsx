"use client";

export default function PoweredByBadge() {
  return (
    <div className="fixed bottom-6 right-6 z-40 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
      <p className="text-sm font-semibold leading-none">
        <span className="text-slate-900">Powered by </span>
        <span className="text-blue-600">SCS Technologies</span>
      </p>
    </div>
  );
}
