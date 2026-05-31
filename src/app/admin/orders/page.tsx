import { prisma } from "@/lib/prisma/client";
import Link from "next/link";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-[2.5rem] tracking-[0.04em] leading-none mb-1">Orders</h1>
        <p className="text-[0.75rem] text-white/35">{orders.length} total orders</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-px bg-white/8 mb-6 w-fit">
        {["All", "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"].map((tab) => (
          <button
            key={tab}
            className={`px-5 py-2.5 text-[0.65rem] tracking-[0.12em] uppercase transition-colors ${
              tab === "All" ? "bg-white text-black" : "bg-[#0d0d0d] text-white/40 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-[#0d0d0d] border border-white/8">
        {/* Header */}
        <div className="grid grid-cols-[1fr_140px_120px_120px_100px_80px] gap-4 px-6 py-3 border-b border-white/8">
          {["Order", "Customer", "Status", "Payment", "Total", "Actions"].map((h) => (
            <div key={h} className="text-[0.58rem] tracking-[0.2em] uppercase text-white/25">{h}</div>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="px-6 py-12 text-center text-[0.78rem] text-white/25">No orders yet</div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="grid grid-cols-[1fr_140px_120px_120px_100px_80px] gap-4 px-6 py-4 border-b border-white/6 last:border-0 hover:bg-gray/30 transition-colors items-center"
            >
              <div>
                <div className="text-[0.82rem] font-medium">{order.orderNumber}</div>
                <div className="text-[0.62rem] text-white/25">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""} ·{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-PK")}
                </div>
              </div>
              <div>
                <div className="text-[0.75rem] truncate">{order.shippingName}</div>
                <div className="text-[0.62rem] text-white/25">{order.shippingCity}</div>
              </div>
              <StatusBadge status={order.status} />
              <PaymentBadge status={order.paymentStatus} />
              <div className="font-display text-[1rem]">Rs. {order.totalAmount.toLocaleString()}</div>
              <Link
                href={`/admin/orders/${order.id}`}
                className="text-[0.62rem] tracking-[0.1em] uppercase text-white/30 hover:text-white transition-colors"
              >
                View →
              </Link>
            </div>
          ))
        )}
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
    <span className={`text-[0.58rem] tracking-[0.12em] uppercase border px-2 py-1 w-fit ${styles[status] ?? "bg-white/5 text-white/40 border-white/10"}`}>
      {status}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PAID: "bg-green/10 text-green border-green/20",
    UNPAID: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    FAILED: "bg-red/10 text-red border-red/20",
    REFUNDED: "bg-red/10 text-red border-red/20",
  };
  return (
    <span className={`text-[0.58rem] tracking-[0.12em] uppercase border px-2 py-1 w-fit ${styles[status] ?? "bg-white/5 text-white/40 border-white/10"}`}>
      {status}
    </span>
  );
}