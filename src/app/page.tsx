import { getCategories, getAnklets, getSiteSettings, getCurrentAuthUser } from "@/lib/data";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "N.K. Ornaments | Wholesale German Silver Payal & Anklet Manufacturer Mathura",
  description:
    "Direct manufacturer of premium German Silver payal and traditional anklets in Mathura. Exact gram weights, factory trade rates, wholesale supply across India.",
};

export default async function HomePage() {
  const [categories, anklets, settings, session] = await Promise.all([
    getCategories(),
    getAnklets({ activeOnly: true }),
    getSiteSettings(),
    getCurrentAuthUser(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary">
      <Header settings={settings} session={session} />
      <main className="flex-1 w-full">
        <HomeClient
          categories={categories}
          anklets={anklets}
          settings={settings}
          session={session}
        />
      </main>
      <Footer settings={settings} />
    </div>
  );
}
