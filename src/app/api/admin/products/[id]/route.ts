import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      name, slug, description, categoryId, brandId,
      isActive, isFeatured, shape, level, material,
      weight, balance, core, variants, images,
    } = body;

    // Update product fields
    await prisma.product.update({
      where: { id },
      data: {
        name, slug, description, categoryId, brandId,
        isActive, isFeatured,
        shape: shape || null, level: level || null,
        material: material || null, weight: weight || null,
        balance: balance || null, core: core || null,
      },
    });

    // Update variants — upsert each
    await Promise.all(
      variants.map((v: any) =>
        v.id
          ? prisma.productVariant.update({
              where: { id: v.id },
              data: {
                color: v.color || null,
                gripSize: v.gripSize || null,
                sku: v.sku,
                price: v.price,
                comparePrice: v.comparePrice || null,
                stock: v.stock,
              },
            })
          : prisma.productVariant.create({
              data: {
                productId: id,
                color: v.color || null,
                gripSize: v.gripSize || null,
                sku: v.sku,
                price: v.price,
                comparePrice: v.comparePrice || null,
                stock: v.stock,
                isActive: true,
              },
            })
      )
    );

    // Replace images
    await prisma.productImage.deleteMany({ where: { productId: id } });
    if (images.length > 0) {
      await prisma.productImage.createMany({
        data: images.map((img: any, i: number) => ({
          productId: id,
          url: img.url,
          isPrimary: img.isPrimary,
          sortOrder: i,
        })),
      });
    }

    const updated = await prisma.product.findUnique({
      where: { id },
      include: { variants: true, images: true },
    });

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
