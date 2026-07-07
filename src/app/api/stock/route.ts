import { prisma } from "@/lib/prisma";
import { getPagination, ok } from "@/lib/api-helpers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { page, limit } = getPagination(searchParams);
  const search = searchParams.get("search") ?? "";
  const type = searchParams.get("type") ?? "";

  const where = {
    ...(type ? { type } : {}),
    ...(search
      ? {
          OR: [
            { notes: { contains: search } },
            { product: { name: { contains: search } } },
            { product: { code: { contains: search } } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.stockLog.findMany({
      where,
      include: { product: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.stockLog.count({ where }),
  ]);

  return ok({ data, total, page, totalPages: Math.ceil(total / limit) || 1 });
}
