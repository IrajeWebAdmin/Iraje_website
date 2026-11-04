import ForgotPasswordForm from "@/components/Auth/ForgotPasswordForm";
import { RESET_LINK_MINUTES } from "@/lib/passwordReset";

export const metadata = {
  title: "Forgot password | Iraje University",
  robots: { index: false, follow: false },
};

// /certification/forgot-password — public: anyone can ask for a reset link;
// the Server Action decides quietly whether an email goes out.
export default function ForgotPasswordPage() {
  return (
    <section className="bg-catskill flex min-h-screen items-center justify-center px-4 pt-32 pb-20">
      <ForgotPasswordForm minutes={RESET_LINK_MINUTES} />
    </section>
  );
}
