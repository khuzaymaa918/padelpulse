"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirm: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { name: form.name, phone: form.phone },
        },
      });
      if (error) throw error;

      await fetch("/api/auth/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: data.user?.id,
          email: form.email,
          name: form.name,
          phone: form.phone,
        }),
      });

      toast.success("Account created! Check your email to verify.");
      router.push("/auth/login");
    } catch (err: any) {
      toast.error(err.message || "Signup failed");
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
      </svg>

      <div className="w-full max-w-sm relative z-10">
        <Link href="/" className="block text-center font-display text-[2rem] tracking-[0.1em] text-white mb-10">
          PADEL<span className="text-white/35">PULSE</span>
        </Link>

        <div className="bg-[#0d0d0d] border border-white/8 p-8">
          <div className="text-[0.62rem] tracking-[0.25em] uppercase text-white/30 mb-6 text-center">
            Create Account
          </div>

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            {[
              { label: "Full Name", key: "name", type: "text", placeholder: "Ahmed Khan", required: true },
              { label: "Email", key: "email", type: "email", placeholder: "you@example.com", required: true },
              { label: "Phone", key: "phone", type: "tel", placeholder: "+92 300 0000000", required: false },
              { label: "Password", key: "password", type: "password", placeholder: "••••••••", required: true },
              { label: "Confirm Password", key: "confirm", type: "password", placeholder: "••••••••", required: true },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-[0.62rem] tracking-[0.16em] uppercase text-white/35 mb-2">
                  {f.label}
                </label>
                <input
                  type={f.type}
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  required={f.required}
                  className="w-full bg-transparent border border-white/15 text-white text-[0.82rem] px-4 py-3 outline-none focus:border-white/35 placeholder:text-white/20"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black text-[0.78rem] font-medium tracking-[0.15em] uppercase py-4 mt-2 hover:opacity-88 transition-opacity disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
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
            <span className="text-[0.72rem] text-white/30">Already have an account? </span>
            <Link href="/auth/login" className="text-[0.72rem] text-white hover:text-white/70 transition-colors">
              Sign in →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
