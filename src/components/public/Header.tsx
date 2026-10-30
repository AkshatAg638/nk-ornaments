"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthSession } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, User, LogOut, Shield, Menu, X } from "lucide-react";

interface HeaderProps {
  settings: Record<string, string>;
  session: AuthSession;
}

export default function Header({ settings, session }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems, setIsOpen } = useCart();
  const [loggingOut, setLoggingOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Frosted header on scroll
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Varieties & Catalog", href: "/varieties" },
    { name: "About Us", href: "/about" },
    { name: "Contact & Inquiries", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-all">
      {/* Main Navigation Bar */}
      <nav
        className={`transition-all duration-300 ${
          scrolled
            ? "bg-surface-frosted backdrop-blur-xl border-b border-divider shadow-xs"
            : "bg-bg-primary/85 backdrop-blur-md border-b border-divider/60"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-10 h-10 rounded-xl bg-accent text-bg-primary flex items-center justify-center font-bold text-sm tracking-widest transition-all duration-300 group-hover:bg-accent-hover shadow-xs">
              NK
            </div>
            <div className="flex flex-col">
              <span
                className="font-semibold text-lg sm:text-xl text-text-primary tracking-tight group-hover:text-accent transition-colors"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {businessName}
              </span>
              <span className="text-[10px] tracking-[0.18em] text-accent font-medium uppercase font-sans">
                German Silver Payal • Mathura
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
            {navLinks.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-xs tracking-wide transition-all duration-200 ${
                    active
                      ? "text-text-primary bg-bg-alt font-semibold shadow-xs"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-alt/60 font-medium"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Action Icons */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Order Draft Trigger: Icon Only */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2.5 rounded-full text-text-secondary hover:text-text-primary bg-bg-alt/80 hover:bg-bg-alt border border-divider hover:border-accent transition-all duration-200 flex items-center justify-center group"
              title="View Order Draft"
              aria-label="View Order Draft"
            >
              <ShoppingBag className="w-[18px] h-[18px] transition-transform group-hover:scale-105" strokeWidth={1.8} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold bg-accent text-bg-primary flex items-center justify-center leading-none shadow-xs">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Session Chip / Customer Login & Admin Actions */}
            {session.role === "admin" ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-accent text-bg-primary hover:bg-accent-hover transition-all shadow-xs"
                  title="Open Admin Dashboard"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-status-in-stock animate-pulse"></span>
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-alt border border-transparent hover:border-divider transition-all"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" strokeWidth={1.8} />
                </button>
              </div>
            ) : session.role === "customer" ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/account"
                  className="p-2.5 rounded-full text-text-secondary hover:text-text-primary bg-bg-alt/80 hover:bg-bg-alt border border-divider hover:border-accent transition-all flex items-center justify-center"
                  title="My Account & Order History"
                  aria-label="My Account"
                >
                  <User className="w-[18px] h-[18px]" strokeWidth={1.8} />
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-alt border border-transparent hover:border-divider transition-all"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" strokeWidth={1.8} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="p-2.5 rounded-full text-text-secondary hover:text-text-primary bg-bg-alt/80 hover:bg-bg-alt border border-divider hover:border-accent transition-all flex items-center justify-center"
                  title="Customer Login"
                  aria-label="Customer Login"
                >
                  <User className="w-[18px] h-[18px]" strokeWidth={1.8} />
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-full text-xs font-semibold text-bg-primary bg-accent hover:bg-accent-hover transition-all shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger & Cart */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2.5 rounded-full text-text-primary hover:text-accent bg-bg-alt border border-divider"
              aria-label="View Order Draft"
            >
              <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.8} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold bg-accent text-bg-primary flex items-center justify-center leading-none">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-alt transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" strokeWidth={2} />
              ) : (
                <Menu className="w-5 h-5" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Fullscreen Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-0 z-50 bg-bg-primary flex flex-col">
          {/* Mobile menu header */}
          <div className="flex items-center justify-between px-5 py-5 border-b border-divider">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent text-bg-primary flex items-center justify-center font-bold text-sm">
                NK
              </div>
              <span
                className="font-semibold text-base text-text-primary"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {businessName}
              </span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full hover:bg-bg-alt text-text-secondary"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          {/* Mobile nav links */}
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-1">
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
                  className={`block px-4 py-3.5 rounded-xl text-base font-medium transition ${
                    active
                      ? "text-text-primary bg-bg-alt font-semibold"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-alt/60"
                  }`}
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Mobile action buttons */}
          <div className="px-5 py-5 border-t border-divider space-y-3">
            {session.role === "admin" ? (
              <div className="space-y-2">
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-semibold bg-accent text-bg-primary"
                >
                  <Shield className="w-4 h-4" />
                  <span>Open Admin Dashboard →</span>
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center px-3 py-2.5 rounded-full text-xs font-medium text-text-secondary bg-bg-alt border border-divider"
                  >
                    Customer Login
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    disabled={loggingOut}
                    className="inline-flex items-center justify-center px-3 py-2.5 rounded-full text-xs font-medium text-text-secondary bg-bg-alt border border-divider hover:text-text-primary"
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
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-medium bg-bg-alt border border-divider text-text-primary"
                >
                  <User className="w-4 h-4" />
                  <span>My Account & Orders</span>
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/varieties"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center px-3 py-2.5 rounded-full text-xs font-semibold bg-accent text-bg-primary"
                  >
                    Browse Catalog
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    disabled={loggingOut}
                    className="inline-flex items-center justify-center px-3 py-2.5 rounded-full text-xs font-medium text-text-secondary bg-bg-alt border border-divider hover:text-text-primary"
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
                  className="inline-flex items-center justify-center px-3 py-2.5 rounded-full text-xs font-medium text-text-secondary bg-bg-alt border border-divider"
                >
                  Customer Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center justify-center px-3 py-2.5 rounded-full text-xs font-semibold bg-accent text-bg-primary"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
