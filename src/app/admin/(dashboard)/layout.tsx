import { requireAdmin } from "@/lib/auth";
import AdminNav from "./AdminNav";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Panel | N.K Ornaments",
  robots: "noindex, nofollow",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side admin verification guard
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <AdminNav userEmail={user.email || "admin"} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-600">
        N.K Ornaments Wholesale &bull; Admin Panel v1.0 &bull; Private &amp; Confidential
      </footer>
    </div>
  );
}
