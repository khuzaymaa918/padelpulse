import { prisma } from "@/lib/prisma/client";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      brand: { select: { name: true } },
      category: { select: { name: true } },
      variants: { select: { price: true, stock: true } },
      images: { where: { isPrimary: true }, take: 1 },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-[2.5rem] tracking-[0.04em] leading-none mb-1">Products</h1>
          <p className="text-[0.75rem] text-white/35">{products.length} total products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-white text-black text-[0.72rem] font-medium tracking-[0.12em] uppercase px-5 py-3 hover:opacity-88 transition-opacity"
        >
          <Plus size={14} /> Add Product
        </Link>
      </div>

      <div className="bg-[#0d0d0d] border border-white/8">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_120px_100px_100px_80px_100px] gap-4 px-6 py-3 border-b border-white/8">
          {["Product", "Brand", "Category", "Price", "Stock", "Actions"].map((h) => (
            <div key={h} className="text-[0.58rem] tracking-[0.2em] uppercase text-white/25">{h}</div>
          ))}
        </div>

        {products.length === 0 ? (
          <div className="px-6 py-12 text-center text-[0.78rem] text-white/25">
            No products yet.{" "}
            <Link href="/admin/products/new" className="text-white underline">Add your first product</Link>
          </div>
        ) : (
          products.map((product) => {
            const minPrice = Math.min(...product.variants.map((v) => v.price));
            const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
            return (
              <div
                key={product.id}
                className="grid grid-cols-[1fr_120px_100px_100px_80px_100px] gap-4 px-6 py-4 border-b border-white/6 last:border-0 hover:bg-gray/30 transition-colors items-center"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-[#111] flex-shrink-0 flex items-center justify-center">
                    <div className="w-3 h-6 border border-white/15 rounded-sm opacity-40" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[0.82rem] font-medium truncate">{product.name}</div>
                    <div className="text-[0.62rem] text-white/25">{product.slug}</div>
                  </div>
                </div>
                <div className="text-[0.75rem] text-white/55">{product.brand.name}</div>
                <div className="text-[0.75rem] text-white/55">{product.category.name}</div>
                <div className="font-display text-[0.95rem]">
                  Rs. {minPrice.toLocaleString()}
                </div>
                <div className={`text-[0.75rem] font-medium ${totalStock === 0 ? "text-red" : totalStock < 5 ? "text-yellow-400" : "text-green"}`}>
                  {totalStock}
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="text-[0.62rem] tracking-[0.1em] uppercase text-white/30 hover:text-white transition-colors"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/products/${product.slug}`}
                    target="_blank"
                    className="text-[0.62rem] tracking-[0.1em] uppercase text-white/30 hover:text-white transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}