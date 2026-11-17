import ForgotPasswordForm from "@/components/Auth/ForgotPasswordForm";
import { requestPasswordReset } from "@/app/actions/auth";
import { RESET_LINK_MINUTES } from "@/lib/passwordReset";

export const metadata = {
  title: "Forgot password | Iraje University",
  robots: { index: false, follow: false },
};

// /certification/forgot-password — public: anyone can ask for a reset link;
// the Server Action decides quietly whether an email goes out. Only learner
// accounts are reset from here (admins use /admin/forgot-password).
export default function ForgotPasswordPage() {
  return (
    <section className="bg-catskill flex min-h-screen items-center justify-center px-4 pt-32 pb-20">
      <ForgotPasswordForm
        action={requestPasswordReset.bind(null, "student")}
        minutes={RESET_LINK_MINUTES}
      />
    </section>
  );
}
