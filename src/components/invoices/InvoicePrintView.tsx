"use client";

import Barcode from "react-barcode";
import { formatCurrency, formatDate, formatInvoiceLabel } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export type PrintableInvoice = {
  id: string;
  invoiceNumber: string;
  type: string;
  status: string;
  totalAmount: number;
  notes: string | null;
  createdAt: string;
  printedAt?: string | null;
  seller?: { name: string; email?: string | null; phone?: string | null } | null;
  order?: {
    orderNumber: string;
    expedition?: string | null;
    trackingNumber?: string | null;
    items: Array<{
      id: string;
      qty: number;
      price: number;
      product: { name: string; code: string; unit: string };
    }>;
  } | null;
};

export function InvoicePrintView({ invoice }: { invoice: PrintableInvoice }) {
  const items = invoice.order?.items ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl rounded-xl border bg-white p-8 text-black print:max-w-none print:border-0 print:p-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Hoodwood</h1>
          <p className="text-sm text-slate-600">Warehouse Administration System</p>
          <p className="mt-4 text-sm">Jl. Warehouse No. 21, Jakarta</p>
          <p className="text-sm">support@hoodwood.com</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">{invoice.type.replace(/_/g, " ")}</p>
          <p className="mt-2 text-2xl font-bold">{formatInvoiceLabel(invoice.invoiceNumber)}</p>
          <p className="text-sm text-slate-600">Tanggal: {formatDate(invoice.createdAt)}</p>
          <div className="mt-3 inline-block rounded-lg border p-2">
            <Barcode value={invoice.invoiceNumber} height={40} displayValue={false} width={1.6} margin={0} />
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold uppercase text-slate-500">Bill To</h2>
          <div className="mt-2 space-y-1 text-sm">
            <p className="font-semibold">{invoice.seller?.name ?? "Supplier / Internal"}</p>
            {invoice.seller?.email ? <p>{invoice.seller.email}</p> : null}
            {invoice.seller?.phone ? <p>{invoice.seller.phone}</p> : null}
            {invoice.notes ? <p className="pt-2 text-slate-600">{invoice.notes}</p> : null}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase text-slate-500">Order Info</h2>
          <div className="mt-2 space-y-1 text-sm">
            <p>Order: {invoice.order?.orderNumber ?? "-"}</p>
            <p>Ekspedisi: {invoice.order?.expedition ?? "-"}</p>
            <p>No. Resi: {invoice.order?.trackingNumber ?? "-"}</p>
            <p>Status: {invoice.status}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-4 py-3">Produk</th>
              <th className="px-4 py-3">Kode</th>
              <th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3 text-right">Harga</th>
              <th className="px-4 py-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.length ? (
              items.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3">{item.product.name}</td>
                  <td className="px-4 py-3">{item.product.code}</td>
                  <td className="px-4 py-3 text-right">{`${item.qty} ${item.product.unit}`}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(item.price)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(item.qty * item.price)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Tidak ada item order terkait. Gunakan catatan invoice untuk referensi.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-slate-50">
            <tr>
              <td colSpan={4} className="px-4 py-4 text-right font-semibold">Total</td>
              <td className="px-4 py-4 text-right font-bold">{formatCurrency(invoice.totalAmount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
