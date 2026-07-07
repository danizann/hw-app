import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api-helpers";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      seller: true,
      order: {
        include: {
          items: {
            include: { product: true },
          },
        },
      },
    },
  });
  if (!invoice) return fail("Invoice not found", 404);
  return ok(invoice);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json();
  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      type: body.type,
      sellerId: body.sellerId || null,
      orderId: body.orderId || null,
      status: body.status || "UNPAID",
      totalAmount: Number(body.totalAmount ?? 0),
      notes: body.notes || null,
      printedAt: body.printedAt ? new Date(body.printedAt) : null,
    },
  });
  return ok(invoice);
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await prisma.invoice.delete({ where: { id } });
  return ok({ success: true });
}
