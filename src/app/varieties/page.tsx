import { getCategories, getAnklets, getSiteSettings, getCurrentAuthUser } from "@/lib/data";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import VarietiesClient from "./VarietiesClient";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Anklet Varieties & Wholesale Catalog | N.K. Ornaments Mathura",
  description:
    "Explore our complete range of German Silver payal, bridal anklets, antique oxidised designs, and daily wear anklets with direct factory trade rates.",
};

export default async function VarietiesPage() {
  const [categories, anklets, settings, session] = await Promise.all([
    getCategories(),
    getAnklets({ activeOnly: true }),
    getSiteSettings(),
    getCurrentAuthUser(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary">
      <Header settings={settings} session={session} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <Suspense fallback={<div className="text-center py-16 text-text-secondary text-sm">Loading wholesale collection...</div>}>
          <VarietiesClient
            categories={categories}
            anklets={anklets}
            session={session}
            settings={settings}
          />
        </Suspense>
      </main>
      <Footer settings={settings} />
    </div>
  );
}
