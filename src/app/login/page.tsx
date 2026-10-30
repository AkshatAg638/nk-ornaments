import { Metadata } from "next";
import LoginForm from "./LoginForm";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import { getCurrentAuthUser, getSiteSettings } from "@/lib/data";

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
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary">
      <Header
        settings={settings}
        session={session}
      />

      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8 space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-accent text-bg-primary flex items-center justify-center font-bold text-base shadow-sm">
              NK
            </div>
            <h1
              className="text-3xl sm:text-4xl font-normal text-text-primary tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Wholesale Portal Sign In
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary">
              Access direct Mathura manufacturer rates, live stock, and order tracking.
            </p>
          </div>

          <div className="card-pearl bg-surface-card p-6 sm:p-8 shadow-lg border border-divider">
            <LoginForm />
          </div>

          <p className="text-center text-caption text-text-secondary mt-6">
            Direct wholesale manufacturer supply &bull; Chowk Bazar, Mathura (281001)
          </p>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
