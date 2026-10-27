import { getCategories } from "@/lib/data";
import AnkletForm from "../AnkletForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Add New Anklet | N.K Ornaments Admin",
};

export default async function NewAnkletPage() {
  const categories = await getCategories();
  return <AnkletForm categories={categories} />;
}
