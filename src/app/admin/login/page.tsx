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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand / Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 mb-4 shadow-xl shadow-amber-500/10 font-bold text-xl">
            NK
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            N.K Ornaments
          </h1>
          <p className="text-xs uppercase tracking-widest text-amber-400/90 font-medium mt-1">
            Wholesale Manufacturer Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Admin Sign In</h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter your administrative credentials to manage inventory and orders
            </p>
          </div>

          <Suspense fallback={<div className="text-xs text-slate-400 py-6 text-center">Loading login form...</div>}>
            <LoginForm />
          </Suspense>

          {!adminExists && (
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
              <p className="text-xs text-slate-400 mb-2">
                No administrator account has been set up yet.
              </p>
              <Link
                href="/admin/setup"
                className="inline-flex items-center text-xs font-medium text-amber-400 hover:text-amber-300 underline underline-offset-4 transition"
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
            className="text-xs text-slate-500 hover:text-slate-400 transition inline-flex items-center gap-1"
          >
            &larr; Return to public wholesale website
          </Link>
        </div>
      </div>
    </div>
  );
}
