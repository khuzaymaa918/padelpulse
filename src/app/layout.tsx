import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Padel Pulse — Pakistan's Padel Destination",
  description:
    "Premium padel rackets, balls and grips. Delivered across Pakistan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${bebasNeue.variable} ${dmSans.variable} bg-[#0a0a0a] text-[#f5f4f0] font-body antialiased`}
      >
        <Navbar />
        <CartDrawer />
        <main>{children}</main>
        <Footer />
        <Toaster theme="dark" position="top-right" />
      </body>
    </html>
  );
}
