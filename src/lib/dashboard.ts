import { subDays, startOfDay, endOfDay, format } from "date-fns";
import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const rangeStart = startOfDay(subDays(now, 6));

  const [totalProducts, totalSuppliers, totalSellers, ordersThisMonth, unpaidInvoices, paidInvoices, recentOrders, ordersInRange] = await Promise.all([
    prisma.product.count(),
    prisma.supplier.count(),
    prisma.seller.count(),
    prisma.order.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.invoice.count({ where: { status: "UNPAID" } }),
    prisma.invoice.aggregate({ _sum: { totalAmount: true }, where: { status: "PAID" } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { seller: true, items: { include: { product: true } } },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: rangeStart } },
      select: { createdAt: true },
    }),
  ]);

  const ordersLast7Days = Array.from({ length: 7 }).map((_, index) => {
    const day = subDays(now, 6 - index);
    const count = ordersInRange.filter((order) => order.createdAt >= startOfDay(day) && order.createdAt <= endOfDay(day)).length;
    return {
      day: format(day, "dd/MM"),
      orders: count,
    };
  });

  return {
    totalProducts,
    totalSuppliers,
    totalSellers,
    ordersThisMonth,
    unpaidInvoices,
    totalRevenue: paidInvoices._sum.totalAmount ?? 0,
    ordersLast7Days,
    recentOrders: recentOrders.map((order) => ({
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map((item) => ({
        ...item,
        product: item.product,
      })),
    })),
  };
}
