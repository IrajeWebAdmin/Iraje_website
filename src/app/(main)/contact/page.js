import ContactForm from "@/components/Contact/ContactForm";

export const metadata = {
  title: "Contact Iraje | Talk to our team",
  description:
    "Get in touch with Iraje. Share your details and our team will reach out about privileged access, endpoint and identity security.",
};

export default function ContactPage() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Decorative right panel — mirrors the About hero treatment */}
      <div className="pointer-events-none absolute top-0 right-0 hidden h-full w-[42%] rounded-bl-[3rem] bg-[#EEF4FF] lg:block" />

      <div className="container-global relative pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left: intro copy */}
          <div className="max-w-xl">
            <p className="epm-eyebrow epm-eyebrow-normal text-brand">
              Contact us
            </p>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] text-ink md:text-5xl">
              Let’s talk about your{" "}
              <span className="text-brand italic">security</span>.
            </h1>
            <p className="mt-6 text-base leading-relaxed text-slate-soft md:text-lg">
              Tell us a little about your requirement and our team will get back
              to you — whether it’s privileged access, endpoint or identity
              security.
            </p>
          </div>

          {/* Right: form card */}
          <div className="rounded-[2rem] border border-mist bg-white p-6 shadow-sm md:p-8">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
