import { getCategories, getAnklets, getSiteSettings, getCurrentAuthUser } from "@/lib/data";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import VarietiesClient from "./VarietiesClient";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Anklet Varieties & Wholesale Catalog | N.K. Ornaments",
  description:
    "Explore our complete range of silver payal, bridal anklets, oxidised designs, and kids anklets with direct manufacturer rates.",
};

export default async function VarietiesPage() {
  const [categories, anklets, settings, session] = await Promise.all([
    getCategories(),
    getAnklets({ activeOnly: true }),
    getSiteSettings(),
    getCurrentAuthUser(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header settings={settings} session={session} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Suspense fallback={<div className="text-center py-12 text-slate-500">Loading catalog...</div>}>
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
