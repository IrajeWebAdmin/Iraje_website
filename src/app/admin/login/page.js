import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/Auth/AdminLoginForm";
import { login } from "@/app/actions/auth";
import { getCurrentUser, AREAS } from "@/lib/dal";

export const metadata = {
  title: "Sign in | Iraje Admin",
};

export default async function AdminLoginPage() {
  // Already signed in as an admin? Skip the form.
  const user = await getCurrentUser();
  if (user?.role === "admin") {
    redirect(
      user.mustChangePassword ? AREAS.admin.changePassword : AREAS.admin.home,
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <AdminLoginForm action={login.bind(null, "admin")} />
    </main>
  );
}
