"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Supabase puts the session in the URL hash after redirect
    const supabase = createClient();
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setValidSession(true);
      }
      setChecking(false);
    });
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated successfully!");
      router.push("/auth/login");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-display text-[1.5rem] text-white/20 animate-pulse">Verifying...</div>
      </div>
    );
  }

  if (!validSession) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <Link href="/" className="block font-display text-[2rem] tracking-[0.1em] text-white mb-10">
            PADEL<span className="text-white/35">PULSE</span>
          </Link>
          <div className="bg-[#0d0d0d] border border-white/8 p-8">
            <div className="text-[2rem] mb-4">⚠️</div>
            <div className="text-[0.82rem] text-white/55 leading-[1.7] mb-6">
              This reset link is invalid or has expired. Please request a new one.
            </div>
            <Link
              href="/auth/forgot-password"
              className="block w-full bg-white text-black text-[0.75rem] font-medium tracking-[0.15em] uppercase py-3 hover:opacity-88 transition-opacity"
            >
              Request New Link
            </Link>
            <Link
              href="/auth/login"
              className="block mt-3 text-[0.68rem] tracking-[0.1em] uppercase text-white/25 hover:text-white transition-colors"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
        <rect x="80" y="60" width="640" height="480" fill="none" stroke="white" strokeWidth="1.5"/>
        <line x1="80" y1="300" x2="720" y2="300" stroke="white" strokeWidth="2"/>
        <line x1="400" y1="60" x2="400" y2="540" stroke="white" strokeWidth="1"/>
      </svg>

      <div className="w-full max-w-sm relative z-10">
        <Link href="/" className="block text-center font-display text-[2rem] tracking-[0.1em] text-white mb-10">
          PADEL<span className="text-white/35">PULSE</span>
        </Link>

        <div className="bg-[#0d0d0d] border border-white/8 p-8">
          <div className="text-[0.62rem] tracking-[0.25em] uppercase text-white/30 mb-2 text-center">
            Set New Password
          </div>
          <p className="text-[0.72rem] text-white/35 text-center mb-6">
            Choose a strong password for your account.
          </p>

          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <div>
              <label className="block text-[0.62rem] tracking-[0.16em] uppercase text-white/35 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-transparent border border-white/15 text-white text-[0.82rem] px-4 py-3 outline-none focus:border-white/35 placeholder:text-white/20"
              />
            </div>
            <div>
              <label className="block text-[0.62rem] tracking-[0.16em] uppercase text-white/35 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-transparent border border-white/15 text-white text-[0.82rem] px-4 py-3 outline-none focus:border-white/35 placeholder:text-white/20"
              />
            </div>

            {/* Password strength indicator */}
            {password.length > 0 && (
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-0.5 flex-1 transition-colors ${
                      password.length >= level * 3
                        ? password.length >= 12 ? "bg-green"
                          : password.length >= 8 ? "bg-yellow-400"
                          : "bg-red"
                        : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black text-[0.78rem] font-medium tracking-[0.15em] uppercase py-4 mt-2 hover:opacity-88 transition-opacity disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
