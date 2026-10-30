"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { UserRole } from "@/lib/types";

interface MockModeBarProps {
  initialRole: UserRole;
  isMock: boolean;
}

export default function MockModeBar({ initialRole, isMock }: MockModeBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<UserRole>(initialRole);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (!isMock) return null;

  async function handleRoleChange(newRole: UserRole) {
    setLoading(true);
    try {
      await fetch("/api/mock/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      setRole(newRole);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    if (!confirm("Reset all mock categories, anklets, stock, and settings to original demo data?")) return;
    setLoading(true);
    try {
      await fetch("/api/mock/reset", { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-3 right-3 z-50 px-3 py-1.5 rounded-full bg-surface-elevated text-text-primary font-medium text-xs shadow-lg hover:border-accent transition flex items-center gap-2 border border-divider"
      >
        <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
        <span>Mock Mode: {role.toUpperCase()}</span>
      </button>
    );
  }

  return (
    <aside
      aria-label="Mock mode controls"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-4xl bg-surface-elevated/95 border border-divider rounded-2xl shadow-xl backdrop-blur-xl px-4 py-2.5 text-xs text-text-primary"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Mode indicator */}
        <div className="flex items-center gap-2">
          <span className="badge badge-category">
            Mock Mode
          </span>
          <span className="text-text-secondary hidden sm:inline text-caption">
            In-memory sample data • Zero backend blockers
          </span>
        </div>

        {/* Center: Role Switcher */}
        <div className="flex items-center gap-1 bg-bg-alt p-1 rounded-full border border-divider">
          <span className="text-[10px] text-text-secondary px-2 font-medium">Viewing as:</span>
          {(["admin", "customer", "visitor"] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => handleRoleChange(r)}
              disabled={loading}
              className={`px-3 py-1 rounded-full text-caption font-medium transition capitalize ${
                role === r
                  ? "bg-accent text-bg-primary font-semibold shadow-xs"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {r === "customer" ? "Wholesaler" : r}
            </button>
          ))}
        </div>

        {/* Right: Quick Links & Actions */}
        <div className="flex items-center gap-2">
          {pathname.startsWith("/admin") ? (
            <Link
              href="/"
              className="btn btn-outline btn-sm text-caption"
            >
              &larr; Storefront
            </Link>
          ) : (
            <Link
              href="/admin"
              className="btn btn-primary btn-sm text-caption"
            >
              Admin Panel &rarr;
            </Link>
          )}

          <button
            onClick={handleReset}
            disabled={loading}
            title="Reset sample data to factory defaults"
            className="px-2.5 py-1 rounded-full bg-bg-alt hover:bg-status-out-of-stock-bg hover:text-status-out-of-stock-text text-text-secondary transition text-caption border border-divider"
          >
            Reset
          </button>

          <button
            onClick={() => setCollapsed(true)}
            className="p-1 rounded-full text-text-secondary hover:text-text-primary transition"
            title="Minimize bar"
            aria-label="Minimize bar"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
