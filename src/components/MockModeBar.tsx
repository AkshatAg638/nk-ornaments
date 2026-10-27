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
        className="fixed bottom-3 right-3 z-50 px-3 py-1.5 rounded-full bg-amber-500 text-slate-950 font-bold text-xs shadow-2xl hover:scale-105 transition flex items-center gap-1.5 border border-amber-300"
      >
        <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping"></span>
        <span>Mock Mode: {role.toUpperCase()}</span>
      </button>
    );
  }

  return (
    <aside
      aria-label="Mock mode controls"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-4xl bg-slate-900/95 border border-amber-500/40 rounded-2xl shadow-2xl backdrop-blur-xl px-4 py-2.5 text-xs text-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Mode indicator */}
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold tracking-wider text-[10px] uppercase">
            Mock Mode Active
          </span>
          <span className="text-slate-400 hidden sm:inline text-[11px]">
            In-memory sample data • Zero backend blockers
          </span>
        </div>

        {/* Center: Role Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 px-2 font-medium">Viewing as:</span>
          {(["admin", "customer", "visitor"] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => handleRoleChange(r)}
              disabled={loading}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition capitalize ${
                role === r
                  ? "bg-amber-500 text-slate-950 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-white"
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
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-[11px]"
            >
              &larr; Storefront
            </Link>
          ) : (
            <Link
              href="/admin"
              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition text-[11px]"
            >
              Admin Panel &rarr;
            </Link>
          )}

          <button
            onClick={handleReset}
            disabled={loading}
            title="Reset sample data to factory defaults"
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 transition text-[11px]"
          >
            Reset
          </button>

          <button
            onClick={() => setCollapsed(true)}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
            title="Minimize bar"
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
