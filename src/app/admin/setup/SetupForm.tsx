"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to complete setup.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/login?message=setup_complete");
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-status-in-stock-bg border border-status-in-stock/25 flex items-center justify-center text-status-in-stock-text">
          <svg
            className="w-6 h-6"
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
        </div>
        <h2 className="text-lg font-serif font-medium text-text-primary">Setup Successful!</h2>
        <p className="text-xs text-text-secondary">
          Your administrator account has been created and this setup page is now locked.
        </p>
        <p className="text-xs text-accent font-medium">
          Redirecting you to the login page...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-bg-alt border border-divider rounded-xl p-3 text-xs text-text-secondary">
        This is a one-time setup to create the master administrator account for N.K. Ornaments.
      </div>

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
          htmlFor="email"
          className="block text-xs font-medium text-text-secondary mb-1.5"
        >
          Admin Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@nkornaments.com"
          className="input-pearl text-xs"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-xs font-medium text-text-secondary mb-1.5"
        >
          Master Password (min 8 chars, letter + number)
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="input-pearl text-xs"
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-xs font-medium text-text-secondary mb-1.5"
        >
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
            <span>Creating Administrator...</span>
          </>
        ) : (
          "Initialize Master Admin"
        )}
      </button>
    </form>
  );
}
