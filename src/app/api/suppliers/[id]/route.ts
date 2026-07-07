import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api-helpers";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      products: { include: { category: true }, orderBy: { createdAt: "desc" } },
      purchases: { include: { items: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!supplier) return fail("Supplier not found", 404);
  return ok(supplier);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json();
  if (!body.name) return fail("Supplier name is required");

  const supplier = await prisma.supplier.update({
    where: { id },
    data: {
      name: body.name,
      phone: body.phone,
      email: body.email,
      address: body.address,
      notes: body.notes,
    },
  });

  return ok(supplier);
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await prisma.supplier.delete({ where: { id } });
  return ok({ success: true });
}
