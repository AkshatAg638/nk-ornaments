import { hasAnyAdmin } from "@/lib/auth";
import Link from "next/link";
import SetupForm from "./SetupForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Initial Admin Setup | N.K Ornaments",
  robots: "noindex, nofollow",
};

export default async function AdminSetupPage() {
  const isLocked = await hasAnyAdmin();

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-bg-alt border border-divider text-accent mb-4 shadow-sm">
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif tracking-tight text-text-primary">
            N.K. Ornaments Setup
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            {isLocked
              ? "Administrator account is already registered"
              : "One-time initial administrator account setup"}
          </p>
        </div>

        {/* Card Container */}
        <div className="card-pearl bg-surface-card border border-divider rounded-2xl p-6 sm:p-8 shadow-xl">
          {isLocked ? (
            <div className="text-center py-4 space-y-4">
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
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </div>

              <div>
                <h2 className="text-lg font-serif font-medium text-text-primary">
                  Setup Permanently Locked
                </h2>
                <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                  An administrator account has already been initialized. For security reasons,
                  this setup page cannot be accessed again.
                </p>
              </div>

              <div className="pt-4">
                <Link
                  href="/admin/login"
                  className="btn btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <span>Go to Admin Login</span>
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          ) : (
            <SetupForm />
          )}
        </div>

        {/* Security Footer Note */}
        <p className="text-center text-xs text-text-secondary mt-6">
          N.K. Ornaments Wholesale &bull; Secure Administrative Access
        </p>
      </div>
    </div>
  );
}
