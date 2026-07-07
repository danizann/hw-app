"use client";

import { BarChart3, FileText, Package, ShoppingCart, TrendingUp, Users, UserCheck } from "lucide-react";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";

type DashboardData = {
  totalProducts: number;
  totalSuppliers: number;
  totalSellers: number;
  ordersThisMonth: number;
  unpaidInvoices: number;
  totalRevenue: number;
  ordersLast7Days: { day: string; orders: number }[];
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    createdAt: string;
    seller: { name: string };
    items: Array<{ qty: number }>;
  }>;
};

const statCards = (data: DashboardData) => [
  { label: "Total Products", value: data.totalProducts, icon: Package },
  { label: "Total Suppliers", value: data.totalSuppliers, icon: Users },
  { label: "Total Sellers", value: data.totalSellers, icon: UserCheck },
  { label: "Orders This Month", value: data.ordersThisMonth, icon: ShoppingCart },
  { label: "Unpaid Invoices", value: data.unpaidInvoices, icon: FileText },
  { label: "Total Revenue", value: formatCurrency(data.totalRevenue), icon: TrendingUp },
];

export function DashboardClient({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Ringkasan aktivitas gudang Hoodwood.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {statCards(data).map((item) => (
          <Card key={item.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
              <item.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5" /> Orders Last 7 Days
            </CardTitle>
            <CardDescription>Jumlah order yang masuk setiap hari.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.ordersLast7Days}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Insights</CardTitle>
            <CardDescription>Highlight penting untuk hari ini.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Revenue paid invoices</p>
              <p className="mt-2 text-2xl font-bold">{formatCurrency(data.totalRevenue)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Outstanding invoices</p>
              <p className="mt-2 text-2xl font-bold">{data.unpaidInvoices}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Orders this month</p>
              <p className="mt-2 text-2xl font-bold">{data.ordersThisMonth}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Daftar order terbaru yang baru masuk ke sistem.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.seller.name}</TableCell>
                  <TableCell>{order.items.reduce((sum, item) => sum + item.qty, 0)}</TableCell>
                  <TableCell>
                    <StatusBadge value={order.status} />
                  </TableCell>
                  <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
