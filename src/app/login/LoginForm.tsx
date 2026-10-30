"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/varieties";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      if (data.role === "admin") {
        router.push("/admin");
      } else {
        router.push(redirectUrl);
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-status-out-of-stock-bg border border-status-out-of-stock/25 text-status-out-of-stock-text text-xs">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">
          Email Address
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. buyer@jewelers.com"
          className="input-pearl text-xs"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-medium text-text-secondary">
            Password
          </label>
        </div>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="input-pearl text-xs"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full py-3.5 text-xs font-semibold tracking-wide disabled:opacity-50"
      >
        {loading ? "Signing In..." : "Sign In to Wholesale Portal"}
      </button>

      <div className="pt-2 text-center space-y-3">
        <p className="text-xs text-text-secondary">
          New jewelry showroom or wholesaler?{" "}
          <Link
            href="/register"
            className="text-accent hover:underline font-semibold"
          >
            Register Account &rarr;
          </Link>
        </p>

        <div className="border-t border-divider pt-3">
          <Link
            href="/admin/login"
            className="text-xs text-text-secondary hover:text-text-primary transition"
          >
            Staff &amp; Administrator Login &rarr;
          </Link>
        </div>
      </div>
    </form>
  );
}
