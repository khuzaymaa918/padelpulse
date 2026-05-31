import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/8 mt-24">
      <div className="flex flex-col md:flex-row items-start justify-between gap-12 px-10 py-12">
        <div>
          <div className="font-display text-[2rem] tracking-[0.08em] text-white mb-1">
            PADEL<span className="text-white/35">PULSE</span>
          </div>
          <div className="text-[0.72rem] tracking-[0.12em] uppercase text-white/30">
            Pakistan's Padel Destination
          </div>
        </div>

        <div className="flex gap-16">
          {[
            {
              title: "Shop",
              links: [
                { label: "Rackets", href: "/shop?category=rackets" },
                { label: "Balls", href: "/shop?category=balls" },
                { label: "Grips", href: "/shop?category=grips" },
                { label: "All Products", href: "/shop" },
              ],
            },
            {
              title: "Info",
              links: [
                { label: "About Us", href: "/about" },
                { label: "Shipping", href: "/shipping" },
                { label: "Returns", href: "/returns" },
                { label: "Contact", href: "/contact" },
              ],
            },
            {
              title: "Follow",
              links: [
                { label: "Instagram", href: "#" },
                { label: "Facebook", href: "#" },
                { label: "WhatsApp", href: "#" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-[0.65rem] tracking-[0.2em] uppercase text-white/30 mb-4 font-normal">
                {col.title}
              </h4>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[0.82rem] text-white/55 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between px-10 py-5 border-t border-white/6">
        <span className="text-[0.65rem] tracking-[0.1em] uppercase text-white/20">
          © 2026 Padel Pulse. All rights reserved.
        </span>
        <span className="text-[0.65rem] tracking-[0.1em] uppercase text-white/20">
          Lahore, Pakistan
        </span>
      </div>
    </footer>
  );
}
