export default function ResellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 p-5 shadow-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Hoodwood Mobile</p>
          <h1 className="mt-1 text-2xl font-bold">Portal Reseller</h1>
          <p className="mt-1 text-sm text-cyan-100">Buat order produk langsung dari aplikasi Android.</p>
        </div>
        {children}
      </div>
    </div>
  );
}
