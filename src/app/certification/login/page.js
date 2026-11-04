import Image from "next/image";
import { redirect } from "next/navigation";
import LearnerLoginForm from "@/components/Auth/LearnerLoginForm";
import { login } from "@/app/actions/auth";
import { getCurrentUser, AREAS } from "@/lib/dal";

export const metadata = {
  title: "Sign in | Iraje University",
  robots: { index: false, follow: false },
};

export default async function CertificationLoginPage() {
  const user = await getCurrentUser();
  if (user?.role === "student") {
    redirect(user.mustChangePassword ? AREAS.student.changePassword : AREAS.student.home);
  }

  return (
    <section className="bg-white">
      <div className="container-global pt-32 pb-20 md:pt-36 md:pb-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Copy + form */}
          <div>
            <p className="text-sm text-brand">Iraje University &amp; Certification Program</p>
            <span className="mt-1.5 block h-px w-6 bg-brand" />
            <h1 className="mt-5 font-display text-4xl leading-[1.15] font-semibold tracking-tight text-black md:text-[46px]">
              Welcome back.
              <br />
              <span className="font-normal italic">
                <span className="text-brand">Sign in</span> to continue.
              </span>
            </h1>
            <p className="mt-6 max-w-100 text-sm leading-relaxed text-shuttle">
              Use the login sent to you after your registration was approved to access your
              courses, exams and certificates.
            </p>

            <LearnerLoginForm action={login.bind(null, "student")} />
          </div>

          {/* Illustration: a laptop sign-in form behind a shield and padlock.
              Shown at its natural width so it stays sharp. */}
          <div className="hidden lg:flex lg:justify-center">
            <Image
              src="/images/university/login-secure-signin.webp"
              alt="A laptop showing a sign-in form, protected by a shield and padlock"
              width={464}
              height={380}
              className="h-auto w-full max-w-116 rounded-[28px]"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
