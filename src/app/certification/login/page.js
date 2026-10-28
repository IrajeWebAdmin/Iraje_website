import Image from "next/image";
import { redirect } from "next/navigation";
import { FiAward } from "react-icons/fi";
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

          {/* Photo + badge */}
          <div className="relative hidden lg:block">
            <Image
              src="/images/home/home-certification.webp"
              alt="Security professionals reviewing certification training on screen"
              width={432}
              height={287}
              className="h-auto w-full rounded-[28px] object-cover"
              priority
            />
            <div className="absolute bottom-5 left-5 flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-lg">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8EFFF] text-brand">
                <FiAward className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">
                  Six certifications, three tracks
                </span>
                <span className="block text-xs text-shuttle">PAM · EPM · CyberTantra</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
