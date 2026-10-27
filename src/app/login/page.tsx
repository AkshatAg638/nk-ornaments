import { Metadata } from "next";
import LoginForm from "./LoginForm";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import { getCurrentAuthUser, getCategories, getSiteSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wholesale Customer Login | N.K. Ornaments Mathura",
  description:
    "Log in to your verified wholesale jeweler account to view direct factory rates, live stock, and track orders.",
};

export default async function LoginPage() {
  const [session, settings] = await Promise.all([
    getCurrentAuthUser(),
    getSiteSettings(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header
        settings={settings}
        session={session}
      />

      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4 shadow-lg shadow-amber-500/5 text-2xl">
              💎
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-serif">
              Wholesale Portal Sign In
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Access direct Mathura manufacturer rates, live stock, and order tracking.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
            <LoginForm />
          </div>

          <p className="text-center text-xs text-slate-500 mt-6">
            Strictly wholesale B2B supply &bull; Chowk Bazar, Mathura (281001)
          </p>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
