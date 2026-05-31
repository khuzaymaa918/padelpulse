import ProductForm from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma/client";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <div className="mb-8">
        <div className="text-[0.62rem] tracking-[0.15em] uppercase text-white/30 mb-1">
          Products / Edit
        </div>
        <h1 className="font-display text-[2.5rem] tracking-[0.04em] leading-none">
          Edit Product
        </h1>
      </div>
      <ProductForm categories={categories} brands={brands} product={product as any} />
    </div>
  );
}
