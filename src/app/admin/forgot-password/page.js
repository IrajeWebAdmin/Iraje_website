import ForgotPasswordForm from "@/components/Auth/ForgotPasswordForm";
import { requestPasswordReset } from "@/app/actions/auth";
import { RESET_LINK_MINUTES } from "@/lib/passwordReset";
import { AREAS } from "@/lib/dal";

export const metadata = {
  title: "Forgot password | Iraje Admin",
};

// /admin/forgot-password — the admin twin of /certification/forgot-password.
// Public (src/proxy.js lets it through without a login cookie). Only admin
// accounts get an email from here; the reply is the same either way, so the
// page never reveals which emails are admins.
export default function AdminForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <ForgotPasswordForm
        action={requestPasswordReset.bind(null, "admin")}
        minutes={RESET_LINK_MINUTES}
        loginHref={AREAS.admin.login}
        accountName="admin"
        intro="Enter your Iraje work email and we'll send you a link to set a new password."
      />
    </main>
  );
}
