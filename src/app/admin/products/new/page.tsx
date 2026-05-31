import ProductForm from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma/client";

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <div className="mb-8">
        <div className="text-[0.62rem] tracking-[0.15em] uppercase text-white/30 mb-1">
          Products / New
        </div>
        <h1 className="font-display text-[2.5rem] tracking-[0.04em] leading-none">
          Add Product
        </h1>
      </div>
      <ProductForm categories={categories} brands={brands} />
    </div>
  );
}
