import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, slug, description, categoryId, brandId,
      isActive, isFeatured, shape, level, material,
      weight, balance, core, variants, images,
    } = body;

    const product = await prisma.product.create({
      data: {
        name, slug, description, categoryId, brandId,
        isActive, isFeatured,
        shape: shape || null, level: level || null,
        material: material || null, weight: weight || null,
        balance: balance || null, core: core || null,
        variants: {
          create: variants.map((v: any, i: number) => ({
            color: v.color || null,
            gripSize: v.gripSize || null,
            sku: v.sku,
            price: v.price,
            comparePrice: v.comparePrice || null,
            stock: v.stock,
            isActive: true,
          })),
        },
        images: {
          create: images.map((img: any, i: number) => ({
            url: img.url,
            isPrimary: img.isPrimary,
            sortOrder: i,
          })),
        },
      },
      include: { variants: true, images: true },
    });

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error: any) {
    console.error("Create product error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Slug already exists — use a different name" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}