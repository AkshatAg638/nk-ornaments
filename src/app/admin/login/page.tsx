import { hasAnyAdmin } from "@/lib/auth";
import LoginForm from "./LoginForm";
import Link from "next/link";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Login | N.K Ornaments",
  robots: "noindex, nofollow",
};

export default async function AdminLoginPage() {
  const adminExists = await hasAnyAdmin();

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand / Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent text-bg-primary mb-4 shadow-sm font-bold text-xl">
            NK
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif tracking-tight text-text-primary">
            N.K. Ornaments
          </h1>
          <p className="text-xs uppercase tracking-widest text-text-secondary font-mono mt-1">
            Wholesale Manufacturer Portal
          </p>
        </div>

        {/* Card */}
        <div className="card-pearl bg-surface-card border border-divider rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="mb-6">
            <h2 className="text-lg font-serif font-medium text-text-primary">Admin Sign In</h2>
            <p className="text-xs text-text-secondary mt-1">
              Enter your administrative credentials to manage inventory and orders
            </p>
          </div>

          <Suspense fallback={<div className="text-xs text-text-secondary py-6 text-center">Loading login form...</div>}>
            <LoginForm />
          </Suspense>

          {!adminExists && (
            <div className="mt-6 pt-4 border-t border-divider text-center">
              <p className="text-xs text-text-secondary mb-2">
                No administrator account has been set up yet.
              </p>
              <Link
                href="/admin/setup"
                className="inline-flex items-center text-xs font-medium text-accent hover:underline transition"
              >
                Go to One-Time Initial Setup &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* Back to public site */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-text-secondary hover:text-text-primary transition inline-flex items-center gap-1"
          >
            &larr; Return to public wholesale website
          </Link>
        </div>
      </div>
    </div>
  );
}
