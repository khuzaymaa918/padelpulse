import { prisma } from "@/lib/prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import OrderStatusUpdater from "./OrderStatusUpdater";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) notFound();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-[0.62rem] tracking-[0.15em] uppercase text-white/30 mb-1">
            <Link href="/admin/orders" className="hover:text-white transition-colors">Orders</Link> / {order.orderNumber}
          </div>
          <h1 className="font-display text-[2.5rem] tracking-[0.04em] leading-none">{order.orderNumber}</h1>
        </div>
        <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-6">
        {/* Left */}
        <div className="flex flex-col gap-6">
          {/* Items */}
          <div className="bg-[#0d0d0d] border border-white/8">
            <div className="px-6 py-4 border-b border-white/8 text-[0.62rem] tracking-[0.2em] uppercase text-white/30">
              Order Items
            </div>
            {order.items.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between px-6 py-4 border-b border-white/6 last:border-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#111] flex items-center justify-center flex-shrink-0">
                    <div className="w-3 h-5 border border-white/15 rounded-sm opacity-30" />
                  </div>
                  <div>
                    <div className="text-[0.82rem] font-medium">{item.productName}</div>
                    <div className="text-[0.65rem] text-white/30">
                      {item.productBrand}
                      {item.variantColor && ` · ${item.variantColor}`}
                      {item.variantGrip && ` · ${item.variantGrip}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8 text-[0.78rem]">
                  <span className="text-white/40">×{item.quantity}</span>
                  <span>Rs. {item.unitPrice.toLocaleString()}</span>
                  <span className="font-medium">Rs. {item.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            ))}
            {/* Totals */}
            <div className="px-6 py-4 border-t border-white/8 flex flex-col gap-2">
              {[
                ["Subtotal", `Rs. ${order.subtotal.toLocaleString()}`],
                ["Shipping", order.shippingAmount === 0 ? "Free" : `Rs. ${order.shippingAmount}`],
                ["Discount", order.discountAmount > 0 ? `−Rs. ${order.discountAmount.toLocaleString()}` : "—"],
                ["GST (17%)", `Rs. ${order.taxAmount.toLocaleString()}`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-[0.75rem]">
                  <span className="text-white/35">{label}</span>
                  <span>{value}</span>
                </div>
              ))}
              <div className="flex justify-between pt-3 border-t border-white/8 mt-1">
                <span className="text-[0.72rem] tracking-[0.1em] uppercase">Total</span>
                <span className="font-display text-[1.3rem]">Rs. {order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Tracking */}
          {order.trackingNumber && (
            <div className="bg-[#0d0d0d] border border-white/8 px-6 py-4">
              <div className="text-[0.62rem] tracking-[0.2em] uppercase text-white/30 mb-3">Tracking</div>
              <div className="text-[0.82rem]">{order.trackingNumber}</div>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex flex-col gap-4">
          {/* Customer */}
          <div className="bg-[#0d0d0d] border border-white/8 px-5 py-5">
            <div className="text-[0.62rem] tracking-[0.2em] uppercase text-white/30 mb-4">Customer</div>
            <div className="text-[0.82rem] font-medium mb-1">{order.shippingName}</div>
            <div className="text-[0.72rem] text-white/40">{order.shippingPhone}</div>
          </div>

          {/* Shipping */}
          <div className="bg-[#0d0d0d] border border-white/8 px-5 py-5">
            <div className="text-[0.62rem] tracking-[0.2em] uppercase text-white/30 mb-4">Shipping Address</div>
            <div className="text-[0.78rem] text-white/60 leading-[1.65]">
              {order.shippingAddress}<br />
              {order.shippingCity}{order.shippingPostal ? `, ${order.shippingPostal}` : ""}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-[#0d0d0d] border border-white/8 px-5 py-5">
            <div className="text-[0.62rem] tracking-[0.2em] uppercase text-white/30 mb-4">Payment</div>
            <div className="flex flex-col gap-2">
              {[
                ["Method", order.paymentMethod.replace("_", " ")],
                ["Status", order.paymentStatus],
                ["Delivery", order.deliveryMethod.replace("_", " ")],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-[0.75rem]">
                  <span className="text-white/35">{label}</span>
                  <span className={value === "PAID" ? "text-green" : value === "FAILED" ? "text-red" : ""}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-[#0d0d0d] border border-white/8 px-5 py-5">
              <div className="text-[0.62rem] tracking-[0.2em] uppercase text-white/30 mb-3">Notes</div>
              <div className="text-[0.75rem] text-white/45 leading-[1.65]">{order.notes}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
