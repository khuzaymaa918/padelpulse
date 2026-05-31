import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo || !promo.isActive) {
      return NextResponse.json({ error: "Invalid promo code" }, { status: 404 });
    }

    if (promo.expiresAt && new Date() > promo.expiresAt) {
      return NextResponse.json({ error: "Promo code has expired" }, { status: 400 });
    }

    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ error: "Promo code has reached its limit" }, { status: 400 });
    }

    if (promo.minOrderAmount && subtotal < promo.minOrderAmount) {
      return NextResponse.json({
        error: `Minimum order of Rs. ${promo.minOrderAmount.toLocaleString()} required`,
      }, { status: 400 });
    }

    const discount =
      promo.discountType === "PERCENTAGE"
        ? Math.round((subtotal * promo.discountValue) / 100)
        : promo.discountValue;

    return NextResponse.json({
      data: {
        id: promo.id,
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        discount,
        description: promo.description,
      },
    });
  } catch (error) {
    console.error("Promo validation error:", error);
    return NextResponse.json({ error: "Failed to validate promo code" }, { status: 500 });
  }
}
