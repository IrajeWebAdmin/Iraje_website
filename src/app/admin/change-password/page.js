import ChangePasswordForm from "@/components/Auth/ChangePasswordForm";
import { requireAdmin } from "@/lib/dal";

export default async function AdminChangePasswordPage() {
  const user = await requireAdmin({ allowPasswordChange: true });

  return (
    <main className="flex min-h-screen items-center px-4 py-16">
      <ChangePasswordForm firstTime={user.mustChangePassword} />
    </main>
  );
}