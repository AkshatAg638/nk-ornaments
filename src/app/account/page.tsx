import { Metadata } from "next";
import { redirect } from "next/navigation";
import AccountClient from "./AccountClient";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import {
  getCurrentAuthUser,
  getCategories,
  getSiteSettings,
  getOrders,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wholesale Account & Orders | N.K. Ornaments",
  description:
    "View your wholesale trade orders, factory dispatch status, and billing details.",
};

export default async function AccountPage() {
  const [session, settings] = await Promise.all([
    getCurrentAuthUser(),
    getSiteSettings(),
  ]);

  if (session.role === "visitor") {
    redirect("/login?redirect=/account");
  }

  // Get orders for customer (or all orders if admin preview)
  const orders = await getOrders({
    customerId: session.role === "customer" && session.customerProfile?.id
      ? session.customerProfile.id
      : undefined,
  });

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary">
      <Header
        settings={settings}
        session={session}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <AccountClient
          session={session}
          orders={orders}
          whatsappNumber={settings.contact_whatsapp || "+919837012345"}
        />
      </main>

      <Footer settings={settings} />
    </div>
  );
}
