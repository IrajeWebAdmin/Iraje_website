import Link from "next/link";
import { FiAlertCircle, FiArrowLeft } from "react-icons/fi";
import AuthCard from "@/components/Auth/AuthCard";
import ResetPasswordForm from "@/components/Auth/ResetPasswordForm";
import { resetPassword } from "@/app/actions/auth";
import { RESET_LINK_MINUTES, userForResetToken } from "@/lib/passwordReset";
import { AREAS } from "@/lib/dal";

export const metadata = {
  title: "Reset password | Iraje Admin",
};

// /admin/reset-password?token=… — the page an admin's emailed link opens (the
// admin twin of /certification/reset-password). The token is checked here
// before anything is shown, and again by the Server Action when the form is
// sent. A learner's link is refused here, and an admin's on the learner page.
export default async function AdminResetPasswordPage({ searchParams }) {
  const sp = await searchParams;
  const token = typeof sp.token === "string" ? sp.token : "";
  const user = token ? await userForResetToken(token, { role: "admin" }) : null;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      {user ? (
        <ResetPasswordForm
          action={resetPassword.bind(null, "admin", token)}
          email={user.email}
          forgotHref={AREAS.admin.forgotPassword}
        />
      ) : (
        <AuthCard
          icon={FiAlertCircle}
          tone="bg-red-50 text-red-600"
          title="This link has"
          accent="expired"
          intro={`Reset links work for ${RESET_LINK_MINUTES} minutes and only once. Request a new one and we will email it straight away.`}
        >
          <Link
            href={AREAS.admin.forgotPassword}
            className="bg-brand hover:bg-navy mt-6 inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-semibold text-white transition"
          >
            Request a new link
          </Link>
          <Link
            href={AREAS.admin.login}
            className="text-shuttle hover:text-brand mt-5 inline-flex items-center gap-1.5 text-xs font-medium transition"
          >
            <FiArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to sign in
          </Link>
        </AuthCard>
      )}
    </main>
  );
}
