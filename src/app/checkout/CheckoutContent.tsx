"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

const schema = z.object({
  firstName: z.string().min(2, "Required"),
  lastName: z.string().min(2, "Required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Invalid phone"),
  street: z.string().min(5, "Required"),
  city: z.string().min(2, "Required"),
  province: z.string().min(2, "Required"),
  postalCode: z.string().optional(),
  deliveryMethod: z.enum(["STANDARD", "EXPRESS", "CASH_ON_DELIVERY"]),
  paymentMethod: z.enum(["CARD", "EASYPAISA", "JAZZCASH", "BANK_TRANSFER", "CASH_ON_DELIVERY"]),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const STEPS = ["Cart", "Details", "Payment", "Confirm"];
const CITIES = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta"];

export default function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, subtotal, tax, total, clearCart } = useCartStore();
  const [step, setStep] = useState(1);
  const [order, setOrder] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const promoId = searchParams.get("promoId");
  const promoCode = searchParams.get("promoCode");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      deliveryMethod: "STANDARD",
      paymentMethod: "CARD",
      province: "Punjab",
    },
  });

  const deliveryMethod = watch("deliveryMethod");
  const paymentMethod = watch("paymentMethod");

  const shippingCost = deliveryMethod === "EXPRESS" ? 350 : deliveryMethod === "CASH_ON_DELIVERY" ? 200 : 0;
  const finalTotal = total() + shippingCost;

  const onSubmit = async (data: FormData) => {
    if (step === 1) { setStep(2); return; }
    if (step === 2) { setStep(3); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          ...data,
          promoCodeId: promoId || undefined,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setOrder(result.data);
      clearCart();
      setStep(4);
    } catch (err: any) {
      toast.error(err.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  // Step indicator
  const StepBar = () => (
    <div className="flex items-center px-10 py-5 border-b border-white/8">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => i + 1 < step && setStep(i + 1)}>
            <div className={`w-6 h-6 flex items-center justify-center text-[0.65rem] font-medium transition-all ${
              i + 1 < step ? "bg-green text-black" :
              i + 1 === step ? "bg-white text-black" :
              "border border-white/20 text-white/35"
            }`}>
              {i + 1 < step ? "✓" : i + 1}
            </div>
            <span className={`text-[0.68rem] tracking-[0.14em] uppercase transition-colors ${
              i + 1 <= step ? "text-white" : "text-white/30"
            }`}>{s}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="w-12 h-px bg-white/10 mx-4" />
          )}
        </div>
      ))}
    </div>
  );

  // Order summary sidebar
  const OrderSummary = () => (
    <div className="bg-[#0d0d0d] p-8">
      <div className="text-[0.62rem] tracking-[0.22em] uppercase text-white/30 mb-5 pb-3 border-b border-white/8">
        Your Order
      </div>
      <div className="flex flex-col gap-0 mb-6">
        {items.map((item: any) => (
          <div key={item.variantId} className="flex items-center gap-3 py-3 border-b border-white/6">
            <div className="w-10 h-10 bg-[#111] flex-shrink-0 relative">
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white/25 rounded-full flex items-center justify-center text-[0.5rem] font-medium text-white">
                {item.quantity}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[0.75rem] font-medium truncate">{item.name}</div>
              <div className="text-[0.62rem] text-white/30">{[item.color, item.gripSize].filter(Boolean).join(" · ")}</div>
            </div>
            <div className="font-display text-[0.95rem]">Rs. {(item.price * item.quantity).toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-0">
        {[
          { label: "Subtotal", value: `Rs. ${subtotal().toLocaleString()}` },
          { label: "Shipping", value: shippingCost === 0 ? "Free" : `Rs. ${shippingCost}`, green: shippingCost === 0 },
          { label: "GST (17%)", value: `Rs. ${tax().toLocaleString()}` },
        ].map((l) => (
          <div key={l.label} className="flex justify-between py-2.5 border-b border-white/6 text-[0.78rem]">
            <span className="text-white/40">{l.label}</span>
            <span className={l.green ? "text-green" : ""}>{l.value}</span>
          </div>
        ))}
        <div className="flex justify-between pt-4 mt-1">
          <span className="text-[0.72rem] tracking-[0.1em] uppercase">Total</span>
          <span className="font-display text-[1.4rem]">Rs. {finalTotal.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );

  // STEP 4 — Confirmation
  if (step === 4 && order) {
    return (
      <div className="pt-24 min-h-screen">
        <StepBar />
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
            <rect x="80" y="60" width="640" height="480" fill="none" stroke="white" strokeWidth="1.5"/>
            <line x1="80" y1="300" x2="720" y2="300" stroke="white" strokeWidth="2"/>
            <line x1="400" y1="60" x2="400" y2="540" stroke="white" strokeWidth="1"/>
          </svg>
          <div className="w-16 h-16 border border-green rounded-full flex items-center justify-center mb-6 relative z-10">
            <CheckCircle size={28} className="text-green" />
          </div>
          <div className="text-[0.62rem] tracking-[0.25em] uppercase text-green mb-3 relative z-10">Order Confirmed</div>
          <h1 className="font-display text-[4rem] tracking-[0.04em] leading-none mb-4 relative z-10">
            You're On<br />The Court.
          </h1>
          <p className="text-[0.85rem] text-white/40 max-w-sm leading-[1.7] mb-10 relative z-10">
            Your order has been placed and is being prepared. You'll receive a WhatsApp confirmation shortly.
          </p>

          <div className="bg-gray w-full max-w-md p-6 text-left mb-8 relative z-10">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/8">
              <span className="text-[0.6rem] tracking-[0.2em] uppercase text-white/30">Order Number</span>
              <span className="font-display text-[1.1rem] tracking-[0.08em]">{order.orderNumber}</span>
            </div>
            {[
              ["Items", `${order.items.length} products`],
              ["Total Paid", `Rs. ${order.totalAmount.toLocaleString()}`],
              ["Payment", order.paymentMethod.replace("_", " ")],
              ["Delivery", "2–4 business days"],
              ["Status", "Processing"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2 border-b border-white/6 text-[0.78rem]">
                <span className="text-white/35">{label}</span>
                <span className={label === "Status" ? "text-green" : ""}>{value}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 relative z-10">
            <button
              onClick={() => router.push("/shop")}
              className="bg-white text-black text-[0.75rem] font-medium tracking-[0.14em] uppercase px-8 py-3 hover:opacity-88 transition-opacity"
            >
              Shop More
            </button>
            <button
              onClick={() => router.push("/")}
              className="border border-white/20 text-white/45 text-[0.75rem] tracking-[0.14em] uppercase px-8 py-3 hover:text-white hover:border-white/40 transition-all"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen">
      <StepBar />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px]">
          <div className="px-10 py-8 border-r border-white/8">

            {/* STEP 1 — Details */}
            {step === 1 && (
              <div className="max-w-lg">
                <div className="text-[0.62rem] tracking-[0.2em] uppercase text-white/30 mb-6 pb-2 border-b border-white/8">
                  Contact Information
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {[
                    { name: "firstName", label: "First Name", placeholder: "Ahmed" },
                    { name: "lastName", label: "Last Name", placeholder: "Khan" },
                  ].map((f) => (
                    <div key={f.name}>
                      <label className="block text-[0.62rem] tracking-[0.16em] uppercase text-white/35 mb-2">{f.label}</label>
                      <input
                        {...register(f.name as any)}
                        placeholder={f.placeholder}
                        className="w-full bg-transparent border border-white/15 text-white text-[0.82rem] px-4 py-3 outline-none focus:border-white/35 placeholder:text-white/20"
                      />
                      {errors[f.name as keyof FormData] && (
                        <p className="mt-1 text-[0.65rem] text-red">{errors[f.name as keyof FormData]?.message}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-4 mb-8">
                  {[
                    { name: "email", label: "Email", placeholder: "ahmed@example.com", type: "email" },
                    { name: "phone", label: "Phone", placeholder: "+92 300 0000000", type: "tel" },
                  ].map((f) => (
                    <div key={f.name}>
                      <label className="block text-[0.62rem] tracking-[0.16em] uppercase text-white/35 mb-2">{f.label}</label>
                      <input
                        {...register(f.name as any)}
                        type={f.type}
                        placeholder={f.placeholder}
                        className="w-full bg-transparent border border-white/15 text-white text-[0.82rem] px-4 py-3 outline-none focus:border-white/35 placeholder:text-white/20"
                      />
                      {errors[f.name as keyof FormData] && (
                        <p className="mt-1 text-[0.65rem] text-red">{errors[f.name as keyof FormData]?.message}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="text-[0.62rem] tracking-[0.2em] uppercase text-white/30 mb-6 pb-2 border-b border-white/8">
                  Delivery Address
                </div>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="block text-[0.62rem] tracking-[0.16em] uppercase text-white/35 mb-2">Street Address</label>
                    <input
                      {...register("street")}
                      placeholder="House no., Street, Area"
                      className="w-full bg-transparent border border-white/15 text-white text-[0.82rem] px-4 py-3 outline-none focus:border-white/35 placeholder:text-white/20"
                    />
                    {errors.street && <p className="mt-1 text-[0.65rem] text-red">{errors.street.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div>
                    <label className="block text-[0.62rem] tracking-[0.16em] uppercase text-white/35 mb-2">City</label>
                    <select
                      {...register("city")}
                      className="w-full bg-gray border border-white/15 text-white text-[0.82rem] px-4 py-3 outline-none appearance-none cursor-pointer"
                    >
                      {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[0.62rem] tracking-[0.16em] uppercase text-white/35 mb-2">Postal Code</label>
                    <input
                      {...register("postalCode")}
                      placeholder="54000"
                      className="w-full bg-transparent border border-white/15 text-white text-[0.82rem] px-4 py-3 outline-none focus:border-white/35 placeholder:text-white/20"
                    />
                  </div>
                </div>

                <div className="text-[0.62rem] tracking-[0.2em] uppercase text-white/30 mb-4 pb-2 border-b border-white/8">
                  Delivery Method
                </div>
                <div className="flex flex-col gap-2 mb-8">
                  {[
                    { value: "STANDARD", label: "Standard Delivery", sub: "2–4 business days", price: "Free" },
                    { value: "EXPRESS", label: "Express Delivery", sub: "Next business day", price: "Rs. 350" },
                    { value: "CASH_ON_DELIVERY", label: "Cash on Delivery", sub: "3–5 days, pay on receipt", price: "Rs. 200" },
                  ].map((opt) => (
                    <label key={opt.value} className={`flex items-center justify-between p-4 border cursor-pointer transition-all ${
                      deliveryMethod === opt.value ? "border-white/25 bg-gray" : "border-white/8 hover:border-white/20"
                    }`}>
                      <div className="flex items-center gap-4">
                        <input type="radio" value={opt.value} {...register("deliveryMethod")} className="accent-white" />
                        <div>
                          <div className="text-[0.82rem] font-medium">{opt.label}</div>
                          <div className="text-[0.7rem] text-white/35">{opt.sub}</div>
                        </div>
                      </div>
                      <div className={`text-[0.82rem] font-medium ${opt.price === "Free" ? "text-green" : ""}`}>{opt.price}</div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2 — Payment */}
            {step === 2 && (
              <div className="max-w-lg">
                <div className="text-[0.62rem] tracking-[0.2em] uppercase text-white/30 mb-6 pb-2 border-b border-white/8">
                  Payment Method
                </div>
                <div className="grid grid-cols-2 gap-2 mb-8">
                  {[
                    { value: "CARD", label: "Credit / Debit Card" },
                    { value: "EASYPAISA", label: "EasyPaisa" },
                    { value: "JAZZCASH", label: "JazzCash" },
                    { value: "CASH_ON_DELIVERY", label: "Cash on Delivery" },
                  ].map((opt) => (
                    <label key={opt.value} className={`flex items-center gap-3 p-4 border cursor-pointer transition-all ${
                      paymentMethod === opt.value ? "border-white/25 bg-gray" : "border-white/8 hover:border-white/20"
                    }`}>
                      <input type="radio" value={opt.value} {...register("paymentMethod")} className="accent-white" />
                      <span className="text-[0.78rem]">{opt.label}</span>
                    </label>
                  ))}
                </div>

                {paymentMethod === "CARD" && (
                  <div className="bg-gray p-5 mb-6">
                    <div className="text-[0.68rem] tracking-[0.12em] uppercase text-white/30 mb-4">
                      Card details will be collected securely via Safepay
                    </div>
                    <div className="flex items-center gap-2 text-[0.72rem] text-white/40">
                      <span>🔒</span> 256-bit SSL encrypted · PCI DSS Compliant
                    </div>
                  </div>
                )}

                {(paymentMethod === "EASYPAISA" || paymentMethod === "JAZZCASH") && (
                  <div className="bg-gray p-5 mb-6">
                    <div className="text-[0.72rem] text-white/45 leading-[1.65]">
                      You'll be redirected to {paymentMethod === "EASYPAISA" ? "EasyPaisa" : "JazzCash"} to complete the payment after placing your order.
                    </div>
                  </div>
                )}

                <div className="text-[0.62rem] tracking-[0.2em] uppercase text-white/30 mb-4 pb-2 border-b border-white/8">
                  Shipping Address (Review)
                </div>
                <div className="bg-gray p-4 mb-6">
                  <div className="text-[0.72rem] text-white/50 leading-[1.7]">
                    Delivery to your provided address.<br />
                    <button type="button" onClick={() => setStep(1)} className="text-white/40 underline text-[0.68rem] mt-1">Edit address</button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-[0.62rem] tracking-[0.16em] uppercase text-white/35 mb-2">Order Notes (optional)</label>
                  <textarea
                    {...register("notes")}
                    placeholder="Any special instructions..."
                    rows={3}
                    className="w-full bg-transparent border border-white/15 text-white text-[0.82rem] px-4 py-3 outline-none focus:border-white/35 placeholder:text-white/20 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 max-w-lg">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 border border-white/15 text-white/45 text-[0.72rem] tracking-[0.12em] uppercase py-4 hover:text-white hover:border-white/30 transition-all"
                >
                  ← Back
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-white text-black text-[0.78rem] font-medium tracking-[0.15em] uppercase py-4 hover:opacity-88 transition-opacity disabled:opacity-50"
              >
                {submitting ? "Placing Order..." :
                  step === 1 ? "Continue to Payment →" :
                  step === 2 ? `Place Order — Rs. ${finalTotal.toLocaleString()} →` :
                  "Next →"}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <OrderSummary />
        </div>
      </form>
    </div>
  );
}