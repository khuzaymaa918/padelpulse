import { prisma } from "@/lib/prisma/client";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true } },
      orders: {
        select: { totalAmount: true, paymentStatus: true },
      },
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-[2.5rem] tracking-[0.04em] leading-none mb-1">Customers</h1>
        <p className="text-[0.75rem] text-white/35">{customers.length} registered customers</p>
      </div>

      <div className="bg-[#0d0d0d] border border-white/8">
        <div className="grid grid-cols-[1fr_140px_80px_120px_100px] gap-4 px-6 py-3 border-b border-white/8">
          {["Customer", "Phone", "Orders", "Total Spent", "Joined"].map((h) => (
            <div key={h} className="text-[0.58rem] tracking-[0.2em] uppercase text-white/25">{h}</div>
          ))}
        </div>

        {customers.length === 0 ? (
          <div className="px-6 py-12 text-center text-[0.78rem] text-white/25">
            No customers yet
          </div>
        ) : (
          customers.map((customer: any) => {
            const totalSpent = customer.orders
              .filter((o) => o.paymentStatus === "PAID")
              .reduce((sum, o) => sum + o.totalAmount, 0);
            return (
              <div
                key={customer.id}
                className="grid grid-cols-[1fr_140px_80px_120px_100px] gap-4 px-6 py-4 border-b border-white/6 last:border-0 hover:bg-gray/30 transition-colors items-center"
              >
                <div>
                  <div className="text-[0.82rem] font-medium">{customer.name || "—"}</div>
                  <div className="text-[0.65rem] text-white/30">{customer.email}</div>
                </div>
                <div className="text-[0.75rem] text-white/45">{customer.phone || "—"}</div>
                <div className="text-[0.82rem]">{customer._count.orders}</div>
                <div className="font-display text-[0.95rem]">
                  {totalSpent > 0 ? `Rs. ${totalSpent.toLocaleString()}` : "—"}
                </div>
                <div className="text-[0.68rem] text-white/30">
                  {new Date(customer.createdAt).toLocaleDateString("en-PK")}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
