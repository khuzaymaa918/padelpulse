"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [storeSettings, setStoreSettings] = useState({
    storeName: "Padel Pulse",
    storeEmail: "hello@padelpulse.pk",
    storePhone: "+92 300 0000000",
    storeAddress: "Lahore, Pakistan",
    currency: "PKR",
    taxRate: "17",
    freeShippingThreshold: "5000",
    standardShipping: "200",
    expressShipping: "350",
  });

  const handleSave = () => {
    toast.success("Settings saved!");
  };

  const Field = ({
    label, name, type = "text", prefix
  }: {
    label: string;
    name: keyof typeof storeSettings;
    type?: string;
    prefix?: string;
  }) => (
    <div>
      <label className="block text-[0.62rem] tracking-[0.16em] uppercase text-white/35 mb-2">{label}</label>
      <div className="flex items-center border border-white/15 focus-within:border-white/35 transition-colors">
        {prefix && (
          <span className="px-3 text-[0.75rem] text-white/30 border-r border-white/10">{prefix}</span>
        )}
        <input
          type={type}
          value={storeSettings[name]}
          onChange={(e) => setStoreSettings((s) => ({ ...s, [name]: e.target.value }))}
          className="flex-1 bg-transparent text-white text-[0.82rem] px-4 py-3 outline-none placeholder:text-white/20"
        />
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-[2.5rem] tracking-[0.04em] leading-none mb-1">Settings</h1>
        <p className="text-[0.75rem] text-white/35">Configure your store settings</p>
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-6 max-w-4xl">

        {/* Store Info */}
        <div className="bg-[#0d0d0d] border border-white/8 p-6">
          <div className="text-[0.62rem] tracking-[0.2em] uppercase text-white/30 mb-5 pb-2 border-b border-white/8">
            Store Information
          </div>
          <div className="flex flex-col gap-4">
            <Field label="Store Name" name="storeName" />
            <Field label="Email" name="storeEmail" type="email" />
            <Field label="Phone" name="storePhone" />
            <Field label="Address" name="storeAddress" />
          </div>
        </div>

        {/* Shipping & Tax */}
        <div className="bg-[#0d0d0d] border border-white/8 p-6">
          <div className="text-[0.62rem] tracking-[0.2em] uppercase text-white/30 mb-5 pb-2 border-b border-white/8">
            Shipping & Tax
          </div>
          <div className="flex flex-col gap-4">
            <Field label="Tax Rate (%)" name="taxRate" type="number" />
            <Field label="Free Shipping Threshold" name="freeShippingThreshold" type="number" prefix="Rs." />
            <Field label="Standard Shipping" name="standardShipping" type="number" prefix="Rs." />
            <Field label="Express Shipping" name="expressShipping" type="number" prefix="Rs." />
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-[#0d0d0d] border border-red/20 p-6 col-span-2">
          <div className="text-[0.62rem] tracking-[0.2em] uppercase text-red/60 mb-5 pb-2 border-b border-red/10">
            Danger Zone
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[0.82rem] font-medium mb-1">Clear all orders</div>
              <div className="text-[0.72rem] text-white/30">Permanently delete all order data. Cannot be undone.</div>
            </div>
            <button
              onClick={() => toast.error("This action is disabled in demo mode")}
              className="border border-red/30 text-red/60 text-[0.68rem] tracking-[0.12em] uppercase px-4 py-2 hover:border-red hover:text-red transition-all"
            >
              Clear Orders
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 max-w-4xl">
        <button
          onClick={handleSave}
          className="bg-white text-black text-[0.75rem] font-medium tracking-[0.15em] uppercase px-8 py-3 hover:opacity-88 transition-opacity"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
