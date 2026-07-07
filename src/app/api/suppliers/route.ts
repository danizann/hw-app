import { prisma } from "@/lib/prisma";
import { fail, getPagination, ok } from "@/lib/api-helpers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { page, limit } = getPagination(searchParams);
  const search = searchParams.get("search") ?? "";

  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
        ],
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.supplier.findMany({
      where,
      include: { _count: { select: { products: true, purchases: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.supplier.count({ where }),
  ]);

  return ok({ data, total, page, totalPages: Math.ceil(total / limit) || 1 });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.name) return fail("Supplier name is required");

  const supplier = await prisma.supplier.create({
    data: {
      name: body.name,
      phone: body.phone,
      email: body.email,
      address: body.address,
      notes: body.notes,
    },
  });

  return ok(supplier, { status: 201 });
}
