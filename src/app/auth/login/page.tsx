"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back!");
      router.push("/account");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
        <rect x="80" y="60" width="640" height="480" fill="none" stroke="white" strokeWidth="1.5"/>
        <line x1="80" y1="300" x2="720" y2="300" stroke="white" strokeWidth="2"/>
        <line x1="400" y1="60" x2="400" y2="540" stroke="white" strokeWidth="1"/>
        <line x1="80" y1="180" x2="720" y2="180" stroke="white" strokeWidth=".8"/>
        <line x1="80" y1="420" x2="720" y2="420" stroke="white" strokeWidth=".8"/>
      </svg>

      <div className="w-full max-w-sm relative z-10">
        <Link href="/" className="block text-center font-display text-[2rem] tracking-[0.1em] text-white mb-10">
          PADEL<span className="text-white/35">PULSE</span>
        </Link>

        <div className="bg-[#0d0d0d] border border-white/8 p-8">
          <div className="text-[0.62rem] tracking-[0.25em] uppercase text-white/30 mb-6 text-center">
            Sign In
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-[0.62rem] tracking-[0.16em] uppercase text-white/35 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-transparent border border-white/15 text-white text-[0.82rem] px-4 py-3 outline-none focus:border-white/35 placeholder:text-white/20"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[0.62rem] tracking-[0.16em] uppercase text-white/35">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-[0.62rem] tracking-[0.1em] uppercase text-white/25 hover:text-white transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-transparent border border-white/15 text-white text-[0.82rem] px-4 py-3 outline-none focus:border-white/35 placeholder:text-white/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black text-[0.78rem] font-medium tracking-[0.15em] uppercase py-4 mt-2 hover:opacity-88 transition-opacity disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-[0.6rem] tracking-[0.15em] uppercase text-white/20">or</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border border-white/15 text-white/55 text-[0.75rem] tracking-[0.1em] uppercase py-3 hover:text-white hover:border-white/30 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="mt-6 pt-5 border-t border-white/8 text-center">
            <span className="text-[0.72rem] text-white/30">Don't have an account? </span>
            <Link href="/auth/signup" className="text-[0.72rem] text-white hover:text-white/70 transition-colors">
              Sign up →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
