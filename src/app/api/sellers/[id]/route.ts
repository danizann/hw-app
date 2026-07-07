import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api-helpers";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const seller = await prisma.seller.findUnique({
    where: { id },
    include: {
      orders: { include: { items: true }, orderBy: { createdAt: "desc" } },
      invoices: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!seller) return fail("Seller not found", 404);
  return ok(seller);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json();
  if (!body.name) return fail("Seller name is required");

  const seller = await prisma.seller.update({
    where: { id },
    data: {
      name: body.name,
      phone: body.phone,
      email: body.email,
      marketplace: body.marketplace,
      address: body.address,
      notes: body.notes,
    },
  });

  return ok(seller);
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await prisma.seller.delete({ where: { id } });
  return ok({ success: true });
}
