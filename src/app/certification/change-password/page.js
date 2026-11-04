import ChangePasswordForm from "@/components/Auth/ChangePasswordForm";
import { requireStudent } from "@/lib/dal";

export const metadata = {
  title: "Change password | Iraje University",
  robots: { index: false, follow: false },
};

// The card sits alone on the panel ground, clear of the fixed navbar (the
// sign-in page uses the same top padding).
export default async function CertificationChangePasswordPage() {
  const user = await requireStudent({ allowPasswordChange: true });

  return (
    <section className="bg-catskill flex min-h-screen items-center justify-center px-4 pt-32 pb-20">
      <ChangePasswordForm firstTime={user.mustChangePassword} />
    </section>
  );
}
