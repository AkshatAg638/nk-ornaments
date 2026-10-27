import { requireAdmin } from "@/lib/auth";
import ChangePasswordForm from "./ChangePasswordForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Change Admin Password | N.K Ornaments",
  robots: "noindex, nofollow",
};

export default async function ChangePasswordPage() {
  await requireAdmin("/admin/change-password");

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Change Admin Password
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Update the master password for your administrator account.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
