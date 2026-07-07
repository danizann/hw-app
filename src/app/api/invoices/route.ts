import { prisma } from "@/lib/prisma";
import { fail, getPagination, ok } from "@/lib/api-helpers";
import { generateInvoiceNumber } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { page, limit } = getPagination(searchParams);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const type = searchParams.get("type") ?? "";

  const where = {
    ...(search
      ? {
          OR: [
            { invoiceNumber: { contains: search } },
            { seller: { name: { contains: search } } },
            { order: { orderNumber: { contains: search } } },
          ],
        }
      : {}),
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: { seller: true, order: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.invoice.count({ where }),
  ]);

  return ok({ data, total, page, totalPages: Math.ceil(total / limit) || 1 });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.type) return fail("Invoice type is required");

  let totalAmount = Number(body.totalAmount ?? 0);
  let sellerId = body.sellerId || null;

  if (body.orderId) {
    const order = await prisma.order.findUnique({
      where: { id: body.orderId },
      include: { items: true, seller: true },
    });
    if (!order) return fail("Order not found", 404);
    totalAmount = totalAmount || order.items.reduce((sum, item) => sum + item.qty * item.price, 0);
    sellerId = sellerId || order.sellerId;
  }

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: body.invoiceNumber || generateInvoiceNumber(),
      type: body.type,
      sellerId,
      orderId: body.orderId || null,
      status: body.status || "UNPAID",
      totalAmount,
      notes: body.notes || null,
      printedAt: body.printedAt ? new Date(body.printedAt) : null,
    },
    include: { seller: true, order: true },
  });

  return ok(invoice, { status: 201 });
}
