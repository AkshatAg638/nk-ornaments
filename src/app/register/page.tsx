import { Metadata } from "next";
import RegisterForm from "./RegisterForm";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import { getCurrentAuthUser, getSiteSettings } from "@/lib/data";

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
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary">
      <Header
        settings={settings}
        session={session}
      />

      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="w-full max-w-xl">
          {/* Header */}
          <div className="text-center mb-8 space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-accent text-bg-primary flex items-center justify-center font-bold text-base shadow-sm">
              NK
            </div>
            <h1
              className="text-3xl sm:text-4xl font-normal text-text-primary tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Wholesale Jeweler Registration
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
              Direct factory association for retail jewelry showrooms, bullion dealers, and regional distributors across India.
            </p>
          </div>

          <div className="card-pearl bg-surface-card p-6 sm:p-10 shadow-lg border border-divider">
            <RegisterForm />
          </div>

          <p className="text-center text-caption text-text-secondary mt-6">
            N.K. Ornaments &bull; Direct Mathura Factory Supply &bull; German Silver Payal
          </p>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
