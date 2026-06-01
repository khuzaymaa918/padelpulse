export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma/client";
import OrdersClient from "./OrdersClient";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return <OrdersClient orders={orders} />;
}
