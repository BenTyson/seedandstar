"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { OrderStatus } from "@prisma/client";

export async function getOrders(status?: OrderStatus) {
  return db.order.findMany({
    where: status ? { status } : undefined,
    include: {
      items: {
        include: {
          variant: {
            include: { product: true },
          },
        },
      },
      customer: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrder(id: string) {
  return db.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          variant: {
            include: { product: true },
          },
        },
      },
      customer: true,
      discountCode: true,
    },
  });
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const updateData: { status: OrderStatus; shippedAt?: Date; deliveredAt?: Date } = { status };

  if (status === "SHIPPED") {
    updateData.shippedAt = new Date();
  } else if (status === "DELIVERED") {
    updateData.deliveredAt = new Date();
  }

  await db.order.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);

  return { success: true };
}

export async function addTrackingNumber(id: string, trackingNumber: string) {
  await db.order.update({
    where: { id },
    data: {
      trackingNumber,
      status: "SHIPPED",
      shippedAt: new Date(),
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);

  return { success: true };
}

export async function cancelOrder(id: string) {
  // Get order with items to restore inventory
  const order = await db.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    return { success: false, error: "Order not found" };
  }

  // Restore inventory for each item
  for (const item of order.items) {
    await db.productVariant.update({
      where: { id: item.variantId },
      data: { inventory: { increment: item.quantity } },
    });
  }

  // Update order status
  await db.order.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);

  return { success: true };
}

export async function getOrderStats() {
  const [total, pending, processing, revenueResult] = await Promise.all([
    db.order.count(),
    db.order.count({ where: { status: { in: ["PENDING", "PAID"] } } }),
    db.order.count({ where: { status: "PROCESSING" } }),
    db.order.aggregate({
      where: { status: { notIn: ["CANCELLED", "REFUNDED"] } },
      _sum: { total: true },
    }),
  ]);

  return {
    total,
    pending,
    processing,
    revenue: revenueResult._sum.total || 0,
  };
}
