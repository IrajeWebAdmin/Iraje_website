import { redirect } from "next/navigation";
import LoginForm from "@/components/Auth/LoginForm";
import { login } from "@/app/actions/auth";
import { getCurrentUser, AREAS } from "@/lib/dal";

export default async function AdminLoginPage() {
  // Already signed in as an admin? Skip the form.
  const user = await getCurrentUser();
  if (user?.role === "admin") {
    redirect(user.mustChangePassword ? AREAS.admin.changePassword : AREAS.admin.home);
  }

  return (
    <main className="flex min-h-screen items-center px-4 py-16">
      <LoginForm
        action={login.bind(null, "admin")}
        title="Iraje Admin"
        subtitle="Sign in to review certification requests."
      />
    </main>
  );
}