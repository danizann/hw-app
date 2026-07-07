import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type OrderItemInput = {
  productId: string;
  qty: number;
  price: number;
};

const impactsStock = (status: string) => status !== "CANCELLED";

async function reserveStock(
  tx: Prisma.TransactionClient,
  items: OrderItemInput[],
  orderId: string,
  orderNumber: string
) {
  for (const item of items) {
    const product = await tx.product.findUnique({ where: { id: item.productId } });
    if (!product) {
      throw new Error("Product not found");
    }
    if (product.stock < item.qty) {
      throw new Error(`Insufficient stock for product ${product.name}`);
    }

    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.qty } },
    });

    await tx.stockLog.create({
      data: {
        productId: item.productId,
        type: "OUT",
        qty: item.qty,
        notes: `Order ${orderNumber}`,
        refType: "ORDER",
        refId: orderId,
      },
    });
  }
}

async function restoreStock(tx: Prisma.TransactionClient, orderId: string, items: OrderItemInput[]) {
  for (const item of items) {
    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.qty } },
    });
  }

  await tx.stockLog.deleteMany({
    where: { refType: "ORDER", refId: orderId },
  });
}

export async function createOrderWithStock(data: {
  orderNumber: string;
  sellerId: string;
  status: string;
  expedition?: string | null;
  trackingNumber?: string | null;
  notes?: string | null;
  items: OrderItemInput[];
}) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        orderNumber: data.orderNumber,
        sellerId: data.sellerId,
        status: data.status,
        expedition: data.expedition,
        trackingNumber: data.trackingNumber,
        notes: data.notes,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            qty: item.qty,
            price: item.price,
          })),
        },
      },
      include: {
        seller: true,
        items: { include: { product: true } },
      },
    });

    if (impactsStock(data.status)) {
      await reserveStock(tx, data.items, order.id, order.orderNumber);
    }

    return order;
  });
}

export async function updateOrderWithStock(
  orderId: string,
  data: {
    sellerId: string;
    status: string;
    expedition?: string | null;
    trackingNumber?: string | null;
    notes?: string | null;
    items: OrderItemInput[];
  }
) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!existing) {
      throw new Error("Order not found");
    }

    if (impactsStock(existing.status)) {
      await restoreStock(
        tx,
        existing.id,
        existing.items.map((item) => ({ productId: item.productId, qty: item.qty, price: item.price }))
      );
    }

    await tx.orderItem.deleteMany({ where: { orderId } });

    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        sellerId: data.sellerId,
        status: data.status,
        expedition: data.expedition,
        trackingNumber: data.trackingNumber,
        notes: data.notes,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            qty: item.qty,
            price: item.price,
          })),
        },
      },
      include: {
        seller: true,
        items: { include: { product: true } },
      },
    });

    if (impactsStock(data.status)) {
      await reserveStock(tx, data.items, updated.id, updated.orderNumber);
    }

    return updated;
  });
}

export async function deleteOrderWithStock(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!existing) {
      throw new Error("Order not found");
    }

    if (impactsStock(existing.status)) {
      await restoreStock(
        tx,
        existing.id,
        existing.items.map((item) => ({ productId: item.productId, qty: item.qty, price: item.price }))
      );
    }

    await tx.invoice.deleteMany({ where: { orderId } });
    await tx.order.delete({ where: { id: orderId } });
  });
}
