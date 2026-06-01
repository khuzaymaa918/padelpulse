"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export default function NewPromoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minOrderAmount: "",
    maxUses: "",
    expiresAt: "",
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.discountValue) {
      toast.error("Code and discount value are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          code: form.code.toUpperCase(),
          discountValue: parseInt(form.discountValue),
          minOrderAmount: form.minOrderAmount ? parseInt(form.minOrderAmount) : null,
          maxUses: form.maxUses ? parseInt(form.maxUses) : null,
          expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Promo code created!");
      router.push("/admin/promos");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="text-[0.62rem] tracking-[0.15em] uppercase text-white/30 mb-1">
          <Link href="/admin/promos" className="hover:text-white transition-colors">Promo Codes</Link> / New
        </div>
        <h1 className="font-display text-[2.5rem] tracking-[0.04em] leading-none">New Promo Code</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="bg-[#0d0d0d] border border-white/8 p-6 flex flex-col gap-5">

          <div>
            <label className="block text-[0.62rem] tracking-[0.16em] uppercase text-white/35 mb-2">
              Code <span className="text-red">*</span>
            </label>
            <input
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="PADEL10"
              className="w-full bg-transparent border border-white/15 text-white text-[0.9rem] tracking-[0.12em] font-medium px-4 py-3 outline-none focus:border-white/35 placeholder:text-white/20"
            />
          </div>

          <div>
            <label className="block text-[0.62rem] tracking-[0.16em] uppercase text-white/35 mb-2">Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="10% off your first order"
              className="w-full bg-transparent border border-white/15 text-white text-[0.82rem] px-4 py-3 outline-none focus:border-white/35 placeholder:text-white/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.62rem] tracking-[0.16em] uppercase text-white/35 mb-2">Discount Type</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}
                className="w-full bg-gray border border-white/15 text-white text-[0.82rem] px-4 py-3 outline-none appearance-none cursor-pointer"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (Rs.)</option>
              </select>
            </div>
            <div>
              <label className="block text-[0.62rem] tracking-[0.16em] uppercase text-white/35 mb-2">
                Discount Value <span className="text-red">*</span>
              </label>
              <input
                type="number"
                value={form.discountValue}
                onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                placeholder={form.discountType === "PERCENTAGE" ? "10" : "500"}
                className="w-full bg-transparent border border-white/15 text-white text-[0.82rem] px-4 py-3 outline-none focus:border-white/35 placeholder:text-white/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.62rem] tracking-[0.16em] uppercase text-white/35 mb-2">Min Order (Rs.)</label>
              <input
                type="number"
                value={form.minOrderAmount}
                onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))}
                placeholder="5000"
                className="w-full bg-transparent border border-white/15 text-white text-[0.82rem] px-4 py-3 outline-none focus:border-white/35 placeholder:text-white/20"
              />
            </div>
            <div>
              <label className="block text-[0.62rem] tracking-[0.16em] uppercase text-white/35 mb-2">Max Uses</label>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                placeholder="100"
                className="w-full bg-transparent border border-white/15 text-white text-[0.82rem] px-4 py-3 outline-none focus:border-white/35 placeholder:text-white/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-[0.62rem] tracking-[0.16em] uppercase text-white/35 mb-2">Expires At (optional)</label>
            <input
              type="datetime-local"
              value={form.expiresAt}
              onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
              className="w-full bg-transparent border border-white/15 text-white text-[0.82rem] px-4 py-3 outline-none focus:border-white/35"
            />
          </div>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-[0.75rem] text-white/55">Active immediately</span>
            <div
              onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${form.isActive ? "bg-green" : "bg-gray"}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.isActive ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-white text-black text-[0.75rem] font-medium tracking-[0.15em] uppercase py-3 hover:opacity-88 transition-opacity disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Promo Code"}
            </button>
            <Link
              href="/admin/promos"
              className="flex-1 border border-white/15 text-white/40 text-[0.72rem] tracking-[0.12em] uppercase py-3 text-center hover:text-white hover:border-white/30 transition-all"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
