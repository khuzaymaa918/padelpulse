"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Heart, Minus, Plus, ArrowLeft, ChevronDown } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";
import ProductCard from "@/components/product/ProductCard";

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedGrip, setSelectedGrip] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [openAccordion, setOpenAccordion] = useState<string>("description");

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${slug}`);
        const data = await res.json();
        setProduct(data.data);
        setRelated(data.related || []);
        if (data.data?.variants?.length) {
          setSelectedVariant(data.data.variants[0]);
          setSelectedColor(data.data.variants[0].color || "");
          setSelectedGrip(data.data.variants[0].gripSize || "");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    const match = product.variants.find(
      (v: any) =>
        (v.color === selectedColor || !selectedColor) &&
        (v.gripSize === selectedGrip || !selectedGrip)
    );
    if (match) setSelectedVariant(match);
  }, [selectedColor, selectedGrip, product]);

  const colors = product
    ? [...new Set(product.variants.map((v: any) => v.color).filter(Boolean))] as string[]
    : [];

  const grips = product
    ? [...new Set(product.variants.map((v: any) => v.gripSize).filter(Boolean))] as string[]
    : [];

  const avgRating = product?.reviews?.length
    ? (product.reviews.reduce((s: number, r: any) => s + r.rating, 0) / product.reviews.length).toFixed(1)
    : null;

  const isOnSale = selectedVariant?.comparePrice && selectedVariant.comparePrice > selectedVariant.price;
  const savePct = isOnSale
    ? Math.round((1 - selectedVariant.price / selectedVariant.comparePrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!selectedVariant || !product) return;
    if (selectedVariant.stock < quantity) {
      toast.error("Not enough stock");
      return;
    }
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      name: product.name,
      brand: product.brand.name,
      price: selectedVariant.price,
      comparePrice: selectedVariant.comparePrice ?? undefined,
      image: product.images[0]?.url ?? "",
      color: selectedVariant.color ?? undefined,
      gripSize: selectedVariant.gripSize ?? undefined,
      quantity,
      stock: selectedVariant.stock,
    });
    toast.success(`${product.name} added to cart`);
    openCart();
  };

  if (loading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="font-display text-[2rem] text-white/20 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-24 min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="font-display text-[3rem] text-white/20">Product Not Found</div>
        <Link href="/shop" className="text-[0.75rem] tracking-[0.12em] uppercase text-white/40 border border-white/15 px-6 py-3 hover:text-white hover:border-white/30 transition-all">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 px-10 py-4 border-b border-white/8 text-[0.65rem] tracking-[0.15em] uppercase text-white/30">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.category.slug}`} className="hover:text-white transition-colors capitalize">{product.category.name}</Link>
        <span>/</span>
        <span className="text-white">{product.name}</span>
      </div>

      {/* Product layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-b border-white/8">
        {/* Gallery */}
        <div className="border-r border-white/8">
          <div className="flex">
            {/* Thumbnails */}
            <div className="flex flex-col gap-px bg-white/8 w-[72px] flex-shrink-0">
              {product.images.length > 0 ? (
                product.images.map((img: any, i: number) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={`w-[72px] h-[72px] bg-[#111] flex items-center justify-center transition-all ${
                      activeImage === i ? "shadow-[inset_2px_0_0_#f5f4f0] bg-mid" : "hover:bg-gray"
                    }`}
                  >
                    <Image src={img.url} alt="" width={60} height={60} className="object-cover" />
                  </button>
                ))
              ) : (
                [0, 1, 2].map((i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-[72px] h-[72px] bg-[#111] flex items-center justify-center transition-all ${
                      activeImage === i ? "shadow-[inset_2px_0_0_#f5f4f0] bg-mid" : "hover:bg-gray"
                    }`}
                  >
                    <div className="w-4 h-8 border border-white/20 rounded-sm opacity-40" />
                  </button>
                ))
              )}
            </div>

            {/* Main image */}
            <div className="flex-1 bg-[#0e0e0e] flex items-center justify-center min-h-[520px] relative overflow-hidden group">
              {isOnSale && (
                <div className="absolute top-6 left-6 bg-white text-black text-[0.6rem] tracking-[0.12em] uppercase font-medium px-2 py-1 z-10">
                  −{savePct}%
                </div>
              )}
              <button
                onClick={() => setLiked(!liked)}
                className={`absolute top-6 right-6 w-9 h-9 border flex items-center justify-center z-10 transition-all ${
                  liked ? "border-red text-red" : "border-white/20 text-white/55 bg-black/50"
                }`}
              >
                <Heart size={15} fill={liked ? "currentColor" : "none"} />
              </button>

              {product.images[activeImage]?.url ? (
                <Image
                  src={product.images[activeImage].url}
                  alt={product.name}
                  fill
                  className="object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <svg width="140" height="280" viewBox="0 0 100 200" fill="none" className="opacity-40">
                  <ellipse cx="50" cy="70" rx="38" ry="60" stroke="white" strokeWidth="2.5"/>
                  <line x1="50" y1="12" x2="50" y2="128" stroke="white" strokeWidth="1.2"/>
                  <line x1="13" y1="30" x2="87" y2="30" stroke="white" strokeWidth="1.2"/>
                  <line x1="13" y1="50" x2="87" y2="50" stroke="white" strokeWidth="1.2"/>
                  <line x1="15" y1="70" x2="85" y2="70" stroke="white" strokeWidth="1.2"/>
                  <line x1="13" y1="90" x2="87" y2="90" stroke="white" strokeWidth="1.2"/>
                  <line x1="30" y1="15" x2="30" y2="123" stroke="white" strokeWidth="1.2"/>
                  <line x1="70" y1="15" x2="70" y2="123" stroke="white" strokeWidth="1.2"/>
                  <rect x="43" y="128" width="14" height="58" rx="5" stroke="white" strokeWidth="2.5"/>
                </svg>
              )}
              <div className="absolute bottom-4 right-4 text-[0.6rem] tracking-[0.12em] uppercase text-white/25 border border-white/10 px-2 py-1">
                Hover to zoom
              </div>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-10 flex flex-col overflow-y-auto max-h-[calc(100vh-140px)]">
          <div className="text-[0.65rem] tracking-[0.22em] uppercase text-white/35 mb-2">
            {product.brand.name}
          </div>
          <h1 className="font-display text-[3rem] tracking-[0.04em] leading-none mb-2">
            {product.name}
          </h1>
          <div className="text-[0.78rem] text-white/40 mb-5">
            {[product.shape, product.level].filter(Boolean).join(" · ")}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3 pb-5 mb-5 border-b border-white/8">
            {avgRating && (
              <>
                <span className="text-[0.72rem] tracking-[0.1em]">
                  {"★".repeat(Math.round(Number(avgRating)))}{"☆".repeat(5 - Math.round(Number(avgRating)))}
                </span>
                <span className="text-[0.8rem] font-medium">{avgRating}</span>
                <span className="text-[0.72rem] text-white/35">({product.reviews.length} reviews)</span>
                <div className="w-px h-3.5 bg-white/15" />
              </>
            )}
            <span className={`text-[0.68rem] tracking-[0.1em] uppercase ${selectedVariant?.stock > 0 ? "text-green" : "text-red"}`}>
              ● {selectedVariant?.stock > 0 ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-5">
            <span className="font-display text-[2.6rem] tracking-[0.04em]">
              Rs. {selectedVariant?.price.toLocaleString() ?? "—"}
            </span>
            {isOnSale && (
              <>
                <span className="text-[0.88rem] text-white/35 line-through">
                  Rs. {selectedVariant.comparePrice.toLocaleString()}
                </span>
                <span className="text-[0.68rem] tracking-[0.1em] uppercase text-green bg-green/10 px-2 py-0.5">
                  Save {savePct}%
                </span>
              </>
            )}
          </div>

          {/* Spec pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[product.material, product.weight, product.core, product.balance && `${product.balance} Balance`]
              .filter(Boolean)
              .map((spec) => (
                <span key={spec} className="text-[0.62rem] tracking-[0.08em] uppercase border border-white/15 text-white/35 px-3 py-1.5">
                  {spec}
                </span>
              ))}
          </div>

          {/* Color */}
          {colors.length > 0 && (
            <div className="mb-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[0.62rem] tracking-[0.16em] uppercase text-white/35">Color</span>
                <span className="text-[0.72rem] text-white">{selectedColor}</span>
              </div>
              <div className="flex gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 text-[0.72rem] border transition-all ${
                      selectedColor === color
                        ? "border-white text-white bg-gray"
                        : "border-white/15 text-white/45 hover:border-white/35 hover:text-white"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Grip Size */}
          {grips.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[0.62rem] tracking-[0.16em] uppercase text-white/35">Grip Size</span>
                <span className="text-[0.72rem] text-white">{selectedGrip}</span>
              </div>
              <div className="flex gap-2">
                {grips.map((grip) => (
                  <button
                    key={grip}
                    onClick={() => setSelectedGrip(grip)}
                    className={`px-5 py-2 text-[0.75rem] border transition-all ${
                      selectedGrip === grip
                        ? "border-white text-white bg-gray"
                        : "border-white/15 text-white/45 hover:border-white/35 hover:text-white"
                    }`}
                  >
                    {grip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + CTA */}
          <div className="flex gap-3 mb-5">
            <div className="flex items-center border border-white/18">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-12 flex items-center justify-center text-white/55 hover:bg-gray hover:text-white transition-all"
              >
                <Minus size={14} />
              </button>
              <span className="w-10 text-center text-[0.88rem] font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(selectedVariant?.stock || 1, quantity + 1))}
                className="w-10 h-12 flex items-center justify-center text-white/55 hover:bg-gray hover:text-white transition-all"
              >
                <Plus size={14} />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant || selectedVariant.stock === 0}
              className="flex-1 bg-white text-black text-[0.78rem] font-medium tracking-[0.15em] uppercase h-12 hover:opacity-88 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {selectedVariant?.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
            <button
              onClick={() => setLiked(!liked)}
              className={`w-12 h-12 border flex items-center justify-center transition-all ${
                liked ? "border-red text-red" : "border-white/20 text-white/55 hover:border-white/35"
              }`}
            >
              <Heart size={16} fill={liked ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Delivery strip */}
          <div className="flex border border-white/8 mb-6">
            {[
              { icon: "🚚", text: "Free delivery over Rs. 5,000" },
              { icon: "↩", text: "7-day returns" },
              { icon: "✦", text: "Genuine products" },
            ].map((item) => (
              <div key={item.text} className="flex-1 flex items-center gap-2 px-3 py-3 border-r last:border-r-0 border-white/8 text-[0.68rem] text-white/35">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Accordion */}
          <div className="border-t border-white/8">
            {[
              {
                id: "description",
                title: "Description",
                content: product.description || "No description available.",
              },
              {
                id: "specs",
                title: "Specifications",
                content: null,
                specs: [
                  ["Brand", product.brand.name],
                  ["Shape", product.shape],
                  ["Level", product.level],
                  ["Weight", product.weight],
                  ["Balance", product.balance],
                  ["Frame", product.material],
                  ["Core", product.core],
                ].filter(([, v]) => v),
              },
              {
                id: "shipping",
                title: "Shipping & Returns",
                content:
                  "Free shipping on all orders above Rs. 5,000. Standard delivery within 2–4 business days across Pakistan. Express delivery available at checkout. Returns accepted within 7 days of delivery for unused products in original packaging.",
              },
            ].map((item) => (
              <div key={item.id} className="border-b border-white/8">
                <button
                  onClick={() => setOpenAccordion(openAccordion === item.id ? "" : item.id)}
                  className="w-full flex items-center justify-between py-4 text-[0.75rem] tracking-[0.1em] uppercase text-white hover:text-white/70 transition-colors"
                >
                  {item.title}
                  <ChevronDown
                    size={14}
                    className={`text-white/35 transition-transform duration-200 ${openAccordion === item.id ? "rotate-180" : ""}`}
                  />
                </button>
                {openAccordion === item.id && (
                  <div className="pb-4 text-[0.8rem] text-white/45 leading-[1.75]">
                    {item.content && <p>{item.content}</p>}
                    {item.specs && (
                      <table className="w-full">
                        <tbody>
                          {item.specs.map(([label, value]) => (
                            <tr key={label} className="border-b border-white/6">
                              <td className="py-2 text-[0.68rem] tracking-[0.06em] uppercase text-white/25 w-2/5">{label}</td>
                              <td className="py-2 text-white/55">{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="px-10 py-16">
          <div className="flex items-center gap-3 mb-10">
            <span className="text-[0.65rem] tracking-[0.25em] uppercase text-white/30">You May Also Like</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>
          <div className="grid grid-cols-4 gap-px bg-white/8">
            {related.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Back link */}
      <div className="px-10 pb-8">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-[0.72rem] tracking-[0.12em] uppercase text-white/35 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Back to Shop
        </Link>
      </div>
    </div>
  );
}