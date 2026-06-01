import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-sfpy-signature");

    // Verify webhook signature
    const expectedSig = crypto
      .createHmac("sha256", process.env.SAFEPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (signature !== expectedSig) {
      console.error("Invalid Safepay webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);
    const { type, data } = event;

    switch (type) {
      case "payment:created": {
        // Payment initiated — update order with tracker ID
        const { tracker, order_id } = data;
        await prisma.order.update({
          where: { orderNumber: order_id },
          data: { safepayTrackerId: tracker },
        });
        break;
      }

      case "payment:success": {
        const { tracker, order_id } = data;
        await prisma.order.update({
          where: { orderNumber: order_id },
          data: {
            paymentStatus: "PAID",
            status: "CONFIRMED",
            safepayTrackerId: tracker,
          },
        });
        break;
      }

      case "payment:failed": {
        const { order_id } = data;
        await prisma.order.update({
          where: { orderNumber: order_id },
          data: {
            paymentStatus: "FAILED",
            status: "CANCELLED",
          },
        });
        break;
      }

      case "payment:refunded": {
        const { order_id } = data;
        await prisma.order.update({
          where: { orderNumber: order_id },
          data: {
            paymentStatus: "REFUNDED",
            status: "REFUNDED",
          },
        });
        break;
      }

      default:
        console.log("Unhandled Safepay event:", type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Safepay webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
