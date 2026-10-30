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
        <h1 className="text-2xl sm:text-3xl font-serif text-text-primary tracking-tight">
          Change Admin Password
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Update the master password for your administrator account.
        </p>
      </div>

      <div className="card-pearl bg-surface-card border border-divider rounded-2xl p-6 sm:p-8 shadow-xl">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
