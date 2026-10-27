import { getAnkletById, getCategories } from "@/lib/data";
import { notFound } from "next/navigation";
import AnkletForm from "../../AnkletForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Anklet | N.K Ornaments Admin",
};

export default async function EditAnkletPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [anklet, categories] = await Promise.all([
    getAnkletById(id),
    getCategories(),
  ]);

  if (!anklet) notFound();

  return <AnkletForm categories={categories} initialData={anklet} />;
}
