import { getOrders } from "@/lib/data";
import OrdersClient from "./OrdersClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Wholesale Orders | N.K Ornaments Admin",
};

export default async function AdminOrdersPage() {
  const orders = await getOrders();
  return <OrdersClient initialOrders={orders} />;
}
