"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { marketplaces } from "@/lib/constants";
import { toast } from "@/components/ui/use-toast";

export type SellerPayload = {
  name: string;
  phone?: string | null;
  email?: string | null;
  marketplace?: string | null;
  address?: string | null;
  notes?: string | null;
};

export function SellerForm({ initialData, endpoint }: { initialData?: SellerPayload; endpoint: string }) {
  const router = useRouter();
  const [form, setForm] = useState<SellerPayload>(initialData ?? { name: "", phone: "", email: "", marketplace: "Shopee", address: "", notes: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (key: keyof SellerPayload, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const method = initialData ? "PUT" : "POST";
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      toast({ title: "Gagal", description: data.error ?? "Tidak dapat menyimpan seller", variant: "destructive" });
      setLoading(false);
      return;
    }

    toast({ title: "Berhasil", description: "Data seller tersimpan" });
    router.push("/sellers");
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Seller" : "Tambah Seller"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone ?? ""} onChange={(e) => handleChange("phone", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email ?? ""} onChange={(e) => handleChange("email", e.target.value)} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Marketplace</Label>
            <Select value={form.marketplace ?? "Shopee"} onValueChange={(value) => handleChange("marketplace", value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {marketplaces.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" value={form.address ?? ""} onChange={(e) => handleChange("address", e.target.value)} rows={3} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={form.notes ?? ""} onChange={(e) => handleChange("notes", e.target.value)} rows={4} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Seller"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
