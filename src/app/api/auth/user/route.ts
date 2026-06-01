import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { id, email, name, phone } = await req.json();

    if (!id || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { id },
      update: {
        email,
        ...(name && { name }),
        ...(phone && { phone }),
      },
      create: {
        id,
        email,
        name: name || null,
        phone: phone || null,
      },
    });

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("User upsert error:", error);
    return NextResponse.json({ error: "Failed to upsert user" }, { status: 500 });
  }
}
