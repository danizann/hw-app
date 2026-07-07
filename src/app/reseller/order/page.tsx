import { OrderForm } from "@/components/forms/OrderForm";

export default function ResellerOrderPage() {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg backdrop-blur">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Buat Order Produk</h2>
        <p className="text-sm text-slate-400">Pilih produk, isi jumlah, lalu kirim order reseller.</p>
      </div>
      <OrderForm endpoint="/api/orders" />
    </section>
  );
}
