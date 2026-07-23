import ContactCard from "@/components/Contact/ContactCard";

export const metadata = {
  title: "Contact Iraje | Talk to our team",
  description:
    "Get in touch with Iraje. Share your details and our team will reach out about privileged access, endpoint and identity security.",
};

export default function ContactPage() {
  return (
    <section className="bg-[#F7FAFF] pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="container-global">
        <ContactCard />
      </div>
    </section>
  );
}
