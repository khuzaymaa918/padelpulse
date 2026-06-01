import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      code, description, discountType, discountValue,
      minOrderAmount, maxUses, expiresAt, isActive,
    } = body;

    const promo = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        description: description || null,
        discountType,
        discountValue,
        minOrderAmount: minOrderAmount || null,
        maxUses: maxUses || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive,
      },
    });

    return NextResponse.json({ data: promo }, { status: 201 });
  } catch (error: any) {
    console.error("Create promo error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Promo code already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create promo code" }, { status: 500 });
  }
}
