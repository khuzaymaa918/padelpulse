"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Reset link sent!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center font-display text-[2rem] tracking-[0.1em] text-white mb-10">
          PADEL<span className="text-white/35">PULSE</span>
        </Link>
        <div className="bg-[#0d0d0d] border border-white/8 p-8">
          <div className="text-[0.62rem] tracking-[0.25em] uppercase text-white/30 mb-6 text-center">
            Reset Password
          </div>
          {sent ? (
            <div className="text-center py-4">
              <div className="text-[2.5rem] mb-4">📬</div>
              <div className="text-[0.82rem] text-white/55 leading-[1.7] mb-6">
                Check your email for a password reset link.
              </div>
              <Link href="/auth/login" className="text-[0.72rem] tracking-[0.1em] uppercase text-white/35 hover:text-white transition-colors">
                ← Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <p className="text-[0.75rem] text-white/40 leading-[1.65]">
                Enter your email and we'll send you a reset link.
              </p>
              <div>
                <label className="block text-[0.62rem] tracking-[0.16em] uppercase text-white/35 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-transparent border border-white/15 text-white text-[0.82rem] px-4 py-3 outline-none focus:border-white/35 placeholder:text-white/20"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black text-[0.78rem] font-medium tracking-[0.15em] uppercase py-4 hover:opacity-88 transition-opacity disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
              <Link href="/auth/login" className="text-center text-[0.68rem] tracking-[0.1em] uppercase text-white/25 hover:text-white transition-colors">
                ← Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
