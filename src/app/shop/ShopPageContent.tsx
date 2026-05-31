"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/product/ProductCard";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";

const CATEGORIES = ["rackets", "balls", "grips"];
const BRANDS = ["bullpadel", "head", "wilson", "nox", "adidas", "babolat"];
const LEVELS = ["Beginner", "Intermediate", "Advanced", "Pro"];
const SHAPES = ["Diamond", "Round", "Teardrop"];
const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "rating", label: "Best Rated" },
];

export default function ShopPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    brand: searchParams.getAll("brand") || [],
    level: searchParams.getAll("level") || [],
    shape: searchParams.getAll("shape") || [],
    sort: searchParams.get("sort") || "featured",
    page: Number(searchParams.get("page")) || 1,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.set("category", filters.category);
      filters.brand.forEach((b) => params.append("brand", b));
      filters.level.forEach((l) => params.append("level", l));
      filters.shape.forEach((s) => params.append("shape", s));
      params.set("sort", filters.sort);
      params.set("page", filters.page.toString());
      params.set("pageSize", "9");

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const toggleFilter = (type: "brand" | "level" | "shape", value: string) => {
    setFilters((f) => ({
      ...f,
      page: 1,
      [type]: f[type].includes(value)
        ? (f[type] as string[]).filter((v) => v !== value)
        : [...(f[type] as string[]), value],
    }));
  };

  const setCategory = (cat: string) => {
    setFilters((f) => ({ ...f, category: f.category === cat ? "" : cat, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ category: "", brand: [], level: [], shape: [], sort: "featured", page: 1 });
  };

  const activeFilterCount =
    (filters.category ? 1 : 0) +
    filters.brand.length +
    filters.level.length +
    filters.shape.length;

  const FilterSidebar = () => (
    <aside className="w-60 flex-shrink-0">
      {/* Category */}
      <div className="mb-8">
        <div className="text-[0.62rem] tracking-[0.22em] uppercase text-white/30 mb-3 pb-2 border-b border-white/8">
          Category
        </div>
        <div className="flex flex-col gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex items-center justify-between px-3 py-2 text-[0.78rem] border transition-all ${
                filters.category === cat
                  ? "border-white/20 bg-gray text-white"
                  : "border-transparent text-white/45 hover:text-white hover:bg-gray"
              }`}
            >
              <span className="capitalize">{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brand */}
      <div className="mb-8">
        <div className="text-[0.62rem] tracking-[0.22em] uppercase text-white/30 mb-3 pb-2 border-b border-white/8">
          Brand
        </div>
        <div className="flex flex-col gap-1">
          {BRANDS.map((brand) => (
            <button
              key={brand}
              onClick={() => toggleFilter("brand", brand)}
              className={`flex items-center justify-between px-3 py-2 text-[0.78rem] border transition-all ${
                filters.brand.includes(brand)
                  ? "border-white/20 bg-gray text-white"
                  : "border-transparent text-white/45 hover:text-white hover:bg-gray"
              }`}
            >
              <span className="capitalize">{brand}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Level */}
      <div className="mb-8">
        <div className="text-[0.62rem] tracking-[0.22em] uppercase text-white/30 mb-3 pb-2 border-b border-white/8">
          Level
        </div>
        <div className="flex flex-col gap-1">
          {LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => toggleFilter("level", level)}
              className={`flex items-center justify-between px-3 py-2 text-[0.78rem] border transition-all ${
                filters.level.includes(level)
                  ? "border-white/20 bg-gray text-white"
                  : "border-transparent text-white/45 hover:text-white hover:bg-gray"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Shape */}
      <div className="mb-8">
        <div className="text-[0.62rem] tracking-[0.22em] uppercase text-white/30 mb-3 pb-2 border-b border-white/8">
          Shape
        </div>
        <div className="flex flex-col gap-1">
          {SHAPES.map((shape) => (
            <button
              key={shape}
              onClick={() => toggleFilter("shape", shape)}
              className={`flex items-center justify-between px-3 py-2 text-[0.78rem] border transition-all ${
                filters.shape.includes(shape)
                  ? "border-white/20 bg-gray text-white"
                  : "border-transparent text-white/45 hover:text-white hover:bg-gray"
              }`}
            >
              {shape}
            </button>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="w-full py-2 border border-white/15 text-white/35 text-[0.68rem] tracking-[0.12em] uppercase hover:text-white hover:border-white/30 transition-all"
        >
          Clear All Filters
        </button>
      )}
    </aside>
  );

  return (
    <div className="pt-24 min-h-screen">
      {/* Page Header */}
      <div className="flex items-end justify-between px-10 py-8 border-b border-white/8">
        <div>
          <div className="text-[0.62rem] tracking-[0.15em] uppercase text-white/30 mb-1">
            Shop /
          </div>
          <h1 className="font-display text-[3.5rem] tracking-[0.04em] leading-none">
            All Products{" "}
            <span className="text-white/30 text-[1.5rem]">({total})</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex md:hidden items-center gap-2 border border-white/15 text-white/45 text-[0.72rem] tracking-[0.1em] uppercase px-4 py-2 hover:text-white hover:border-white/30 transition-all"
          >
            <SlidersHorizontal size={14} />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>

          {/* Sort */}
          <div className="flex items-center gap-3">
            <span className="text-[0.65rem] tracking-[0.12em] uppercase text-white/30">
              Sort by
            </span>
            <div className="relative">
              <select
                value={filters.sort}
                onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value, page: 1 }))}
                className="bg-gray border border-white/8 text-white text-[0.75rem] py-2 pl-3 pr-8 appearance-none cursor-pointer outline-none"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Active filter tags */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 px-10 py-3 border-b border-white/8 flex-wrap">
          {filters.category && (
            <button
              onClick={() => setFilters((f) => ({ ...f, category: "", page: 1 }))}
              className="flex items-center gap-1.5 bg-gray border border-white/15 text-[0.68rem] tracking-[0.08em] uppercase text-white px-3 py-1.5 hover:bg-mid transition-all"
            >
              {filters.category} <X size={10} />
            </button>
          )}
          {filters.brand.map((b) => (
            <button
              key={b}
              onClick={() => toggleFilter("brand", b)}
              className="flex items-center gap-1.5 bg-gray border border-white/15 text-[0.68rem] tracking-[0.08em] uppercase text-white px-3 py-1.5 hover:bg-mid transition-all"
            >
              {b} <X size={10} />
            </button>
          ))}
          {filters.level.map((l) => (
            <button
              key={l}
              onClick={() => toggleFilter("level", l)}
              className="flex items-center gap-1.5 bg-gray border border-white/15 text-[0.68rem] tracking-[0.08em] uppercase text-white px-3 py-1.5 hover:bg-mid transition-all"
            >
              {l} <X size={10} />
            </button>
          ))}
          {filters.shape.map((s) => (
            <button
              key={s}
              onClick={() => toggleFilter("shape", s)}
              className="flex items-center gap-1.5 bg-gray border border-white/15 text-[0.68rem] tracking-[0.08em] uppercase text-white px-3 py-1.5 hover:bg-mid transition-all"
            >
              {s} <X size={10} />
            </button>
          ))}
          <button
            onClick={clearFilters}
            className="text-[0.65rem] tracking-[0.1em] uppercase text-white/30 hover:text-white ml-2 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="flex px-10 py-8 gap-10">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <FilterSidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 md:hidden" onClick={() => setSidebarOpen(false)}>
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#0d0d0d] p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <span className="text-[0.65rem] tracking-[0.2em] uppercase text-white/40">Filters</span>
                <button onClick={() => setSidebarOpen(false)}><X size={16} className="text-white/40" /></button>
              </div>
              <FilterSidebar />
            </div>
          </div>
        )}

        {/* Products */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-3 gap-px bg-white/8">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-gray animate-pulse aspect-[3/4]" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="font-display text-[3rem] text-white/15">No Products Found</div>
              <div className="text-[0.78rem] text-white/30">Try adjusting your filters</div>
              <button onClick={clearFilters} className="mt-4 border border-white/20 text-white/45 text-[0.72rem] tracking-[0.12em] uppercase px-6 py-3 hover:text-white hover:border-white/40 transition-all">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    disabled={filters.page === 1}
                    onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                    className="w-9 h-9 border border-white/15 text-white/40 flex items-center justify-center hover:text-white hover:border-white/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                  >
                    ←
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setFilters((f) => ({ ...f, page: i + 1 }))}
                      className={`w-9 h-9 border text-[0.8rem] flex items-center justify-center transition-all ${
                        filters.page === i + 1
                          ? "bg-white text-black border-white"
                          : "border-white/15 text-white/40 hover:text-white hover:border-white/30"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={filters.page === totalPages}
                    onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                    className="w-9 h-9 border border-white/15 text-white/40 flex items-center justify-center hover:text-white hover:border-white/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}