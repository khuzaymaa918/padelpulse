import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
  return `PP-${year}${month}-${random}`;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const body = await req.json();

    const {
      items, // [{ variantId, quantity }]
      firstName, lastName, email, phone,
      street, city, province, postalCode,
      deliveryMethod, paymentMethod,
      promoCodeId, notes,
    } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    // Fetch variants + validate stock
    const variantIds = items.map((i: any) => i.variantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds }, isActive: true },
      include: {
        product: {
          include: { brand: { select: { name: true } } },
        },
      },
    });

    if (variants.length !== items.length) {
      return NextResponse.json({ error: "One or more products unavailable" }, { status: 400 });
    }

    // Validate stock + build order items
    const orderItems = items.map((item: any) => {
      const variant = variants.find((v) => v.id === item.variantId)!;
      if (variant.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${variant.product.name}`);
      }
      return {
        variantId: variant.id,
        quantity: item.quantity,
        unitPrice: variant.price,
        totalPrice: variant.price * item.quantity,
        productName: variant.product.name,
        productBrand: variant.product.brand.name,
        variantColor: variant.color,
        variantGrip: variant.gripSize,
      };
    });

    // Calculate amounts
    const subtotal = orderItems.reduce((sum: number, i: any) => sum + i.totalPrice, 0);

    // Promo discount
    let discountAmount = 0;
    if (promoCodeId) {
      const promo = await prisma.promoCode.findUnique({ where: { id: promoCodeId } });
      if (promo && promo.isActive) {
        discountAmount = promo.discountType === "PERCENTAGE"
          ? Math.round((subtotal * promo.discountValue) / 100)
          : promo.discountValue;
      }
    }

    const shippingAmount = deliveryMethod === "EXPRESS" ? 350
      : deliveryMethod === "CASH_ON_DELIVERY" ? 200 : 0;

    const taxableAmount = subtotal - discountAmount;
    const taxAmount = Math.round(taxableAmount * 0.17);
    const totalAmount = taxableAmount + shippingAmount + taxAmount;

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: user?.id || null,
          promoCodeId: promoCodeId || null,
          subtotal,
          discountAmount,
          shippingAmount,
          taxAmount,
          totalAmount,
          status: "PENDING",
          paymentStatus: paymentMethod === "CASH_ON_DELIVERY" ? "UNPAID" : "UNPAID",
          paymentMethod,
          deliveryMethod,
          shippingName: `${firstName} ${lastName}`,
          shippingPhone: phone,
          shippingAddress: street,
          shippingCity: city,
          shippingPostal: postalCode || null,
          notes: notes || null,
          items: { create: orderItems },
        },
        include: { items: true },
      });

      // Decrement stock
      await Promise.all(
        items.map((item: any) =>
          tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          })
        )
      );

      // Increment promo usage
      if (promoCodeId) {
        await tx.promoCode.update({
          where: { id: promoCodeId },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Clear DB cart if logged in
      if (user) {
        await tx.cartItem.deleteMany({ where: { userId: user.id } });
      }

      return newOrder;
    });

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ data: orders });
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
