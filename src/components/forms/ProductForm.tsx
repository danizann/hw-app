"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

type Option = { id: string; name: string };

export type ProductPayload = {
  code: string;
  name: string;
  categoryId?: string | null;
  supplierId?: string | null;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  unit: string;
  photo?: string | null;
  lowStockAt: number;
};

export function ProductForm({ initialData, endpoint }: { initialData?: ProductPayload; endpoint: string }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Option[]>([]);
  const [suppliers, setSuppliers] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ProductPayload>(initialData ?? {
    code: "",
    name: "",
    categoryId: null,
    supplierId: null,
    buyPrice: 0,
    sellPrice: 0,
    stock: 0,
    unit: "pcs",
    photo: "",
    lowStockAt: 10,
  });

  useEffect(() => {
    Promise.all([fetch("/api/categories"), fetch("/api/suppliers?limit=100")])
      .then(async ([categoriesRes, suppliersRes]) => {
        const categoriesData = await categoriesRes.json();
        const suppliersData = await suppliersRes.json();
        setCategories(categoriesData);
        setSuppliers(suppliersData.data ?? []);
      })
      .catch(() => toast({ title: "Gagal", description: "Tidak dapat memuat master data", variant: "destructive" }));
  }, []);

  const handleChange = (key: keyof ProductPayload, value: string | number | null) => setForm((prev) => ({ ...prev, [key]: value }));

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
      toast({ title: "Gagal", description: data.error ?? "Tidak dapat menyimpan produk", variant: "destructive" });
      setLoading(false);
      return;
    }
    toast({ title: "Berhasil", description: "Produk tersimpan" });
    router.push("/products");
    router.refresh();
  };

  return (
    <Card>
      <CardHeader><CardTitle>{initialData ? "Edit Product" : "Tambah Product"}</CardTitle></CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="code">Code</Label>
              <Input id="code" value={form.code} onChange={(e) => handleChange("code", e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={form.categoryId ?? "none"} onValueChange={(value) => handleChange("categoryId", value === "none" ? null : value)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Category</SelectItem>
                  {categories.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Supplier</Label>
              <Select value={form.supplierId ?? "none"} onValueChange={(value) => handleChange("supplierId", value === "none" ? null : value)}>
                <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Supplier</SelectItem>
                  {suppliers.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2"><Label>Buy Price</Label><Input type="number" value={form.buyPrice} onChange={(e) => handleChange("buyPrice", Number(e.target.value))} /></div>
            <div className="grid gap-2"><Label>Sell Price</Label><Input type="number" value={form.sellPrice} onChange={(e) => handleChange("sellPrice", Number(e.target.value))} /></div>
            <div className="grid gap-2"><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => handleChange("stock", Number(e.target.value))} /></div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2"><Label>Unit</Label><Input value={form.unit} onChange={(e) => handleChange("unit", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Photo URL</Label><Input value={form.photo ?? ""} onChange={(e) => handleChange("photo", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Low Stock Alert</Label><Input type="number" value={form.lowStockAt} onChange={(e) => handleChange("lowStockAt", Number(e.target.value))} /></div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Product"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
