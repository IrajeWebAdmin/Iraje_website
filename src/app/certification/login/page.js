import { redirect } from "next/navigation";
import LearnerLoginForm from "@/components/Auth/LearnerLoginForm";
import LoginIllustration from "@/components/Auth/LoginIllustration";
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
    // Layout by screen size:
    // - phones: the form only (the illustration's text would be too small);
    // - tablets (md): the form, with the illustration below it;
    // - laptops and up (lg): as the 1440px design — form column 518, gap 107,
    //   illustration 669 × 759, scaled together with the screen width.
    // The section fills the window and centres the content in it.
    <section className="bg-white">
      {/* Tighter than the site-wide container on desktop: 32px side margins
          (instead of up to 80px) and a wider 1760px cap (instead of 1600px),
          so the form and illustration use more of the screen. */}
      <div className="container-global flex min-h-svh items-center pt-24 pb-10 lg:max-w-440! lg:px-8! lg:pt-20 lg:pb-6">
        {/* Two columns of the same width. Each is at most as wide as the
            illustration can be while fitting under the navbar (--panel-max;
            1177/1336 is its shape), so on wide-but-short screens the form
            never ends up wider than the illustration; the pair is centred. */}
        <div
          className="grid w-full items-center gap-12 lg:grid-cols-[repeat(2,minmax(0,var(--panel-max)))] lg:justify-center lg:gap-x-[clamp(48px,6vw,96px)]"
          style={{ "--panel-max": "calc((100svh - 6.5rem) * 1177 / 1336)" }}
        >
          {/* Copy + form: never wider than 540px (the design's 518 plus a
              little), so the inputs don't look stretched on big screens;
              centred in its column. */}
          <div className="mx-auto w-full max-w-135">
            {/* Eyebrow: the label, then a short fading line under it. */}
            <p className="text-base font-medium text-brand">
              Iraje University &amp; Certification Program
            </p>
            <span className="mt-3 block h-px w-6 bg-linear-to-r from-ink to-ink/0" />
            {/* On desktop the size follows the screen width (60px at the
                design's 1440) so "Sign in to continue." stays on one line,
                as in the design. */}
            <h1 className="mt-6 font-display text-4xl leading-[1.15] font-semibold tracking-tight text-black md:text-5xl lg:text-[min(4.15vw,60px)]">
              Welcome back.
              <br />
              <span className="font-normal italic lg:whitespace-nowrap">
                <span className="text-brand">Sign in</span> to continue.
              </span>
            </h1>
            <p className="mt-8 text-base leading-[1.6] text-shuttle xl:text-lg">
              Use the login sent to you after your registration was approved to access your
              courses, exams and certificates.
            </p>

            <LearnerLoginForm action={login.bind(null, "student")} />
          </div>

          {/* Illustration: "Get certified. Prove your expertise." — a course
              progress card, certificate, exam score and the 3 steps
              (Register · Get approved · Learn & certify). Built in HTML, not a
              picture, so it is sharp at any size. It fills its column. */}
          <LoginIllustration className="mx-auto hidden w-full max-w-140 overflow-hidden rounded-[20px] md:block lg:max-w-none" />
        </div>
      </div>
    </section>
  );
}
