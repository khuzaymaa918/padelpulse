import { Suspense } from "react";
import ShopPageContent from "./ShopPageContent";

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="font-display text-[2rem] text-white/20 animate-pulse">
          Loading...
        </div>
      </div>
    }>
      <ShopPageContent />
    </Suspense>
  );
}