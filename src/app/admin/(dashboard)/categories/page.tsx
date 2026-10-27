import { getCategories, getAnklets } from "@/lib/data";
import CategoriesClient from "./CategoriesClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Categories Management | N.K Ornaments Admin",
};

export default async function AdminCategoriesPage() {
  const [categories, anklets] = await Promise.all([
    getCategories(),
    getAnklets(),
  ]);

  return <CategoriesClient initialCategories={categories} anklets={anklets} />;
}
