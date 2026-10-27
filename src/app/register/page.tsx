import { Metadata } from "next";
import RegisterForm from "./RegisterForm";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import { getCurrentAuthUser, getCategories, getSiteSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Register for Wholesale Supply | N.K. Ornaments Mathura",
  description:
    "Register your jewelry showroom or trading firm to access manufacturer-direct German Silver payal supply from Mathura.",
};

export default async function RegisterPage() {
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
        <div className="w-full max-w-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4 shadow-lg shadow-amber-500/5 text-2xl">
              🏬
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-serif">
              Wholesale Jeweler Registration
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto">
              Direct factory association for retail jewelry showrooms, bullions, and regional distributors across India.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
            <RegisterForm />
          </div>

          <p className="text-center text-xs text-slate-500 mt-6">
            N.K. Ornaments &bull; Direct Mathura Factory Supply &bull; German Silver Payal
          </p>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
