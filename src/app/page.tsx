import { getCategories, getAnklets, getSiteSettings, getCurrentAuthUser } from "@/lib/data";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, anklets, settings, session] = await Promise.all([
    getCategories(),
    getAnklets({ activeOnly: true }),
    getSiteSettings(),
    getCurrentAuthUser(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header settings={settings} session={session} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
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
