import { getAnklets, getCategories } from "@/lib/data";
import AnkletsClient from "./AnkletsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Anklets Management | N.K Ornaments Admin",
};

export default async function AdminAnkletsPage() {
  const [anklets, categories] = await Promise.all([
    getAnklets({ activeOnly: false }),
    getCategories(),
  ]);

  return <AnkletsClient initialAnklets={anklets} categories={categories} />;
}
