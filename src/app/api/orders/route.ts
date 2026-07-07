import { prisma } from "@/lib/prisma";
import { fail, getPagination, ok } from "@/lib/api-helpers";
import { createOrderWithStock } from "@/lib/order-service";
import { generateOrderNumber } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { page, limit } = getPagination(searchParams);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";

  const where = {
    ...(search
      ? {
          OR: [
            { orderNumber: { contains: search } },
            { seller: { name: { contains: search } } },
          ],
        }
      : {}),
    ...(status ? { status } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        seller: true,
        items: { include: { product: true } },
        invoices: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return ok({ data, total, page, totalPages: Math.ceil(total / limit) || 1 });
}

export async function POST(request: Request) {
  const body = await request.json();
  const items = Array.isArray(body.items) ? body.items : [];
  if (!body.sellerId || !items.length) return fail("Seller and order items are required");

  try {
    const order = await createOrderWithStock({
      orderNumber: body.orderNumber || generateOrderNumber(),
      sellerId: body.sellerId,
      status: body.status || "PENDING",
      expedition: body.expedition || null,
      trackingNumber: body.trackingNumber || null,
      notes: body.notes || null,
      items: items.map((item: { productId: string; qty: number; price: number }) => ({
        productId: item.productId,
        qty: Number(item.qty),
        price: Number(item.price),
      })),
    });
    return ok(order, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to create order");
  }
}
