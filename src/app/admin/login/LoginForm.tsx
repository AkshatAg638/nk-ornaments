"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";
  const urlError = searchParams.get("error");
  const urlMessage = searchParams.get("message");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    urlError === "unauthorized"
      ? "Access denied. Your account does not have administrator privileges."
      : null
  );

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();

      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (authError || !authData.user) {
        throw new Error(authError?.message || "Invalid email or password.");
      }

      // 2. Verify admin privilege against admins table
      const { data: adminRecord, error: adminQueryError } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", authData.user.id)
        .maybeSingle();

      if (adminQueryError || !adminRecord) {
        // Sign out immediately if not in admins table
        await supabase.auth.signOut();
        throw new Error(
          "Access denied: This user account does not have administrator privileges."
        );
      }

      // 3. Authorized admin: redirect to target page
      router.push(next);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected authentication error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {urlMessage === "setup_complete" && (
        <div className="bg-status-in-stock-bg border border-status-in-stock/25 rounded-xl p-3 text-xs text-status-in-stock-text flex items-start gap-2">
          <svg
            className="w-4 h-4 text-status-in-stock-text shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>Administrator created successfully! You can now log in below.</span>
        </div>
      )}

      {error && (
        <div className="bg-status-out-of-stock-bg border border-status-out-of-stock/25 rounded-xl p-3 text-xs text-status-out-of-stock-text flex items-start gap-2">
          <svg
            className="w-4 h-4 text-status-out-of-stock-text shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div>
        <label
          htmlFor="admin-email"
          className="block text-xs font-medium text-text-secondary mb-1.5"
        >
          Administrator Email
        </label>
        <input
          id="admin-email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@nkornaments.com"
          className="input-pearl text-xs"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="admin-password"
            className="block text-xs font-medium text-text-secondary"
          >
            Password
          </label>
        </div>
        <input
          id="admin-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="input-pearl text-xs"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full py-3 text-xs font-semibold tracking-wide flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4 text-bg-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Verifying Credentials...</span>
          </>
        ) : (
          "Sign In as Admin"
        )}
      </button>
    </form>
  );
}
