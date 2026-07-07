import { prisma } from "@/lib/prisma";
import { fail, getPagination, ok } from "@/lib/api-helpers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { page, limit } = getPagination(searchParams);
  const search = searchParams.get("search") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const lowStock = searchParams.get("lowStock") === "true";

  const where = {
    ...(search
      ? {
          OR: [
            { name: { contains: search } },
            { code: { contains: search } },
          ],
        }
      : {}),
    ...(categoryId ? { categoryId } : {}),
  } as const;


  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, supplier: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const filteredData = lowStock ? data.filter((item) => item.stock <= item.lowStockAt) : data;
  const filteredTotal = lowStock ? filteredData.length : total;
  return ok({ data: filteredData, total: filteredTotal, page, totalPages: Math.ceil(filteredTotal / limit) || 1 });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.name || !body.code) return fail("Product name and code are required");

  const product = await prisma.product.create({
    data: {
      code: body.code,
      name: body.name,
      categoryId: body.categoryId || null,
      supplierId: body.supplierId || null,
      buyPrice: Number(body.buyPrice ?? 0),
      sellPrice: Number(body.sellPrice ?? 0),
      stock: Number(body.stock ?? 0),
      unit: body.unit || "pcs",
      photo: body.photo || null,
      lowStockAt: Number(body.lowStockAt ?? 10),
    },
  });

  if (product.stock > 0) {
    await prisma.stockLog.create({
      data: {
        productId: product.id,
        type: "IN",
        qty: product.stock,
        notes: "Initial stock",
        refType: "PRODUCT",
        refId: product.id,
      },
    });
  }

  return ok(product, { status: 201 });
}
