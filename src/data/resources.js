
const resources = [
  {
    id: 1,
    title: "Iraje University",
    description:
      "Free training and official certification tracks for PAM, EPM and CyberTantra — for customers and partners alike.",
    buttonText: "Explore University",
    image: "/images/home/home-iraje-university.webp",
    link: "/university",
  },

  {
    id: 2,
    title: "Partner Program",
    description:
      "Register deals, protect your pipeline and track your sales funnel in the Iraje Partner Portal.",
    buttonText: "Explore Partner Program",
    image: "/images/home/home-patner-program.webp",
    // No partners page yet — the card renders its inert state instead of a
    // link. Restore `link: "/partners"` and drop this flag once it exists.
    comingSoon: true,
  },

  {
    id: 3,
    title: "Events",
    description:
      "Join webinars, workshops and training sessions to stay updated on security trends.",
    buttonText: "Explore More",
    image: "/images/home/home-events.webp",
    // No events page yet — the card renders its inert state instead of a link.
    // Restore `link: "/events"` and drop this flag once the page exists.
    comingSoon: true,
  },

  {
    id: 4,
    title: "Certification",
    description:
      "Free training and official certification tracks for PAM, EPM and CyberTantra.",
    buttonText: "Explore Certification",
    image: "/images/home/home-certification.webp",
    link: "/certification",
  },
];

export default resources;