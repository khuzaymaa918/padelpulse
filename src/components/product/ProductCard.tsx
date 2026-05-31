"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Heart, Plus } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";
import { ProductWithRelations } from "@/types";

interface Props {
  product: ProductWithRelations;
}

export default function ProductCard({ product }: Props) {
  const [liked, setLiked] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const primaryVariant = product.variants[0];
  const primaryImage = product.images[0];
  const avgRating = product.reviews?.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : null;

  const isOnSale = primaryVariant?.comparePrice && primaryVariant.comparePrice > primaryVariant.price;

  const badge = isOnSale
    ? { label: `−${Math.round((1 - primaryVariant.price / primaryVariant.comparePrice!) * 100)}%`, style: "bg-red text-white" }
    : product.isFeatured
    ? { label: "Best Seller", style: "bg-white text-black" }
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!primaryVariant) return;
    addItem({
      variantId: primaryVariant.id,
      productId: product.id,
      name: product.name,
      brand: product.brand.name,
      price: primaryVariant.price,
      comparePrice: primaryVariant.comparePrice ?? undefined,
      image: primaryImage?.url ?? "",
      color: primaryVariant.color ?? undefined,
      gripSize: primaryVariant.gripSize ?? undefined,
      quantity: 1,
      stock: primaryVariant.stock,
    });
    toast.success(`${product.name} added to cart`);
    openCart();
  };

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="group bg-black hover:bg-gray transition-colors duration-200 cursor-pointer">
        {/* Image */}
        <div className="aspect-square bg-[#111] relative overflow-hidden flex items-center justify-center">
          {badge && (
            <span className={`absolute top-2.5 left-2.5 text-[0.6rem] tracking-[0.15em] uppercase font-medium px-2 py-1 z-10 ${badge.style}`}>
              {badge.label}
            </span>
          )}
          <button
            onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
            className={`absolute top-2.5 right-2.5 w-7 h-7 border flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-all ${
              liked ? "border-red text-red" : "border-white/20 text-white/55 bg-black/70"
            }`}
          >
            <Heart size={12} fill={liked ? "currentColor" : "none"} />
          </button>

          {primaryImage?.url ? (
            <Image
              src={primaryImage.url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            // Placeholder SVG
            <svg width="60" height="120" viewBox="0 0 100 200" fill="none" className="opacity-20">
              <ellipse cx="50" cy="70" rx="38" ry="60" stroke="white" strokeWidth="3"/>
              <line x1="50" y1="12" x2="50" y2="128" stroke="white" strokeWidth="1.5"/>
              <line x1="13" y1="50" x2="87" y2="50" stroke="white" strokeWidth="1.5"/>
              <line x1="15" y1="70" x2="85" y2="70" stroke="white" strokeWidth="1.5"/>
              <line x1="13" y1="90" x2="87" y2="90" stroke="white" strokeWidth="1.5"/>
              <line x1="30" y1="15" x2="30" y2="123" stroke="white" strokeWidth="1.5"/>
              <line x1="70" y1="15" x2="70" y2="123" stroke="white" strokeWidth="1.5"/>
              <rect x="43" y="128" width="14" height="58" rx="4" stroke="white" strokeWidth="2.5"/>
            </svg>
          )}
        </div>

        {/* Info */}
        <div className="p-5">
          <div className="text-[0.62rem] tracking-[0.18em] uppercase text-white/35 mb-1">
            {product.brand.name}
          </div>
          <div className="text-[0.9rem] font-medium text-white mb-1 leading-snug">
            {product.name}
          </div>
          {product.shape || product.level ? (
            <div className="text-[0.68rem] text-white/25 tracking-[0.06em] mb-3">
              {[product.shape, product.level, product.material].filter(Boolean).join(" · ")}
            </div>
          ) : null}
          {avgRating && (
            <div className="text-[0.62rem] text-white/40 tracking-[0.1em] mb-3">
              {"★".repeat(Math.round(avgRating))}{"☆".repeat(5 - Math.round(avgRating))}{" "}
              <span className="text-white/25">({product.reviews?.length})</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[1.25rem] tracking-[0.04em]">
                Rs. {primaryVariant?.price.toLocaleString() ?? "—"}
              </span>
              {isOnSale && (
                <span className="text-[0.72rem] text-white/35 line-through">
                  Rs. {primaryVariant.comparePrice!.toLocaleString()}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              className="w-8 h-8 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
