import { prisma } from "@/lib/prisma/client";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AdminPromosPage() {
  const promos = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-[2.5rem] tracking-[0.04em] leading-none mb-1">Promo Codes</h1>
          <p className="text-[0.75rem] text-white/35">{promos.length} codes</p>
        </div>
        <Link
          href="/admin/promos/new"
          className="flex items-center gap-2 bg-white text-black text-[0.72rem] font-medium tracking-[0.12em] uppercase px-5 py-3 hover:opacity-88 transition-opacity"
        >
          <Plus size={14} /> New Code
        </Link>
      </div>

      <div className="bg-[#0d0d0d] border border-white/8">
        <div className="grid grid-cols-[120px_1fr_100px_80px_80px_80px_80px] gap-4 px-6 py-3 border-b border-white/8">
          {["Code", "Description", "Discount", "Min Order", "Uses", "Active", "Expires"].map((h) => (
            <div key={h} className="text-[0.58rem] tracking-[0.2em] uppercase text-white/25">{h}</div>
          ))}
        </div>
        {promos.map((promo) => (
          <div
            key={promo.id}
            className="grid grid-cols-[120px_1fr_100px_80px_80px_80px_80px] gap-4 px-6 py-4 border-b border-white/6 last:border-0 items-center hover:bg-gray/30 transition-colors"
          >
            <div className="font-display text-[0.95rem] tracking-[0.06em] text-green">{promo.code}</div>
            <div className="text-[0.75rem] text-white/50 truncate">{promo.description || "—"}</div>
            <div className="text-[0.78rem]">
              {promo.discountType === "PERCENTAGE" ? `${promo.discountValue}%` : `Rs. ${promo.discountValue}`}
            </div>
            <div className="text-[0.75rem] text-white/45">
              {promo.minOrderAmount ? `Rs. ${promo.minOrderAmount.toLocaleString()}` : "—"}
            </div>
            <div className="text-[0.75rem] text-white/45">
              {promo.usedCount}{promo.maxUses ? `/${promo.maxUses}` : ""}
            </div>
            <div>
              <span className={`text-[0.58rem] tracking-[0.1em] uppercase border px-2 py-1 ${
                promo.isActive ? "text-green border-green/25" : "text-red border-red/25"
              }`}>
                {promo.isActive ? "Active" : "Off"}
              </span>
            </div>
            <div className="text-[0.68rem] text-white/30">
              {promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString("en-PK") : "Never"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}