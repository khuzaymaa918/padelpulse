import { prisma } from "@/lib/prisma/client";
import Link from "next/link";
import { Package, ShoppingBag, Users, TrendingUp } from "lucide-react";

async function getStats() {
  const [
    totalOrders, totalProducts, totalCustomers,
    pendingOrders, recentOrders, revenue
  ] = await Promise.all([
    prisma.order.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.user.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { totalAmount: true },
    }),
  ]);

  return { totalOrders, totalProducts, totalCustomers, pendingOrders, recentOrders, revenue };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    {
      label: "Total Revenue",
      value: `Rs. ${(stats.revenue._sum.totalAmount ?? 0).toLocaleString()}`,
      sub: "From paid orders",
      icon: TrendingUp,
      color: "text-green",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      sub: `${stats.pendingOrders} pending`,
      icon: ShoppingBag,
      color: "text-white",
    },
    {
      label: "Products",
      value: stats.totalProducts,
      sub: "Active listings",
      icon: Package,
      color: "text-white",
    },
    {
      label: "Customers",
      value: stats.totalCustomers,
      sub: "Registered users",
      icon: Users,
      color: "text-white",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-[2.5rem] tracking-[0.04em] leading-none mb-1">Dashboard</h1>
        <p className="text-[0.75rem] text-white/35">Welcome back. Here's what's happening.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-px bg-white/8 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-[#0d0d0d] p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="text-[0.62rem] tracking-[0.18em] uppercase text-white/30">{card.label}</div>
              <card.icon size={16} className={`${card.color} opacity-40`} />
            </div>
            <div className={`font-display text-[2.2rem] tracking-[0.04em] leading-none mb-1 ${card.color}`}>
              {card.value}
            </div>
            <div className="text-[0.68rem] text-white/25">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-[#0d0d0d] border border-white/8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <span className="text-[0.65rem] tracking-[0.2em] uppercase text-white/40">Recent Orders</span>
          <Link href="/admin/orders" className="text-[0.62rem] tracking-[0.1em] uppercase text-white/30 hover:text-white transition-colors">
            View All →
          </Link>
        </div>
        <div>
          {stats.recentOrders.length === 0 ? (
            <div className="px-6 py-8 text-center text-[0.78rem] text-white/25">No orders yet</div>
          ) : (
            stats.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between px-6 py-4 border-b border-white/6 last:border-0 hover:bg-gray/30 transition-colors">
                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-[0.8rem] font-medium">{order.orderNumber}</div>
                    <div className="text-[0.65rem] text-white/30">{order.shippingName}</div>
                  </div>
                  <div className="text-[0.68rem] text-white/30">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</div>
                </div>
                <div className="flex items-center gap-6">
                  <StatusBadge status={order.status} />
                  <div className="font-display text-[1rem]">Rs. {order.totalAmount.toLocaleString()}</div>
                  <div className="text-[0.65rem] text-white/25">
                    {new Date(order.createdAt).toLocaleDateString("en-PK")}
                  </div>
                  <Link href={`/admin/orders/${order.id}`} className="text-[0.62rem] tracking-[0.1em] uppercase text-white/25 hover:text-white transition-colors">
                    View →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    CONFIRMED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    PROCESSING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    SHIPPED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    DELIVERED: "bg-green/10 text-green border-green/20",
    CANCELLED: "bg-red/10 text-red border-red/20",
    REFUNDED: "bg-red/10 text-red border-red/20",
  };
  return (
    <span className={`text-[0.58rem] tracking-[0.12em] uppercase border px-2 py-1 ${styles[status] ?? "bg-white/5 text-white/40 border-white/10"}`}>
      {status}
    </span>
  );
}
