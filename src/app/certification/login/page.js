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
    // Fits in one screen on desktop (no scrollbar): the section is exactly the
    // window's height, the content is centred in it, and the illustration's
    // height is capped to what is left below the navbar.
    <section className="bg-white">
      <div className="container-global flex min-h-svh items-center pt-24 pb-10 lg:pt-20 lg:pb-6">
        {/* The illustration column gets the larger share (1 : 1.25) so the image
            can be wide; the form itself is narrow and doesn't need half. */}
        <div className="grid w-full items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
          {/* Copy + form */}
          <div>
            {/* Same eyebrow as the University page hero: fading line, then the label. */}
            <p className="flex items-center gap-3 text-sm font-medium text-brand">
              <span className="h-px w-8 bg-gradient-to-r from-azure to-azure/0" />
              Iraje University &amp; Certification Program
            </p>
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

          {/* Illustration: "Get certified. Prove your expertise." — a course
              progress card, certificate, exam score and the 3 steps
              (Register · Get approved · Learn & certify). */}
          <div className="hidden lg:flex lg:justify-center">
            <Image
              src="/images/university/login-get-certified.png"
              alt="Iraje University: course progress, a certificate of achievement and a passed final exam. Get certified in three steps: register, get approved, learn and certify."
              width={669}
              height={759}
              // Width and height follow the image's shape; whichever limit is
              // hit first (column width, 669px, or the space under the navbar)
              // decides the size, so it never pushes the page into scrolling.
              className="h-auto max-h-[calc(100svh-6.5rem)] w-auto max-w-full rounded-[20px]"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
