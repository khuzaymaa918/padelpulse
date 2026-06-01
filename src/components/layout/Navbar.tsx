"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { ShoppingBag, Search, Menu, X, User } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const items = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    setMounted(true);

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);

    // Get current auth state
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      window.removeEventListener("scroll", onScroll);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-5 transition-all duration-300 ${
        scrolled
          ? "bg-black/95 backdrop-blur-md border-b border-white/8"
          : "bg-black/80 backdrop-blur-sm"
      }`}>

        {/* Logo */}
        <Link href="/" className="font-display text-[1.5rem] tracking-[0.08em] text-white">
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

        {/* Right side */}
        <div className="flex items-center gap-3">

          {/* Search */}
          <button className="hidden md:flex w-9 h-9 border border-white/8 items-center justify-center text-white/55 hover:text-white hover:border-white/30 transition-all">
            <Search size={15} />
          </button>

          {/* Account / Login */}
          {mounted && (
            user ? (
              <Link
                href="/account"
                className="hidden md:flex items-center gap-2 border border-white/8 text-white/55 text-[0.72rem] tracking-[0.1em] uppercase px-3 h-9 hover:text-white hover:border-white/30 transition-all"
              >
                <User size={14} />
                <span>{user.user_metadata?.name?.split(" ")[0] || "Account"}</span>
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="hidden md:flex items-center gap-2 border border-white/8 text-white/55 text-[0.72rem] tracking-[0.1em] uppercase px-3 h-9 hover:text-white hover:border-white/30 transition-all"
              >
                <User size={14} />
                <span>Login</span>
              </Link>
            )
          )}

          {/* Cart */}
          <button
            onClick={openCart}
            className="flex items-center gap-2 bg-gray border border-white/20 text-white text-[0.75rem] tracking-[0.1em] uppercase px-4 h-9 hover:bg-mid transition-all"
          >
            <ShoppingBag size={14} />
            <span>Cart ({mounted ? totalItems : 0})</span>
          </button>

          {/* Mobile menu */}
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
        <div className="fixed inset-0 z-40 bg-black pt-20 px-6 flex flex-col gap-0 md:hidden overflow-y-auto">
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
              className="font-display text-[2.5rem] tracking-[0.06em] text-white border-b border-white/8 py-4"
            >
              {link.label}
            </Link>
          ))}

          <div className="mt-6 flex flex-col gap-3">
            {user ? (
              <Link
                href="/account"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 text-[0.78rem] tracking-[0.12em] uppercase text-white/55 hover:text-white transition-colors"
              >
                <User size={15} />
                My Account
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center bg-white text-black text-[0.75rem] font-medium tracking-[0.15em] uppercase py-3"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center border border-white/20 text-white/55 text-[0.75rem] tracking-[0.15em] uppercase py-3 hover:text-white hover:border-white/40 transition-all"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
