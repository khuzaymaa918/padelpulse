import Link from "next/link";
import { prisma } from "@/lib/prisma/client";
import ProductCard from "@/components/product/ProductCard";

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isFeatured: true, isActive: true },
    take: 3,
    include: {
      category: { select: { id: true, name: true, slug: true } },
      brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
      variants: { where: { isActive: true }, take: 1 },
      images: { where: { isPrimary: true }, take: 1 },
      reviews: { select: { rating: true } },
    },
  });
}

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <>
      {/* HERO */}
      <section className="min-h-screen relative flex flex-col justify-end px-10 pb-16 overflow-hidden">
        {/* Court SVG background */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1200 900" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
            <rect x="100" y="100" width="1000" height="700" fill="none" stroke="white" strokeWidth="2"/>
            <line x1="100" y1="450" x2="1100" y2="450" stroke="white" strokeWidth="3"/>
            <line x1="600" y1="100" x2="600" y2="800" stroke="white" strokeWidth="1.5"/>
            <line x1="100" y1="300" x2="1100" y2="300" stroke="white" strokeWidth="1"/>
            <line x1="100" y1="600" x2="1100" y2="600" stroke="white" strokeWidth="1"/>
            <path d="M 100 550 Q 200 550 200 450" fill="none" stroke="white" strokeWidth="1"/>
            <path d="M 1100 550 Q 1000 550 1000 450" fill="none" stroke="white" strokeWidth="1"/>
            <path d="M 100 350 Q 200 350 200 450" fill="none" stroke="white" strokeWidth="1"/>
            <path d="M 1100 350 Q 1000 350 1000 450" fill="none" stroke="white" strokeWidth="1"/>
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-white/30" />
            <span className="text-[0.65rem] tracking-[0.25em] uppercase text-white/40">
              Premium Padel Equipment
            </span>
          </div>
          <h1 className="font-display text-[clamp(5rem,13vw,10rem)] leading-[0.92] tracking-[0.02em] text-white mb-10">
            Own The<br />
            <span className="text-white/18">Court</span>
          </h1>
        </div>

        <div className="relative z-10 flex items-end justify-between">
          <p className="max-w-xs text-[0.88rem] leading-[1.7] text-white/50">
            Curated padel equipment for players who demand precision. Rackets, balls, and grips — all in one place.
          </p>
          <div className="flex gap-3">
            <Link
              href="/shop"
              className="bg-white text-black text-[0.78rem] font-medium tracking-[0.12em] uppercase px-9 py-4 hover:opacity-88 transition-opacity"
            >
              Shop Now
            </Link>
            <button className="border border-white/20 text-white/55 text-[0.78rem] tracking-[0.12em] uppercase px-7 py-4 hover:text-white hover:border-white/50 transition-all">
              Lookbook
            </button>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="bg-white overflow-hidden py-3">
        <div className="flex gap-12 whitespace-nowrap animate-[ticker_18s_linear_infinite]" style={{width: "200%"}}>
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-12 items-center">
              {["Padel Pulse", "Premium Rackets", "Tournament Balls", "Pro Grips", "Free Shipping Over Rs. 5,000"].map((t) => (
                <span key={t} className="text-black text-[0.65rem] tracking-[0.2em] uppercase font-medium">{t} <span className="text-black/40 mx-2">·</span></span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="px-10 py-24">
        <div className="flex items-center gap-3 mb-12">
          <span className="text-[0.65rem] tracking-[0.25em] uppercase text-white/30">Shop by Category</span>
          <div className="flex-1 h-px bg-white/8" />
        </div>
        <div className="grid grid-cols-3 gap-px bg-white/8">
          {[
            { name: "Rackets", sub: "Diamond · Round · Teardrop", num: "01", href: "/shop?category=rackets" },
            { name: "Balls", sub: "Match · Training", num: "02", href: "/shop?category=balls" },
            { name: "Grips", sub: "Overgrip · Replacement", num: "03", href: "/shop?category=grips" },
          ].map((cat) => (
            <Link key={cat.name} href={cat.href}>
              <div className="bg-black hover:bg-gray transition-colors min-h-[360px] flex flex-col justify-end p-10 relative cursor-pointer group">
                <div className="absolute top-8 right-8 text-[0.75rem] tracking-[0.2em] uppercase text-white/25">{cat.num}</div>
                <div className="font-display text-[2.8rem] tracking-[0.04em] text-white mb-1">{cat.name}</div>
                <div className="text-[0.75rem] text-white/40">{cat.sub}</div>
                <div className="absolute bottom-8 right-8 w-9 h-9 border border-white/20 flex items-center justify-center text-white/50 group-hover:bg-white group-hover:text-black transition-all">→</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="px-10 pb-24">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <span className="text-[0.65rem] tracking-[0.25em] uppercase text-white/30">Featured Products</span>
            <div className="w-24 h-px bg-white/8" />
          </div>
          <Link href="/shop" className="text-[0.68rem] tracking-[0.12em] uppercase text-white/35 hover:text-white transition-colors">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-px bg-white/8">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </section>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-px bg-white/8 border-y border-white/8">
        {[
          { num: "500+", label: "Products" },
          { num: "20+", label: "Top Brands" },
          { num: "48hr", label: "Delivery" },
          { num: "5★", label: "Rated" },
        ].map((s) => (
          <div key={s.label} className="bg-black px-10 py-8 text-center">
            <span className="font-display text-[3.2rem] tracking-[0.04em] text-white block mb-1">{s.num}</span>
            <span className="text-[0.65rem] tracking-[0.18em] uppercase text-white/30">{s.label}</span>
          </div>
        ))}
      </div>

      {/* BANNER */}
      <div className="mx-10 my-24 bg-white text-black p-16 flex items-center justify-between gap-8">
        <div>
          <div className="font-display text-[clamp(2.5rem,5vw,4rem)] tracking-[0.04em] leading-none mb-4">
            Built for<br /><span className="text-black/25">Players.</span><br />Not Spectators.
          </div>
          <p className="text-[0.82rem] text-black/50 max-w-xs leading-[1.7]">
            Whether you're a beginner picking up your first racket or a seasoned player chasing titles — Padel Pulse has your gear.
          </p>
        </div>
        <Link
          href="/shop"
          className="flex-shrink-0 bg-black text-white text-[0.78rem] font-medium tracking-[0.12em] uppercase px-8 py-4 hover:opacity-82 transition-opacity"
        >
          Explore All Products →
        </Link>
      </div>
    </>
  );
}
