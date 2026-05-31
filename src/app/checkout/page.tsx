import { Suspense } from "react";
import CheckoutContent from "./CheckoutContent";

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="font-display text-[2rem] text-white/20 animate-pulse">
          Loading...
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}