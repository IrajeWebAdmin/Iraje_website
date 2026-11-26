// Contact page content.
const contact = {
  panel: {
    heading: "Always here to help you",
    officesLabel: "Our global offices",
    offices: [
      { flag: "us", label: "Global HQ", text: "CA, USA" },
      { flag: "in", label: "Global Delivery Center", text: "Mumbai, India" },
      { flag: "ae", label: "Global Distribution Center", text: "Dubai, UAE" },
    ],
    info: [
      {
        icon: "email",
        label: "Email",
        text: "contact@iraje.com",
        href: "mailto:contact@iraje.com",
      },
    ],
    followLabel: "Follow us on",
    socials: [
      {
        icon: "linkedin",
        href: "https://www.linkedin.com/company/iraje-software/",
        label: "LinkedIn",
      },
      {
        icon: "youtube",
        href: "https://www.youtube.com/@IrajeSoftware",
        label: "YouTube",
      },
    ],
  },
  form: {
    heading: "Send us a message",
    submitLabel: "Send message",
    // Options for the "Requirement" dropdown. The API only accepts these.
    requirements: [
      "Privileged Access Manager",
      "Endpoint Privilege Manager",
      "Identity & Access Manager",
      "Other",
    ],
  },
};

export default contact;
