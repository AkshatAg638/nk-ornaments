"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthSession } from "@/lib/types";
import { useCart } from "@/context/CartContext";

interface HeaderProps {
  settings: Record<string, string>;
  session: AuthSession;
}

export default function Header({ settings, session }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems, setIsOpen } = useCart();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoggingOut(false);
    }
  }

  const businessName = settings.business_name || "N.K. Ornaments";
  const bannerText = settings.banner_text || "✨ B2B Wholesale Only • Direct Factory Rates • Premium German Silver • Mathura";
  const whatsappNumber = settings.contact_whatsapp || "+919837755055";
  const cleanWhatsApp = whatsappNumber.replace(/[^0-9]/g, "");

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Varieties & Catalog", href: "/varieties" },
    { name: "About Us", href: "/about" },
    { name: "Contact & Inquiries", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Top Announcement Strip */}
      {bannerText && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 px-4 py-1.5 text-center text-[11px] font-semibold tracking-wide shadow-sm">
          <span>{bannerText}</span>
        </div>
      )}

      {/* Main Navigation Bar */}
      <nav className="bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black text-base shadow-lg shadow-amber-500/10 group-hover:scale-105 transition">
              NK
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base sm:text-lg text-white tracking-tight group-hover:text-amber-400 transition">
                {businessName}
              </span>
              <span className="text-[10px] tracking-widest text-amber-400/90 font-medium uppercase">
                German Silver Payal Manufacturers &bull; Mathura
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium transition ${
                    active
                      ? "text-amber-400 bg-amber-500/10 font-semibold"
                      : "text-slate-300 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Direct WhatsApp Callout */}
            {cleanWhatsApp && (
              <a
                href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
                  "Hello N.K. Ornaments, I am a retail jeweler interested in wholesale German Silver payal supply."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition"
              >
                <span>💬 WhatsApp Trade</span>
              </a>
            )}

            {/* Cart / Wholesale Order Draft Trigger Button */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700/80 hover:border-amber-500/50 text-slate-200 hover:text-white transition flex items-center gap-1.5 shadow"
              title="View Wholesale Order Draft"
            >
              <span>🛍️</span>
              <span className="text-amber-300 font-medium">Order Draft</span>
              {totalItems > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Session Chip / Customer Login & Admin Actions */}
            {session.role === "admin" ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 transition shadow"
                  title="Open Admin Dashboard"
                >
                  <span>Admin Panel</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition"
                  title="Sign out to Customer / Visitor view"
                >
                  {loggingOut ? "..." : "Sign Out"}
                </button>
              </div>
            ) : session.role === "customer" ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/account"
                  className="text-xs text-amber-300 font-medium bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-amber-500/40 transition flex items-center gap-1.5"
                  title="View Account Profile & Order History"
                >
                  <span>🏬</span>
                  <span className="truncate max-w-[120px]">
                    {session.customerProfile?.business_name || "Wholesaler"}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition"
                  title="Sign Out"
                >
                  {loggingOut ? "..." : "Sign Out"}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900/80 border border-slate-800/80 transition"
                >
                  Customer Login
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  Register Wholesale
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger & Cart */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2 rounded-xl text-slate-200 hover:text-white bg-slate-900 border border-slate-800"
              aria-label="View Wholesale Order Draft"
            >
              <span>🛍️</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/98 border-b border-slate-800 p-5 space-y-4 shadow-2xl backdrop-blur-2xl">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    active
                      ? "text-amber-400 bg-amber-500/10 font-semibold"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            {cleanWhatsApp && (
              <a
                href={`https://wa.me/${cleanWhatsApp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white"
              >
                <span>💬 WhatsApp Factory Direct</span>
              </a>
            )}

            {session.role === "admin" ? (
              <div className="space-y-2">
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 text-slate-950"
                >
                  Open Admin Dashboard &rarr;
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800"
                  >
                    Customer Login
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    disabled={loggingOut}
                    className="inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-medium text-slate-400 bg-slate-900/60 border border-slate-800 hover:text-white"
                  >
                    {loggingOut ? "..." : "Sign Out"}
                  </button>
                </div>
              </div>
            ) : session.role === "customer" ? (
              <div className="space-y-2">
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-amber-300"
                >
                  🏬 {session.customerProfile?.business_name || "My Wholesale Account"}
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/varieties"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-semibold bg-amber-400 text-slate-950"
                  >
                    Browse Catalog
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    disabled={loggingOut}
                    className="inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-medium text-slate-400 bg-slate-900/60 border border-slate-800 hover:text-white"
                  >
                    {loggingOut ? "..." : "Sign Out"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800"
                >
                  Customer Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-semibold bg-amber-400 text-slate-950"
                >
                  Register Wholesale
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
