import { prisma } from "@/lib/prisma";
import { fail, getPagination, ok } from "@/lib/api-helpers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { page, limit } = getPagination(searchParams);
  const search = searchParams.get("search") ?? "";
  const marketplace = searchParams.get("marketplace") ?? "";

  const where = {
    ...(search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : {}),
    ...(marketplace ? { marketplace } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.seller.findMany({
      where,
      include: { _count: { select: { orders: true, invoices: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.seller.count({ where }),
  ]);

  return ok({ data, total, page, totalPages: Math.ceil(total / limit) || 1 });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.name) return fail("Seller name is required");

  const seller = await prisma.seller.create({
    data: {
      name: body.name,
      phone: body.phone,
      email: body.email,
      marketplace: body.marketplace,
      address: body.address,
      notes: body.notes,
    },
  });

  return ok(seller, { status: 201 });
}
