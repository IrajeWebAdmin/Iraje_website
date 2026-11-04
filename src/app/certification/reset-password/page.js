import Link from "next/link";
import { FiAlertCircle, FiArrowLeft } from "react-icons/fi";
import AuthCard from "@/components/Auth/AuthCard";
import ResetPasswordForm from "@/components/Auth/ResetPasswordForm";
import { resetPassword } from "@/app/actions/auth";
import { RESET_LINK_MINUTES, userForResetToken } from "@/lib/passwordReset";

export const metadata = {
  title: "Reset password | Iraje University",
  robots: { index: false, follow: false },
};

// /certification/reset-password?token=… — the page the emailed link opens.
// The token is checked here before anything is shown, and again by the
// Server Action when the form is sent.
export default async function ResetPasswordPage({ searchParams }) {
  const sp = await searchParams;
  const token = typeof sp.token === "string" ? sp.token : "";
  const user = token ? await userForResetToken(token) : null;

  return (
    <section className="bg-catskill flex min-h-screen items-center justify-center px-4 pt-32 pb-20">
      {user ? (
        <ResetPasswordForm
          action={resetPassword.bind(null, token)}
          email={user.email}
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
            href="/certification/forgot-password"
            className="bg-brand hover:bg-navy mt-6 inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-semibold text-white transition"
          >
            Request a new link
          </Link>
          <Link
            href="/certification/login"
            className="text-shuttle hover:text-brand mt-5 inline-flex items-center gap-1.5 text-xs font-medium transition"
          >
            <FiArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to sign in
          </Link>
        </AuthCard>
      )}
    </section>
  );
}
