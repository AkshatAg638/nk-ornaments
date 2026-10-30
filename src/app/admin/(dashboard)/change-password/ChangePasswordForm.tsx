"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ChangePasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError("Password must contain at least one letter and one number.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update password.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handlePasswordChange} className="space-y-4">
      {success && (
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
          <span>Your administrator password has been updated successfully!</span>
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
          htmlFor="new-password"
          className="block text-xs font-medium text-text-secondary mb-1.5"
        >
          New Password (min 8 characters, letter + number)
        </label>
        <input
          id="new-password"
          type="password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••••"
          className="input-pearl text-xs"
        />
      </div>

      <div>
        <label
          htmlFor="confirm-new-password"
          className="block text-xs font-medium text-text-secondary mb-1.5"
        >
          Confirm New Password
        </label>
        <input
          id="confirm-new-password"
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
            <span>Updating Password...</span>
          </>
        ) : (
          "Save New Password"
        )}
      </button>
    </form>
  );
}
