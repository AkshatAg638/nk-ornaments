"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SettingsClientProps {
  initialSettings: Record<string, string>;
}

export default function SettingsClient({
  initialSettings,
}: SettingsClientProps) {
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, string>>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(key: string, val: string) {
    setSettings((prev) => ({ ...prev, [key]: val }));
    setSuccess(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Site Settings &amp; Wholesale Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Updates to business name, contact info, WhatsApp, and price visibility take effect instantly for all visitors.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 shrink-0"
        >
          {saving ? "Saving Changes..." : "Save Settings Live"}
        </button>
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-xs text-emerald-300 flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Settings saved successfully! Public pages are displaying updated content immediately.</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Price Visibility Rule Card (Hard Requirement) */}
      <div className="bg-gradient-to-r from-amber-950/20 to-slate-900 border border-amber-500/30 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </span>
          <div>
            <h2 className="text-sm font-semibold text-white">Wholesale Price Visibility</h2>
            <p className="text-[11px] text-slate-400">
              Control whether public visitors can see your wholesale rates or must register/log in first.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <label
            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
              settings.price_visibility === "customers_only"
                ? "bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/40"
                : "bg-slate-950 border-slate-800 hover:border-slate-700"
            }`}
          >
            <input
              type="radio"
              name="price_visibility"
              value="customers_only"
              checked={settings.price_visibility === "customers_only"}
              onChange={(e) => handleChange("price_visibility", e.target.value)}
              className="mt-1 text-amber-500 focus:ring-amber-500"
            />
            <div>
              <span className="text-xs font-semibold text-white block">
                Wholesalers Only (Default &bull; Recommended)
              </span>
              <span className="text-[11px] text-slate-400 leading-relaxed block mt-0.5">
                Visitors see "Login to view wholesale prices" and cannot place orders without business registration.
              </span>
            </div>
          </label>

          <label
            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
              settings.price_visibility === "everyone"
                ? "bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/40"
                : "bg-slate-950 border-slate-800 hover:border-slate-700"
            }`}
          >
            <input
              type="radio"
              name="price_visibility"
              value="everyone"
              checked={settings.price_visibility === "everyone"}
              onChange={(e) => handleChange("price_visibility", e.target.value)}
              className="mt-1 text-amber-500 focus:ring-amber-500"
            />
            <div>
              <span className="text-xs font-semibold text-white block">
                Public Visibility (Everyone)
              </span>
              <span className="text-[11px] text-slate-400 leading-relaxed block mt-0.5">
                All visitors see wholesale prices directly, but must still register to place an order.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Brand & Hero Identity */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white border-b border-slate-800 pb-3">
          Brand &amp; Hero Section
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Business / Manufacturing Name *
            </label>
            <input
              type="text"
              required
              value={settings.business_name || ""}
              onChange={(e) => handleChange("business_name", e.target.value)}
              placeholder="e.g. N.K. Ornaments"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Tagline *
            </label>
            <input
              type="text"
              value={settings.tagline || ""}
              onChange={(e) => handleChange("tagline", e.target.value)}
              placeholder="e.g. Master Manufacturers & Wholesalers of Fine Silver Payal"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Top Announcement Banner Text
          </label>
          <input
            type="text"
            value={settings.banner_text || ""}
            onChange={(e) => handleChange("banner_text", e.target.value)}
            placeholder="e.g. Wholesale Only • Direct Agra Factory Rates • All India Insured Delivery"
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            About Us Description (Public About page and homepage excerpt)
          </label>
          <textarea
            rows={4}
            value={settings.about_text || ""}
            onChange={(e) => handleChange("about_text", e.target.value)}
            placeholder="Tell your brand history, Agra German Silver craftsmanship, weight precision, and wholesale terms..."
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
      </div>

      {/* Contact & WhatsApp */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white border-b border-slate-800 pb-3">
          Contact Details &amp; Quick WhatsApp Ordering
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              WhatsApp Number (with country code) *
            </label>
            <input
              type="text"
              required
              value={settings.contact_whatsapp || ""}
              onChange={(e) => handleChange("contact_whatsapp", e.target.value)}
              placeholder="e.g. +919837012345"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-emerald-400 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Used for floating chat button and 1-click order share.
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Contact Phone (Click to Call)
            </label>
            <input
              type="text"
              value={settings.contact_phone || ""}
              onChange={(e) => handleChange("contact_phone", e.target.value)}
              placeholder="e.g. +91 98370 12345"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              value={settings.contact_email || ""}
              onChange={(e) => handleChange("contact_email", e.target.value)}
              placeholder="e.g. wholesale@nkornaments.com"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Factory / Showroom Physical Address
          </label>
          <input
            type="text"
            value={settings.contact_address || ""}
            onChange={(e) => handleChange("contact_address", e.target.value)}
            placeholder="e.g. Near Hathras Kachodi Wala, Chowk Bazar, Mathura - 281001, Uttar Pradesh"
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white border-b border-slate-800 pb-3">
          Social Links &amp; Showcase Channels
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Instagram Profile URL
            </label>
            <input
              type="url"
              value={settings.social_instagram || ""}
              onChange={(e) => handleChange("social_instagram", e.target.value)}
              placeholder="https://instagram.com/..."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Facebook Page URL
            </label>
            <input
              type="url"
              value={settings.social_facebook || ""}
              onChange={(e) => handleChange("social_facebook", e.target.value)}
              placeholder="https://facebook.com/..."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              YouTube Channel URL
            </label>
            <input
              type="url"
              value={settings.social_youtube || ""}
              onChange={(e) => handleChange("social_youtube", e.target.value)}
              placeholder="https://youtube.com/..."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
