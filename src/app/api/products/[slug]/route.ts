import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
        variants: {
          where: { isActive: true },
          select: {
            id: true, color: true, gripSize: true, sku: true,
            price: true, comparePrice: true, stock: true, isActive: true,
          },
        },
        images: {
          orderBy: { sortOrder: "asc" },
          select: { id: true, url: true, altText: true, isPrimary: true, sortOrder: true },
        },
        reviews: {
          where: { isVisible: true },
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { reviews: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Related products — same category, exclude current
    const related = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        isActive: true,
        id: { not: product.id },
      },
      take: 4,
      include: {
        brand: { select: { name: true } },
        variants: {
          where: { isActive: true },
          select: { price: true, comparePrice: true, stock: true },
          take: 1,
        },
        images: {
          where: { isPrimary: true },
          select: { url: true, altText: true },
          take: 1,
        },
      },
    });

    return NextResponse.json({ data: product, related });
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
