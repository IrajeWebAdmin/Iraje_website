// Standards & regulations shown in the home page "Trust & Compliance" grid.
// `subtitle` follows the same convention as the PAM and EPM compliance
// sections (pam.js / epm.js → compliance.standards): a short noun phrase naming
// the domain the standard governs, NOT a status. Reuse the exact wording used
// there for a standard that already appears on those pages, so the same badge
// never reads two different ways across the site.
const compliance = [
  {
    id: 1,
    title: "SOC 2",
    subtitle: "Trust services",
    icon: "/icons/compliance.svg",
  },
  {
    id: 2,
    title: "ISO 27001",
    subtitle: "Information security",
    icon: "/icons/compliance.svg",
  },
  {
    id: 3,
    title: "GDPR",
    subtitle: "Data privacy",
    icon: "/icons/compliance.svg",
  },
  {
    id: 4,
    title: "HIPAA",
    subtitle: "Healthcare data",
    icon: "/icons/compliance.svg",
  },
  {
    id: 5,
    title: "PCI-DSS",
    subtitle: "Payment card data",
    icon: "/icons/compliance.svg",
  },
  {
    id: 6,
    title: "DPDP Act",
    subtitle: "India 2023",
    icon: "/icons/compliance.svg",
  },
  {
    id: 7,
    title: "NIST CSF",
    subtitle: "Cybersecurity",
    icon: "/icons/compliance.svg",
  },
  {
    id: 8,
    title: "SEBI CSCRF",
    subtitle: "Securities",
    icon: "/icons/compliance.svg",
  },
  {
    id: 9,
    title: "IRDAI",
    subtitle: "Insurance",
    icon: "/icons/compliance.svg",
  },
  {
    id: 10,
    title: "SWIFT CSCF",
    subtitle: "Financial messaging",
    icon: "/icons/compliance.svg",
  },
  {
    id: 11,
    title: "SOX",
    subtitle: "Financial controls",
    icon: "/icons/compliance.svg",
  },
  {
    id: 12,
    title: "BASEL III",
    subtitle: "Banking risk",
    icon: "/icons/compliance.svg",
  },

  // Additional Sample Data — the grid is lg:grid-cols-6, so add in multiples of
  // six to keep the last row full.
  // {
  //   id: 13,
  //   title: "ISO 27701",
  //   subtitle: "Privacy management",
  //   icon: "/icons/compliance.svg",
  // },
  // {
  //   id: 14,
  //   title: "CCPA",
  //   subtitle: "California privacy",
  //   icon: "/icons/compliance.svg",
  // },
  // {
  //   id: 15,
  //   title: "CIS Controls",
  //   subtitle: "Security benchmarks",
  //   icon: "/icons/compliance.svg",
  // },
  // {
  //   id: 16,
  //   title: "FedRAMP",
  //   subtitle: "US federal cloud",
  //   icon: "/icons/compliance.svg",
  // },
  // {
  //   id: 17,
  //   title: "COBIT",
  //   subtitle: "IT governance",
  //   icon: "/icons/compliance.svg",
  // },
  // {
  //   id: 18,
  //   title: "CSA CCM",
  //   subtitle: "Cloud controls",
  //   icon: "/icons/compliance.svg",
  // },
  // {
  //   id: 19,
  //   title: "ISO 22301",
  //   subtitle: "Business continuity",
  //   icon: "/icons/compliance.svg",
  // },
  // {
  //   id: 20,
  //   title: "TISAX",
  //   subtitle: "Automotive security",
  //   icon: "/icons/compliance.svg",
  // },
];

export default compliance;
