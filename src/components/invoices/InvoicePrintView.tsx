"use client";

import Barcode from "react-barcode";
import { formatDate, formatInvoiceLabel } from "@/lib/utils";
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
    <div
      className="bg-white text-black"
      style={{
        width: "4in",
        minHeight: "6in",
        padding: "0.2in",
        fontFamily: "sans-serif",
        fontSize: "9pt",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p style={{ fontSize: "14pt", fontWeight: "bold", margin: 0 }}>Hoodwood</p>
          <p style={{ fontSize: "7pt", color: "#555", margin: 0 }}>Warehouse Administration System</p>
          <p style={{ fontSize: "7pt", marginTop: "4px", margin: "4px 0 0" }}>
            {invoice.type.replace(/_/g, " ")}
          </p>
          <p style={{ fontSize: "10pt", fontWeight: "bold", margin: "2px 0 0" }}>
            {formatInvoiceLabel(invoice.invoiceNumber)}
          </p>
          <p style={{ fontSize: "7pt", color: "#555", margin: "2px 0 0" }}>
            {formatDate(invoice.createdAt)}
          </p>
        </div>
        <div>
          <Barcode value={invoice.invoiceNumber} height={28} displayValue={false} width={0.8} margin={0} />
        </div>
      </div>

      <Separator style={{ margin: "6px 0" }} />

      {/* Seller & Order Info */}
      <div className="flex gap-4" style={{ fontSize: "8pt" }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: "600", color: "#666", margin: "0 0 2px", textTransform: "uppercase", fontSize: "7pt" }}>Kepada</p>
          <p style={{ fontWeight: "bold", margin: 0 }}>{invoice.seller?.name ?? "Supplier / Internal"}</p>
          {invoice.seller?.phone ? <p style={{ margin: "1px 0 0" }}>{invoice.seller.phone}</p> : null}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: "600", color: "#666", margin: "0 0 2px", textTransform: "uppercase", fontSize: "7pt" }}>Pengiriman</p>
          <p style={{ margin: 0 }}>Order: {invoice.order?.orderNumber ?? "-"}</p>
          <p style={{ margin: "1px 0 0" }}>Ekspedisi: {invoice.order?.expedition ?? "-"}</p>
          <p style={{ margin: "1px 0 0" }}>Resi: {invoice.order?.trackingNumber ?? "-"}</p>
        </div>
      </div>

      {invoice.notes ? (
        <p style={{ fontSize: "7pt", color: "#555", margin: "4px 0 0", fontStyle: "italic" }}>
          Catatan: {invoice.notes}
        </p>
      ) : null}

      <Separator style={{ margin: "6px 0" }} />

      {/* Items Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8pt" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #ccc", backgroundColor: "#f5f5f5" }}>
            <th style={{ textAlign: "left", padding: "3px 4px", fontWeight: "600" }}>Produk</th>
            <th style={{ textAlign: "left", padding: "3px 4px", fontWeight: "600" }}>Kode</th>
            <th style={{ textAlign: "right", padding: "3px 4px", fontWeight: "600" }}>Qty</th>
          </tr>
        </thead>
        <tbody>
          {items.length ? (
            items.map((item) => (
              <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "3px 4px" }}>{item.product.name}</td>
                <td style={{ padding: "3px 4px", color: "#555" }}>{item.product.code}</td>
                <td style={{ padding: "3px 4px", textAlign: "right" }}>{item.qty} {item.product.unit}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} style={{ padding: "8px 4px", textAlign: "center", color: "#999" }}>
                Tidak ada item order terkait.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Separator style={{ margin: "6px 0" }} />

      {/* Footer */}
      <p style={{ fontSize: "7pt", color: "#888", textAlign: "center", margin: 0 }}>
        support@hoodwood.com
      </p>
    </div>
  );
}

