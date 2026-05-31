"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, tax, total, clearCart } = useCartStore();
  const [promoCode, setPromoCode] = useState("");
  const [promoData, setPromoData] = useState<any>(null);
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError("");
    setPromoData(null);
    try {
      const res = await fetch("/api/promos/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode, subtotal: subtotal() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPromoError(data.error);
      } else {
        setPromoData(data.data);
        toast.success(`Promo applied — ${data.data.discountType === "PERCENTAGE" ? `${data.data.discountValue}% off` : `Rs. ${data.data.discountValue} off`}`);
      }
    } catch {
      setPromoError("Failed to validate code");
    } finally {
      setPromoLoading(false);
    }
  };

  const discountAmount = promoData?.discount ?? 0;
  const finalTotal = total() - discountAmount;
  const shippingFree = subtotal() >= 5000;

  if (items.length === 0) {
    return (
      <div className="pt-24 min-h-screen flex flex-col items-center justify-center gap-6">
        <ShoppingBag size={48} className="text-white/15" />
        <div className="font-display text-[3rem] text-white/20">Your Cart is Empty</div>
        <p className="text-[0.82rem] text-white/35">Add some products to get started</p>
        <Link
          href="/shop"
          className="mt-4 bg-white text-black text-[0.78rem] font-medium tracking-[0.15em] uppercase px-8 py-4 hover:opacity-88 transition-opacity"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen">
      {/* Header */}
      <div className="px-10 py-8 border-b border-white/8">
        <div className="text-[0.62rem] tracking-[0.15em] uppercase text-white/30 mb-1">Shop /</div>
        <h1 className="font-display text-[3.5rem] tracking-[0.04em] leading-none">
          Your Cart <span className="text-white/30 text-[1.5rem]">({items.length} items)</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] min-h-[60vh]">
        {/* Items */}
        <div className="px-10 py-8 border-r border-white/8">
          <div className="flex flex-col divide-y divide-white/6">
            {items.map((item) => (
              <div key={item.variantId} className="py-6 grid grid-cols-[88px_1fr_auto] gap-5 items-start">
                {/* Image */}
                <div className="w-[88px] h-[88px] bg-[#111] flex items-center justify-center flex-shrink-0">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} width={88} height={88} className="object-cover w-full h-full" />
                  ) : (
                    <svg width="28" height="56" viewBox="0 0 100 200" fill="none" className="opacity-25">
                      <ellipse cx="50" cy="70" rx="38" ry="60" stroke="white" strokeWidth="3"/>
                      <line x1="50" y1="12" x2="50" y2="128" stroke="white" strokeWidth="1.5"/>
                      <line x1="15" y1="70" x2="85" y2="70" stroke="white" strokeWidth="1.5"/>
                      <rect x="43" y="128" width="14" height="58" rx="4" stroke="white" strokeWidth="2.5"/>
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div>
                  <div className="text-[0.62rem] tracking-[0.15em] uppercase text-white/35 mb-0.5">{item.brand}</div>
                  <div className="text-[0.92rem] font-medium text-white mb-1">{item.name}</div>
                  <div className="text-[0.7rem] text-white/30 mb-4">
                    {[item.color, item.gripSize].filter(Boolean).join(" · ")}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-white/18">
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-white/55 hover:bg-gray hover:text-white transition-all"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-[0.82rem] font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-8 h-8 flex items-center justify-center text-white/55 hover:bg-gray hover:text-white transition-all disabled:opacity-30"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      onClick={() => { removeItem(item.variantId); toast.success("Item removed"); }}
                      className="text-[0.62rem] tracking-[0.1em] uppercase text-white/25 hover:text-red transition-colors flex items-center gap-1"
                    >
                      <X size={10} /> Remove
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="font-display text-[1.3rem] tracking-[0.04em] whitespace-nowrap">
                  Rs. {(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Promo */}
          <div className="mt-6 pt-6 border-t border-white/8">
            <div className="flex gap-3 max-w-md">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Promo code"
                className="flex-1 bg-transparent border border-white/15 text-white text-[0.8rem] px-4 py-3 outline-none focus:border-white/35 placeholder:text-white/25 tracking-[0.04em]"
                onKeyDown={(e) => e.key === "Enter" && applyPromo()}
              />
              <button
                onClick={applyPromo}
                disabled={promoLoading}
                className="border border-white/20 text-white/55 text-[0.72rem] tracking-[0.12em] uppercase px-5 py-3 hover:text-white hover:border-white/40 transition-all disabled:opacity-50"
              >
                {promoLoading ? "..." : "Apply"}
              </button>
            </div>
            {promoError && <p className="mt-2 text-[0.7rem] text-red">{promoError}</p>}
            {promoData && (
              <p className="mt-2 text-[0.7rem] text-green">
                ✓ {promoData.description} — Rs. {promoData.discount.toLocaleString()} saved
              </p>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="px-8 py-8 bg-[#0d0d0d]">
          <div className="text-[0.62rem] tracking-[0.22em] uppercase text-white/30 mb-5 pb-3 border-b border-white/8">
            Order Summary
          </div>

          <div className="flex flex-col gap-0 mb-6">
            {[
              { label: "Subtotal", value: `Rs. ${subtotal().toLocaleString()}` },
              { label: "Shipping", value: shippingFree ? "Free" : "Rs. 200", green: shippingFree },
              ...(discountAmount > 0 ? [{ label: "Discount", value: `−Rs. ${discountAmount.toLocaleString()}`, green: true }] : []),
              { label: "GST (17%)", value: `Rs. ${tax().toLocaleString()}` },
            ].map((line) => (
              <div key={line.label} className="flex justify-between py-3 border-b border-white/6 text-[0.8rem]">
                <span className="text-white/45">{line.label}</span>
                <span className={line.green ? "text-green" : ""}>{line.value}</span>
              </div>
            ))}
            <div className="flex justify-between pt-4 mt-2 border-t border-white/15">
              <span className="text-[0.75rem] tracking-[0.1em] uppercase">Total</span>
              <span className="font-display text-[1.6rem] tracking-[0.04em]">
                Rs. {finalTotal.toLocaleString()}
              </span>
            </div>
          </div>

          <Link
            href={{ pathname: "/checkout", query: promoData ? { promoId: promoData.id, promoCode: promoData.code } : {} }}
            className="block w-full bg-white text-black text-center text-[0.78rem] font-medium tracking-[0.15em] uppercase py-4 hover:opacity-88 transition-opacity mb-3"
          >
            Proceed to Checkout →
          </Link>
          <Link
            href="/shop"
            className="block w-full border border-white/15 text-white/45 text-center text-[0.72rem] tracking-[0.12em] uppercase py-3 hover:text-white hover:border-white/30 transition-all"
          >
            ← Continue Shopping
          </Link>

          <div className="mt-6 pt-5 border-t border-white/8 flex flex-col gap-2">
            {["Free shipping on orders above Rs. 5,000", "7-day hassle-free returns", "100% genuine products", "Cash on delivery available"].map((t) => (
              <div key={t} className="flex items-center gap-2 text-[0.68rem] text-white/30">
                <div className="w-1 h-1 rounded-full bg-white/20 flex-shrink-0" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}