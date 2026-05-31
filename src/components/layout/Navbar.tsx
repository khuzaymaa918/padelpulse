"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { ShoppingBag, Search, Heart, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const items = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-5 transition-all duration-300 ${
          scrolled
            ? "bg-black/95 backdrop-blur-md border-b border-white/8"
            : "bg-black/80 backdrop-blur-sm"
        }`}
      >
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-[1.5rem] tracking-[0.08em] text-white"
        >
          PADEL<span className="text-white/35">PULSE</span>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex gap-10 list-none">
          {[
            { label: "Shop", href: "/shop" },
            { label: "Rackets", href: "/shop?category=rackets" },
            { label: "Balls", href: "/shop?category=balls" },
            { label: "Grips", href: "/shop?category=grips" },
          ].map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-white/55 text-[0.75rem] tracking-[0.12em] uppercase hover:text-white transition-colors duration-200"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right Icons */}
        <div className="flex items-center gap-3">
          <button className="hidden md:flex w-9 h-9 border border-white/8 items-center justify-center text-white/55 hover:text-white hover:border-white/30 transition-all">
            <Search size={15} />
          </button>
          <button className="hidden md:flex w-9 h-9 border border-white/8 items-center justify-center text-white/55 hover:text-white hover:border-white/30 transition-all">
            <Heart size={15} />
          </button>
          <button
            onClick={openCart}
            className="flex items-center gap-2 bg-gray border border-white/20 text-white text-[0.75rem] tracking-[0.1em] uppercase px-4 h-9 hover:bg-mid transition-all"
          >
            <ShoppingBag size={14} />
            <span>Cart ({mounted ? totalItems : 0})</span>
          </button>
          <button
            className="md:hidden text-white/55 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black pt-20 px-6 flex flex-col gap-6 md:hidden">
          {[
            { label: "Shop All", href: "/shop" },
            { label: "Rackets", href: "/shop?category=rackets" },
            { label: "Balls", href: "/shop?category=balls" },
            { label: "Grips", href: "/shop?category=grips" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="font-display text-[2.5rem] tracking-[0.06em] text-white border-b border-white/8 pb-4"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
