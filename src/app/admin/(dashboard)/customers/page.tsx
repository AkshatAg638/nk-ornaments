import { getCustomers } from "@/lib/data";
import CustomersClient from "./CustomersClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Wholesale Customers | N.K Ornaments Admin",
};

export default async function AdminCustomersPage() {
  const customers = await getCustomers();
  return <CustomersClient initialCustomers={customers} />;
}
