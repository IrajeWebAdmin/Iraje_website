import ChangePasswordForm from "@/components/Auth/ChangePasswordForm";
import { requireStudent } from "@/lib/dal";

export const metadata = {
  title: "Change password | Iraje University",
  robots: { index: false, follow: false },
};

export default async function CertificationChangePasswordPage() {
  const user = await requireStudent({ allowPasswordChange: true });

  return (
    <section className="bg-catskill px-4 py-20">
      <ChangePasswordForm firstTime={user.mustChangePassword} />
    </section>
  );
}