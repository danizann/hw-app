import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api-helpers";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      supplier: true,
      stockLogs: { orderBy: { createdAt: "desc" }, take: 20 },
      orderItems: { include: { order: true }, take: 10 },
    },
  });
  if (!product) return fail("Product not found", 404);
  return ok(product);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json();
  if (!body.name || !body.code) return fail("Product name and code are required");

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return fail("Product not found", 404);

  const nextStock = Number(body.stock ?? 0);
  const diff = nextStock - existing.stock;

  const product = await prisma.product.update({
    where: { id },
    data: {
      code: body.code,
      name: body.name,
      categoryId: body.categoryId || null,
      supplierId: body.supplierId || null,
      buyPrice: Number(body.buyPrice ?? 0),
      sellPrice: Number(body.sellPrice ?? 0),
      stock: nextStock,
      unit: body.unit || "pcs",
      photo: body.photo || null,
      lowStockAt: Number(body.lowStockAt ?? 10),
    },
  });

  if (diff !== 0) {
    await prisma.stockLog.create({
      data: {
        productId: id,
        type: diff > 0 ? "IN" : "OUT",
        qty: Math.abs(diff),
        notes: "Manual stock adjustment",
        refType: "PRODUCT",
        refId: id,
      },
    });
  }

  return ok(product);
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await prisma.stockLog.deleteMany({ where: { productId: id, refType: "PRODUCT", refId: id } });
  await prisma.product.delete({ where: { id } });
  return ok({ success: true });
}
