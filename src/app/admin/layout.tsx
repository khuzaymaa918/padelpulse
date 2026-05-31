"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingBag, Tag,
  Users, Settings, ChevronRight, Menu, X
} from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Promo Codes", href: "/admin/promos", icon: Tag },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <aside className={`${collapsed ? "w-16" : "w-56"} flex-shrink-0 bg-[#0d0d0d] border-r border-white/8 flex flex-col transition-all duration-200`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/8">
          {!collapsed && (
            <Link href="/" className="font-display text-[1.1rem] tracking-[0.08em] text-white">
              PADEL<span className="text-white/35">PULSE</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 flex items-center justify-center text-white/35 hover:text-white transition-colors"
          >
            {collapsed ? <Menu size={14} /> : <X size={14} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4">
          {NAV.map((item) => {
            const active = pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-[0.75rem] tracking-[0.1em] uppercase transition-all ${
                  active
                    ? "text-white bg-gray border-r-2 border-white"
                    : "text-white/40 hover:text-white hover:bg-gray/50"
                }`}
              >
                <item.icon size={15} className="flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-4 py-4 border-t border-white/8">
          <Link
            href="/"
            className="flex items-center gap-2 text-[0.68rem] tracking-[0.1em] uppercase text-white/25 hover:text-white transition-colors"
          >
            <ChevronRight size={12} />
            {!collapsed && "View Store"}
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-white/8 bg-[#0a0a0a]">
          <div className="text-[0.65rem] tracking-[0.2em] uppercase text-white/30">
            {NAV.find((n) => pathname === n.href || (n.href !== "/admin" && pathname.startsWith(n.href)))?.label ?? "Admin"}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-[0.68rem] text-white/30">Admin</div>
            <div className="w-7 h-7 bg-gray border border-white/15 flex items-center justify-center text-[0.65rem] font-medium">
              A
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}