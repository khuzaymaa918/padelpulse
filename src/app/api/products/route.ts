import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { ProductFilters } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const filters: ProductFilters = {
      category: searchParams.get("category") || undefined,
      brand: searchParams.getAll("brand"),
      level: searchParams.getAll("level"),
      shape: searchParams.getAll("shape"),
      minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
      maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
      inStock: searchParams.get("inStock") === "true",
      onSale: searchParams.get("onSale") === "true",
      search: searchParams.get("search") || undefined,
      sort: (searchParams.get("sort") as ProductFilters["sort"]) || "featured",
      page: Number(searchParams.get("page")) || 1,
      pageSize: Number(searchParams.get("pageSize")) || 12,
    };

    const where: any = {
      isActive: true,
      ...(filters.category && {
        category: { slug: filters.category },
      }),
      ...(filters.brand?.length && {
        brand: { slug: { in: filters.brand } },
      }),
      ...(filters.level?.length && {
        level: { in: filters.level },
      }),
      ...(filters.shape?.length && {
        shape: { in: filters.shape },
      }),
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
          { brand: { name: { contains: filters.search, mode: "insensitive" } } },
        ],
      }),
      ...(filters.inStock && {
        variants: { some: { stock: { gt: 0 }, isActive: true } },
      }),
      ...(filters.onSale && {
        variants: { some: { comparePrice: { not: null }, isActive: true } },
      }),
      ...((filters.minPrice || filters.maxPrice) && {
        variants: {
          some: {
            isActive: true,
            ...(filters.minPrice && { price: { gte: filters.minPrice } }),
            ...(filters.maxPrice && { price: { lte: filters.maxPrice } }),
          },
        },
      }),
    };

    const orderBy: any = {
      featured:   { isFeatured: "desc" },
      price_asc:  { variants: { _min: { price: "asc" } } },
      price_desc: { variants: { _min: { price: "desc" } } },
      newest:     { createdAt: "desc" },
      rating:     { reviews: { _count: "desc" } },
    }[filters.sort || "featured"] ?? { isFeatured: "desc" };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: ((filters.page || 1) - 1) * (filters.pageSize || 12),
        take: filters.pageSize || 12,
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
            where: { isPrimary: true },
            select: { id: true, url: true, altText: true, isPrimary: true },
            take: 1,
          },
          reviews: { select: { rating: true } },
          _count: { select: { reviews: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      data: products,
      total,
      page: filters.page || 1,
      pageSize: filters.pageSize || 12,
      totalPages: Math.ceil(total / (filters.pageSize || 12)),
    });
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
