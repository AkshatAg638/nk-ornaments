import { getAnklets, getCategories } from "@/lib/data";
import StockClient from "./StockClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Quick Stock Management | N.K Ornaments Admin",
};

export default async function AdminStockPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const [anklets, categories] = await Promise.all([
    getAnklets({ activeOnly: false }),
    getCategories(),
  ]);

  return (
    <StockClient
      initialAnklets={anklets}
      categories={categories}
      initialFilter={status || "all"}
    />
  );
}
