"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { expeditions, orderStatuses } from "@/lib/constants";
import { toast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";

type Seller = { id: string; name: string; marketplace?: string | null };
type Product = { id: string; name: string; code: string; stock: number; sellPrice: number; unit: string };

type OrderItemForm = { productId: string; qty: number; price: number };

export type OrderPayload = {
  sellerId: string;
  status: string;
  expedition?: string | null;
  trackingNumber?: string | null;
  notes?: string | null;
  items: OrderItemForm[];
};

export function OrderForm({ initialData, endpoint }: { initialData?: OrderPayload; endpoint: string }) {
  const router = useRouter();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<OrderPayload>(initialData ?? {
    sellerId: "",
    status: "PENDING",
    expedition: "SPX",
    trackingNumber: "",
    notes: "",
    items: [{ productId: "", qty: 1, price: 0 }],
  });

  useEffect(() => {
    Promise.all([fetch("/api/sellers?limit=100"), fetch("/api/products?limit=100")])
      .then(async ([sellerRes, productRes]) => {
        const sellersData = await sellerRes.json();
        const productsData = await productRes.json();
        setSellers(sellersData.data ?? []);
        setProducts(productsData.data ?? []);
      })
      .catch(() => toast({ title: "Gagal", description: "Tidak dapat memuat master data", variant: "destructive" }));
  }, []);

  const total = useMemo(() => form.items.reduce((sum, item) => sum + item.qty * item.price, 0), [form.items]);

  const setItem = (index: number, key: keyof OrderItemForm, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, idx) => {
        if (idx !== index) return item;
        const updated = { ...item, [key]: value };
        if (key === "productId") {
          const product = products.find((entry) => entry.id === value);
          updated.price = product?.sellPrice ?? 0;
        }
        return updated;
      }),
    }));
  };

  const addItem = () => setForm((prev) => ({ ...prev, items: [...prev.items, { productId: "", qty: 1, price: 0 }] }));
  const removeItem = (index: number) => setForm((prev) => ({ ...prev, items: prev.items.filter((_, idx) => idx !== index) }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const response = await fetch(endpoint, {
      method: initialData ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      toast({ title: "Gagal", description: data.error ?? "Tidak dapat menyimpan order", variant: "destructive" });
      setLoading(false);
      return;
    }

    toast({ title: "Berhasil", description: "Order tersimpan" });
    router.push("/orders");
    router.refresh();
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Card>
        <CardHeader><CardTitle>Informasi Order</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Seller</Label>
            <Select value={form.sellerId} onValueChange={(value) => setForm((prev) => ({ ...prev, sellerId: value }))}>
              <SelectTrigger><SelectValue placeholder="Pilih seller" /></SelectTrigger>
              <SelectContent>
                {sellers.map((seller) => <SelectItem key={seller.id} value={seller.id}>{seller.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {orderStatuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Expedition</Label>
            <Select value={form.expedition ?? "SPX"} onValueChange={(value) => setForm((prev) => ({ ...prev, expedition: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {expeditions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Tracking Number</Label>
            <Input value={form.trackingNumber ?? ""} onChange={(e) => setForm((prev) => ({ ...prev, trackingNumber: e.target.value }))} />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label>Notes</Label>
            <Textarea value={form.notes ?? ""} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} rows={3} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Order Items</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="mr-2 h-4 w-4" />Add Item</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.items.map((item, index) => {
            const selected = products.find((product) => product.id === item.productId);
            return (
              <div key={index} className="grid gap-4 rounded-lg border p-4 md:grid-cols-[2fr,1fr,1fr,auto]">
                <div className="grid gap-2">
                  <Label>Product</Label>
                  <Select value={item.productId || undefined} onValueChange={(value) => setItem(index, "productId", value)}>
                    <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                    <SelectContent>
                      {products.map((product) => <SelectItem key={product.id} value={product.id}>{product.code} - {product.name} (stok {product.stock})</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {selected ? <p className="text-xs text-muted-foreground">Unit {selected.unit} · Stok tersedia {selected.stock}</p> : null}
                </div>
                <div className="grid gap-2">
                  <Label>Qty</Label>
                  <Input type="number" min={1} value={item.qty} onChange={(e) => setItem(index, "qty", Number(e.target.value))} />
                </div>
                <div className="grid gap-2">
                  <Label>Price</Label>
                  <Input type="number" min={0} value={item.price} onChange={(e) => setItem(index, "price", Number(e.target.value))} />
                </div>
                <div className="flex items-end">
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeItem(index)} disabled={form.items.length === 1}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
          <div className="rounded-lg bg-muted p-4 text-right font-semibold">Total Order: {formatCurrency(total)}</div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Order"}</Button>
      </div>
    </form>
  );
}
