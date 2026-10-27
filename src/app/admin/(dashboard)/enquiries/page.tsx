import { getEnquiries } from "@/lib/data";
import EnquiriesClient from "./EnquiriesClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Trade Enquiries | N.K Ornaments Admin",
};

export default async function AdminEnquiriesPage() {
  const enquiries = await getEnquiries();
  return <EnquiriesClient initialEnquiries={enquiries} />;
}
