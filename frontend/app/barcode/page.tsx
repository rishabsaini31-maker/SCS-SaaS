export default function BarcodePage() {
  return (
    <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] relative">
      <style dangerouslySetInnerHTML={{__html: `
        .barcode-stripes {
            background: linear-gradient(90deg, 
                #000 0%, #000 5%, 
                #fff 5%, #fff 10%, 
                #000 10%, #000 12%, 
                #fff 12%, #fff 20%, 
                #000 20%, #000 25%, 
                #fff 25%, #fff 35%, 
                #000 35%, #000 45%, 
                #fff 45%, #fff 50%, 
                #000 50%, #000 55%, 
                #fff 55%, #fff 60%, 
                #000 60%, #000 75%, 
                #fff 75%, #fff 80%, 
                #000 80%, #000 85%, 
                #fff 85%, #fff 90%, 
                #000 90%, #000 100%);
        }
      `}} />

      {/* Main Content Area */}
      <main className="p-8 flex-1 z-10 relative">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="font-h1 text-2xl font-semibold text-slate-900 mb-1">Barcode Generator</h1>
          <p className="font-body-md text-sm text-slate-500">Generate and print high-precision barcode labels for warehouse inventory.</p>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Column: Product Selection & Barcode */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-h1 text-sm font-bold text-slate-900">Product Identification</h3>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded">Step 1</span>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-2">SELECT PRODUCT</label>
                  <div className="relative">
                    <select className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 text-sm text-slate-900 appearance-none focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer">
                      <option>Titanium Chronograph - Series 7</option>
                      <option>Wireless Audio Pro - Matte Black</option>
                      <option>Ergonomic Office Chair - Slate</option>
                      <option>High-Speed SSD - 2TB NVMe</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-50 p-3 border border-slate-200 rounded-lg">
                    <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-1">CATEGORY</p>
                    <p className="font-mono text-sm font-semibold text-slate-900">Electronics</p>
                  </div>
                  <div className="bg-slate-50 p-3 border border-slate-200 rounded-lg">
                    <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-1">CURRENT STOCK</p>
                    <p className="font-mono text-sm font-semibold text-slate-900">142 Units</p>
                  </div>
                </div>
                <div className="mt-8 border-2 border-dashed border-slate-200 rounded-xl p-8 bg-slate-50 flex flex-col items-center justify-center">
                  <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-6">LIVE PREVIEW</p>
                  <div className="bg-white p-6 rounded shadow-sm border border-slate-200 w-full max-w-[400px]">
                    <div className="h-32 w-full barcode-stripes mb-4"></div>
                    <div className="text-center font-mono text-2xl tracking-[0.4em] text-slate-900">8429103948</div>
                  </div>
                </div>
                <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm">
                  <span className="material-symbols-outlined">refresh</span>
                  Generate New Barcode
                </button>
              </div>
            </section>
          </div>

          {/* Right Column: Print Settings */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-h1 text-sm font-bold text-slate-900">Print Configuration</h3>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded">Step 2</span>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-2">NUMBER OF LABELS</label>
                  <input className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" type="number" defaultValue="30" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-2">LABEL SIZE</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button className="py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-blue-50 hover:border-blue-200 text-slate-700 transition-colors">Small</button>
                    <button className="py-2 border-2 border-blue-600 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold">Medium</button>
                    <button className="py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-blue-50 hover:border-blue-200 text-slate-700 transition-colors">Large</button>
                  </div>
                </div>
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900">Show Product Name</span>
                      <span className="text-xs text-slate-500">Include title on top of label</span>
                    </div>
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 cursor-pointer">
                      <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition"></span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900">Show Price</span>
                      <span className="text-xs text-slate-500">Include MSRP in bottom corner</span>
                    </div>
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 cursor-pointer">
                      <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition"></span>
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <div className="bg-blue-50 p-4 rounded-lg flex gap-3 border border-blue-100">
                    <span className="material-symbols-outlined text-blue-600">info</span>
                    <p className="text-xs text-blue-800 leading-relaxed">
                      Recommended paper: **Avery 5160 Address Labels**. Ensure printer scale is set to "Actual Size" to avoid distortion.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Bottom Section: Print Preview */}
          <div className="col-span-12">
            <section className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-h1 text-sm font-bold text-slate-900">Grid Preview (Sheet View)</h3>
                  <p className="text-xs text-slate-500 mt-1">Real-time preview of how labels will appear on the final print sheet.</p>
                </div>
                <div className="flex gap-3">
                  <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                    <span className="material-symbols-outlined">zoom_in</span>
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                    <span className="material-symbols-outlined">fullscreen</span>
                  </button>
                </div>
              </div>
              
              {/* Labels Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 bg-slate-50 p-8 rounded-lg border border-slate-200">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white border border-slate-300 p-4 rounded-md shadow-sm aspect-[3/1.5] flex flex-col justify-between group hover:border-blue-500 transition-colors cursor-default">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-slate-900 uppercase">Titanium Chronograph - S7</span>
                      <span className="text-[10px] font-mono text-slate-500">#E04-01</span>
                    </div>
                    <div className="h-10 w-full barcode-stripes opacity-90"></div>
                    <div className="flex justify-between items-end">
                      <span className="text-[9px] font-mono tracking-widest">8429103948</span>
                      <span className="text-xs font-bold text-slate-900">$299.00</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Action Footer */}
      <footer className="h-20 bg-white border-t border-slate-200 px-8 flex items-center justify-between sticky bottom-0 z-40">
        <div className="flex items-center gap-4">
          <button className="px-6 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">restart_alt</span>
            Reset Form
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-6 h-11 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-bold rounded-lg transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
            Download PDF
          </button>
          <button className="px-8 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">print</span>
            Print Labels
          </button>
        </div>
      </footer>

      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-20 overflow-hidden">
        <div className="absolute top-[20%] right-[5%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] left-[20%] w-[300px] h-[300px] bg-slate-200 rounded-full blur-[100px]"></div>
      </div>
    </div>
  );
}
