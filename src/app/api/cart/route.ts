import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const sessionId = req.cookies.get("cart_session")?.value;

    if (!user && !sessionId) {
      return NextResponse.json({ data: [] });
    }

    const items = await prisma.cartItem.findMany({
      where: user ? { userId: user.id } : { sessionId },
      include: {
        variant: {
          include: {
            product: {
              include: {
                brand: { select: { name: true } },
                images: {
                  where: { isPrimary: true },
                  select: { url: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ data: items });
  } catch (error) {
    console.error("Cart fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const body = await req.json();
    const { variantId, quantity } = body;

    if (!variantId || !quantity) {
      return NextResponse.json({ error: "Missing variantId or quantity" }, { status: 400 });
    }

    // Check stock
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant || !variant.isActive) {
      return NextResponse.json({ error: "Product not available" }, { status: 404 });
    }

    if (variant.stock < quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
    }

    const sessionId = req.cookies.get("cart_session")?.value ||
      `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const where = user
      ? { userId_variantId: { userId: user.id, variantId } }
      : { sessionId_variantId: { sessionId, variantId } };

    // Upsert cart item
    const existing = await prisma.cartItem.findFirst({
      where: user ? { userId: user.id, variantId } : { sessionId, variantId },
    });

    let cartItem;
    if (existing) {
      cartItem = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: Math.min(existing.quantity + quantity, variant.stock) },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          variantId,
          quantity,
          ...(user ? { userId: user.id } : { sessionId }),
        },
      });
    }

    const res = NextResponse.json({ data: cartItem }, { status: 201 });

    if (!user) {
      res.cookies.set("cart_session", sessionId, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
    }

    return res;
  } catch (error) {
    console.error("Cart add error:", error);
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { variantId } = await req.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const sessionId = req.cookies.get("cart_session")?.value;

    await prisma.cartItem.deleteMany({
      where: {
        variantId,
        ...(user ? { userId: user.id } : { sessionId }),
      },
    });

    return NextResponse.json({ message: "Item removed" });
  } catch (error) {
    console.error("Cart delete error:", error);
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}
