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
          <h1 className="text-2xl sm:text-3xl font-serif text-text-primary tracking-tight">
            Site Settings &amp; Wholesale Policy
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Updates to business name, contact info, WhatsApp, homepage trust badges, stats, and price visibility take effect instantly.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary text-xs py-2.5 px-5 disabled:opacity-50 shrink-0"
        >
          {saving ? "Saving Changes..." : "Save Settings Live"}
        </button>
      </div>

      {success && (
        <div className="bg-status-in-stock-bg border border-status-in-stock/25 rounded-2xl p-4 text-xs text-status-in-stock-text flex items-center gap-2">
          <svg className="w-4 h-4 text-status-in-stock-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Settings saved successfully! Public pages are displaying updated content immediately.</span>
        </div>
      )}

      {error && (
        <div className="bg-status-out-of-stock-bg border border-status-out-of-stock/25 rounded-2xl p-4 text-xs text-status-out-of-stock-text">
          {error}
        </div>
      )}

      {/* Price Visibility Rule Card */}
      <div className="card-pearl bg-surface-card border border-divider rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5 pb-2">
          <span className="p-1.5 rounded-lg bg-bg-alt text-accent border border-divider">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </span>
          <div>
            <h2 className="text-sm font-serif font-medium text-text-primary">Wholesale Price Visibility</h2>
            <p className="text-xs text-text-secondary">
              Control whether public visitors can see your wholesale rates or must register/log in first.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <label
            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
              settings.price_visibility === "customers_only"
                ? "bg-bg-alt border-accent ring-1 ring-accent"
                : "bg-surface-card border-divider hover:border-accent/40"
            }`}
          >
            <input
              type="radio"
              name="price_visibility"
              value="customers_only"
              checked={settings.price_visibility === "customers_only"}
              onChange={(e) => handleChange("price_visibility", e.target.value)}
              className="mt-1 text-accent focus:ring-accent"
            />
            <div>
              <span className="text-xs font-semibold text-text-primary block">
                Wholesalers Only (Default &bull; Recommended)
              </span>
              <span className="text-xs text-text-secondary leading-relaxed block mt-0.5">
                Visitors see "Login to view wholesale prices" and cannot place orders without business registration.
              </span>
            </div>
          </label>

          <label
            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
              settings.price_visibility === "everyone"
                ? "bg-bg-alt border-accent ring-1 ring-accent"
                : "bg-surface-card border-divider hover:border-accent/40"
            }`}
          >
            <input
              type="radio"
              name="price_visibility"
              value="everyone"
              checked={settings.price_visibility === "everyone"}
              onChange={(e) => handleChange("price_visibility", e.target.value)}
              className="mt-1 text-accent focus:ring-accent"
            />
            <div>
              <span className="text-xs font-semibold text-text-primary block">
                Public Visibility (Everyone)
              </span>
              <span className="text-xs text-text-secondary leading-relaxed block mt-0.5">
                All visitors see wholesale prices directly, but must still register to place an order.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Brand & Hero Identity */}
      <div className="card-pearl bg-surface-card border border-divider rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 className="text-sm font-serif font-medium text-text-primary border-b border-divider pb-3">
          Brand &amp; Hero Section
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Business / Manufacturing Name *
            </label>
            <input
              type="text"
              required
              value={settings.business_name || ""}
              onChange={(e) => handleChange("business_name", e.target.value)}
              placeholder="e.g. N.K. Ornaments"
              className="input-pearl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Tagline *
            </label>
            <input
              type="text"
              value={settings.tagline || ""}
              onChange={(e) => handleChange("tagline", e.target.value)}
              placeholder="e.g. Master Manufacturers & Wholesalers of Fine German Silver Payal"
              className="input-pearl text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Top Announcement Banner Text
          </label>
          <input
            type="text"
            value={settings.banner_text || ""}
            onChange={(e) => handleChange("banner_text", e.target.value)}
            placeholder="e.g. Direct Factory Rates • Premium German Silver • Mathura"
            className="input-pearl text-xs font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            About Us Description (Public About page and homepage excerpt)
          </label>
          <textarea
            rows={4}
            value={settings.about_text || ""}
            onChange={(e) => handleChange("about_text", e.target.value)}
            placeholder="Tell your brand history, Mathura German Silver craftsmanship, weight precision, and wholesale terms..."
            className="input-pearl text-xs"
          />
        </div>
      </div>

      {/* Homepage Trust Badges & Badges Row */}
      <div className="card-pearl bg-surface-card border border-divider rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="border-b border-divider pb-3">
          <h2 className="text-sm font-serif font-medium text-text-primary">
            Homepage Trust Badges
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Customise the 4 trust statements displayed under the hero section. Leave all empty to hide the row entirely.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Trust Item 1
            </label>
            <input
              type="text"
              value={settings.trust_item_1 || ""}
              onChange={(e) => handleChange("trust_item_1", e.target.value)}
              placeholder="e.g. Mathura Factory Direct"
              className="input-pearl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Trust Item 2
            </label>
            <input
              type="text"
              value={settings.trust_item_2 || ""}
              onChange={(e) => handleChange("trust_item_2", e.target.value)}
              placeholder="e.g. Exact Gram Calibration"
              className="input-pearl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Trust Item 3
            </label>
            <input
              type="text"
              value={settings.trust_item_3 || ""}
              onChange={(e) => handleChange("trust_item_3", e.target.value)}
              placeholder="e.g. Premium German Silver"
              className="input-pearl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Trust Item 4
            </label>
            <input
              type="text"
              value={settings.trust_item_4 || ""}
              onChange={(e) => handleChange("trust_item_4", e.target.value)}
              placeholder="e.g. Insured All-India Transit"
              className="input-pearl text-xs"
            />
          </div>
        </div>
      </div>

      {/* Homepage Statistics Row */}
      <div className="card-pearl bg-surface-card border border-divider rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="border-b border-divider pb-3">
          <h2 className="text-sm font-serif font-medium text-text-primary">
            Homepage Metrics &amp; Key Numbers
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Values and labels for the stats bar. If empty, the homepage gracefully omits unconfigured stats.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-bg-alt/50 border border-divider space-y-2">
            <span className="text-[11px] font-mono text-accent uppercase block">Stat 1</span>
            <div>
              <label className="block text-[11px] text-text-secondary mb-1">Value</label>
              <input
                type="text"
                value={settings.stat_1_value || ""}
                onChange={(e) => handleChange("stat_1_value", e.target.value)}
                placeholder="25+"
                className="input-pearl text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-text-secondary mb-1">Label</label>
              <input
                type="text"
                value={settings.stat_1_label || ""}
                onChange={(e) => handleChange("stat_1_label", e.target.value)}
                placeholder="Years Heritage"
                className="input-pearl text-xs"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-bg-alt/50 border border-divider space-y-2">
            <span className="text-[11px] font-mono text-accent uppercase block">Stat 2</span>
            <div>
              <label className="block text-[11px] text-text-secondary mb-1">Value</label>
              <input
                type="text"
                value={settings.stat_2_value || ""}
                onChange={(e) => handleChange("stat_2_value", e.target.value)}
                placeholder="1,200+"
                className="input-pearl text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-text-secondary mb-1">Label</label>
              <input
                type="text"
                value={settings.stat_2_label || ""}
                onChange={(e) => handleChange("stat_2_label", e.target.value)}
                placeholder="Active Moulds"
                className="input-pearl text-xs"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-bg-alt/50 border border-divider space-y-2">
            <span className="text-[11px] font-mono text-accent uppercase block">Stat 3</span>
            <div>
              <label className="block text-[11px] text-text-secondary mb-1">Value</label>
              <input
                type="text"
                value={settings.stat_3_value || ""}
                onChange={(e) => handleChange("stat_3_value", e.target.value)}
                placeholder="50,000+"
                className="input-pearl text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-text-secondary mb-1">Label</label>
              <input
                type="text"
                value={settings.stat_3_label || ""}
                onChange={(e) => handleChange("stat_3_label", e.target.value)}
                placeholder="Monthly Pairs"
                className="input-pearl text-xs"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-bg-alt/50 border border-divider space-y-2">
            <span className="text-[11px] font-mono text-accent uppercase block">Stat 4</span>
            <div>
              <label className="block text-[11px] text-text-secondary mb-1">Value</label>
              <input
                type="text"
                value={settings.stat_4_value || ""}
                onChange={(e) => handleChange("stat_4_value", e.target.value)}
                placeholder="0.01g"
                className="input-pearl text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-text-secondary mb-1">Label</label>
              <input
                type="text"
                value={settings.stat_4_label || ""}
                onChange={(e) => handleChange("stat_4_label", e.target.value)}
                placeholder="Weight Accuracy"
                className="input-pearl text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact & WhatsApp */}
      <div className="card-pearl bg-surface-card border border-divider rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 className="text-sm font-serif font-medium text-text-primary border-b border-divider pb-3">
          Contact Details &amp; Quick WhatsApp Ordering
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              WhatsApp Number (with country code) *
            </label>
            <input
              type="text"
              required
              value={settings.contact_whatsapp || ""}
              onChange={(e) => handleChange("contact_whatsapp", e.target.value)}
              placeholder="e.g. +919837755055"
              className="input-pearl text-xs font-mono"
            />
            <span className="text-[11px] text-text-secondary mt-1 block">
              Used for floating chat button and 1-click order share.
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Contact Phone (Click to Call)
            </label>
            <input
              type="text"
              value={settings.contact_phone || ""}
              onChange={(e) => handleChange("contact_phone", e.target.value)}
              placeholder="e.g. +91 98377 55055"
              className="input-pearl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Contact Email
            </label>
            <input
              type="email"
              value={settings.contact_email || ""}
              onChange={(e) => handleChange("contact_email", e.target.value)}
              placeholder="e.g. sachin@nkornaments.com"
              className="input-pearl text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Factory / Showroom Physical Address
          </label>
          <input
            type="text"
            value={settings.contact_address || ""}
            onChange={(e) => handleChange("contact_address", e.target.value)}
            placeholder="e.g. Near Hathras Kachodi Wala, Chowk Bazar, Mathura - 281001, Uttar Pradesh"
            className="input-pearl text-xs"
          />
        </div>
      </div>

      {/* Social Links */}
      <div className="card-pearl bg-surface-card border border-divider rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 className="text-sm font-serif font-medium text-text-primary border-b border-divider pb-3">
          Social Links &amp; Showcase Channels
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Instagram Profile URL
            </label>
            <input
              type="url"
              value={settings.social_instagram || ""}
              onChange={(e) => handleChange("social_instagram", e.target.value)}
              placeholder="https://instagram.com/..."
              className="input-pearl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Facebook Page URL
            </label>
            <input
              type="url"
              value={settings.social_facebook || ""}
              onChange={(e) => handleChange("social_facebook", e.target.value)}
              placeholder="https://facebook.com/..."
              className="input-pearl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              YouTube Channel URL
            </label>
            <input
              type="url"
              value={settings.social_youtube || ""}
              onChange={(e) => handleChange("social_youtube", e.target.value)}
              placeholder="https://youtube.com/..."
              className="input-pearl text-xs"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
