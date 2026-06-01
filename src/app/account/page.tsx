"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Package, LogOut, User, ChevronRight } from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");
  const [profile, setProfile] = useState({ name: "", phone: "" });

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUser(user);
      setProfile({
        name: user.user_metadata?.name || "",
        phone: user.user_metadata?.phone || "",
      });

      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data.data || []);
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Logged out");
    router.push("/");
    router.refresh();
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { name: profile.name, phone: profile.phone },
    });
    if (error) {
      toast.error("Failed to update profile");
    } else {
      await fetch("/api/auth/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          name: profile.name,
          phone: profile.phone,
        }),
      });
      toast.success("Profile updated!");
    }
  };

  if (loading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="font-display text-[2rem] text-white/20 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen">
      {/* Header */}
      <div className="px-10 py-8 border-b border-white/8">
        <div className="text-[0.62rem] tracking-[0.15em] uppercase text-white/30 mb-1">
          My Account
        </div>
        <h1 className="font-display text-[3rem] tracking-[0.04em] leading-none">
          {user?.user_metadata?.name || user?.email?.split("@")[0] || "Account"}
        </h1>
        <div className="text-[0.72rem] text-white/30 mt-1">{user?.email}</div>
      </div>

      <div className="grid grid-cols-[240px_1fr] min-h-[60vh]">
        {/* Sidebar */}
        <div className="border-r border-white/8 p-6">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-3 px-4 py-3 text-[0.75rem] tracking-[0.1em] uppercase transition-all ${
                activeTab === "orders"
                  ? "text-white bg-gray border-r-2 border-white"
                  : "text-white/40 hover:text-white hover:bg-gray/50"
              }`}
            >
              <Package size={14} />
              My Orders
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 px-4 py-3 text-[0.75rem] tracking-[0.1em] uppercase transition-all ${
                activeTab === "profile"
                  ? "text-white bg-gray border-r-2 border-white"
                  : "text-white/40 hover:text-white hover:bg-gray/50"
              }`}
            >
              <User size={14} />
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-[0.75rem] tracking-[0.1em] uppercase text-red/60 hover:text-red transition-colors mt-4"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <>
              <div className="text-[0.65rem] tracking-[0.22em] uppercase text-white/30 mb-6">
                Order History
              </div>
              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Package size={40} className="text-white/15" />
                  <div className="text-[0.82rem] text-white/30">No orders yet</div>
                  <Link
                    href="/shop"
                    className="mt-2 border border-white/15 text-white/40 text-[0.72rem] tracking-[0.12em] uppercase px-6 py-3 hover:text-white hover:border-white/30 transition-all"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-px bg-white/8">
                  {orders.map((order: any) => (
                    <div
                      key={order.id}
                      className="bg-black hover:bg-gray transition-colors px-6 py-5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-8">
                        <div>
                          <div className="text-[0.82rem] font-medium mb-0.5">
                            {order.orderNumber}
                          </div>
                          <div className="text-[0.65rem] text-white/30">
                            {new Date(order.createdAt).toLocaleDateString("en-PK")} ·{" "}
                            {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
                          </div>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="font-display text-[1.1rem]">
                          Rs. {order.totalAmount?.toLocaleString()}
                        </div>
                        <ChevronRight size={16} className="text-white/25" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <>
              <div className="text-[0.65rem] tracking-[0.22em] uppercase text-white/30 mb-6">
                Profile Information
              </div>
              <form onSubmit={handleUpdateProfile} className="max-w-md flex flex-col gap-4">
                <div>
                  <label className="block text-[0.62rem] tracking-[0.16em] uppercase text-white/35 mb-2">
                    Full Name
                  </label>
                  <input
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Ahmed Khan"
                    className="w-full bg-transparent border border-white/15 text-white text-[0.82rem] px-4 py-3 outline-none focus:border-white/35 placeholder:text-white/20"
                  />
                </div>
                <div>
                  <label className="block text-[0.62rem] tracking-[0.16em] uppercase text-white/35 mb-2">
                    Email
                  </label>
                  <input
                    value={user?.email}
                    disabled
                    className="w-full bg-transparent border border-white/8 text-white/30 text-[0.82rem] px-4 py-3 outline-none cursor-not-allowed"
                  />
                  <p className="mt-1 text-[0.62rem] text-white/20">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-[0.62rem] tracking-[0.16em] uppercase text-white/35 mb-2">
                    Phone
                  </label>
                  <input
                    value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+92 300 0000000"
                    className="w-full bg-transparent border border-white/15 text-white text-[0.82rem] px-4 py-3 outline-none focus:border-white/35 placeholder:text-white/20"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-white text-black text-[0.75rem] font-medium tracking-[0.15em] uppercase py-3 hover:opacity-88 transition-opacity mt-2"
                >
                  Update Profile
                </button>
              </form>

              <div className="mt-10 pt-6 border-t border-white/8 max-w-md">
                <div className="text-[0.65rem] tracking-[0.22em] uppercase text-white/30 mb-4">
                  Security
                </div>
                <Link
                  href="/auth/forgot-password"
                  className="flex items-center justify-between px-4 py-3 border border-white/8 hover:border-white/20 hover:bg-gray transition-all"
                >
                  <span className="text-[0.78rem] text-white/55">Change Password</span>
                  <ChevronRight size={14} className="text-white/25" />
                </Link>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    CONFIRMED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    PROCESSING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    SHIPPED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    DELIVERED: "bg-green/10 text-green border-green/20",
    CANCELLED: "bg-red/10 text-red border-red/20",
  };
  return (
    <span className={`text-[0.58rem] tracking-[0.12em] uppercase border px-2 py-1 ${
      styles[status] ?? "bg-white/5 text-white/40 border-white/10"
    }`}>
      {status}
    </span>
  );
}
