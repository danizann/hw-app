import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api-helpers";
import { deleteOrderWithStock, updateOrderWithStock } from "@/lib/order-service";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      seller: true,
      items: { include: { product: true } },
      invoices: true,
    },
  });
  if (!order) return fail("Order not found", 404);
  return ok(order);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json();
  const items = Array.isArray(body.items) ? body.items : [];
  if (!body.sellerId || !items.length) return fail("Seller and order items are required");

  try {
    const order = await updateOrderWithStock(id, {
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
    return ok(order);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to update order");
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    await deleteOrderWithStock(id);
    return ok({ success: true });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to delete order");
  }
}
