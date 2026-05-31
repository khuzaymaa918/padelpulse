"use client";

import { useCartStore } from "@/store/cart";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, tax, total } =
    useCartStore();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#0d0d0d] border-l border-white/8 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
          <div className="flex items-center gap-3">
            <ShoppingBag size={16} className="text-white/55" />
            <span className="text-[0.72rem] tracking-[0.2em] uppercase text-white/55">
              Your Cart
            </span>
            <span className="text-[0.72rem] text-white/30">
              ({items.length} {items.length === 1 ? "item" : "items"})
            </span>
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 border border-white/8 flex items-center justify-center text-white/55 hover:text-white hover:border-white/30 transition-all"
          >
            <X size={14} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag size={40} className="text-white/15" />
              <div className="text-[0.82rem] text-white/35">Your cart is empty</div>
              <button
                onClick={closeCart}
                className="text-[0.72rem] tracking-[0.12em] uppercase text-white/40 border border-white/15 px-4 py-2 hover:text-white hover:border-white/35 transition-all"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-white/6">
              {items.map((item) => (
                <div key={item.variantId} className="py-4 flex gap-4">
                  {/* Image */}
                  <div className="w-16 h-16 bg-[#111] flex-shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-6 h-10 border border-white/20 rounded-sm" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.62rem] tracking-[0.15em] uppercase text-white/35 mb-0.5">
                      {item.brand}
                    </div>
                    <div className="text-[0.85rem] font-medium text-white truncate">
                      {item.name}
                    </div>
                    <div className="text-[0.68rem] text-white/30 mt-0.5">
                      {[item.color, item.gripSize].filter(Boolean).join(" · ")}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Qty */}
                      <div className="flex items-center border border-white/18">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-white/55 hover:bg-gray hover:text-white transition-all"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-7 text-center text-[0.8rem] font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-7 h-7 flex items-center justify-center text-white/55 hover:bg-gray hover:text-white transition-all disabled:opacity-30"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="font-display text-[1.1rem] tracking-[0.04em]">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="text-[0.6rem] tracking-[0.1em] uppercase text-white/25 hover:text-red mt-2 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-white/8">
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex justify-between text-[0.78rem]">
                <span className="text-white/45">Subtotal</span>
                <span>Rs. {subtotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[0.78rem]">
                <span className="text-white/45">Shipping</span>
                <span className="text-green">Free</span>
              </div>
              <div className="flex justify-between text-[0.78rem]">
                <span className="text-white/45">GST (17%)</span>
                <span>Rs. {tax().toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-white/8">
                <span className="text-[0.75rem] tracking-[0.1em] uppercase">Total</span>
                <span className="font-display text-[1.4rem] tracking-[0.04em]">
                  Rs. {total().toLocaleString()}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full bg-white text-black text-center text-[0.78rem] font-medium tracking-[0.15em] uppercase py-4 hover:opacity-88 transition-opacity"
            >
              Checkout →
            </Link>
            <button
              onClick={closeCart}
              className="w-full mt-2 border border-white/15 text-white/45 text-[0.72rem] tracking-[0.12em] uppercase py-3 hover:text-white hover:border-white/30 transition-all"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
