// Standards & regulations shown in the home page "Trust & Compliance" grid.
//
// `subtitle` follows the same convention as the PAM and EPM compliance
// sections (pam.js / epm.js → compliance.standards): a short noun phrase naming
// the domain the standard governs, NOT a status. Reuse the exact wording used
// there for a standard that already appears on those pages, so the same badge
// never reads two different ways across the site.
//
// `icon` follows that convention too: it is a key into the ICONS map in the
// rendering component, not a file path, and it uses the same vocabulary as
// PamCompliance / EpmCompliance (check · shield · card · file · health ·
// globe · chart · home · clock). Where a standard already appears on those
// pages it carries the identical key, so SOX is the same glyph everywhere.
const compliance = [
  {
    id: 1,
    title: "SOC 2",
    subtitle: "Trust services",
    icon: "shield", // as on EPM
  },
  {
    id: 2,
    title: "ISO 27001",
    subtitle: "Information security",
    icon: "check", // as on PAM + EPM
  },
  {
    id: 3,
    title: "GDPR",
    subtitle: "Data privacy",
    icon: "globe", // as on PAM + EPM
  },
  {
    id: 4,
    title: "HIPAA",
    subtitle: "Healthcare data",
    icon: "health", // as on PAM + EPM
  },
  {
    id: 5,
    title: "PCI-DSS",
    subtitle: "Payment card data",
    icon: "card", // as on PAM + EPM
  },
  {
    id: 6,
    title: "DPDP Act",
    subtitle: "India 2023",
    icon: "check", // as on PAM
  },
  {
    id: 7,
    title: "NIST CSF",
    subtitle: "Cybersecurity",
    icon: "chart", // as on EPM
  },
  // The three below are listed as Indian/industry regulators on the product
  // pages, where that block renders without icons — so there is no existing
  // glyph to inherit. Keys picked from the same vocabulary.

  {
    id: 8,
    title: "IRDAI",
    subtitle: "Insurance",
    icon: "shield",
  },
  {
    id: 9,
    title: "SWIFT CSCF",
    subtitle: "Financial messaging",
    icon: "globe",
  },
  {
    id: 10,
    title: "SOX",
    subtitle: "Financial controls",
    icon: "file", // as on PAM + EPM
  },
    {
    id: 11,
    title: "SEBI CSCRF",
    subtitle: "Securities",
    icon: "chart",
  },
  {
    id: 12,
    title: "BASEL III",
    subtitle: "Banking risk",
    icon: "home", // as on PAM
  },

  // Additional Sample Data — the grid is lg:grid-cols-6, so add in multiples of
  // six to keep the last row full.
  // {
  //   id: 13,
  //   title: "ISO 27701",
  //   subtitle: "Privacy management",
  //   icon: "check",
  // },
  // {
  //   id: 14,
  //   title: "CCPA",
  //   subtitle: "California privacy",
  //   icon: "globe",
  // },
  // {
  //   id: 15,
  //   title: "CIS Controls",
  //   subtitle: "Security benchmarks",
  //   icon: "shield",
  // },
  // {
  //   id: 16,
  //   title: "FedRAMP",
  //   subtitle: "US federal cloud",
  //   icon: "shield",
  // },
  // {
  //   id: 17,
  //   title: "COBIT",
  //   subtitle: "IT governance",
  //   icon: "file",
  // },
  // {
  //   id: 18,
  //   title: "CSA CCM",
  //   subtitle: "Cloud controls",
  //   icon: "check",
  // },
  // {
  //   id: 19,
  //   title: "ISO 22301",
  //   subtitle: "Business continuity",
  //   icon: "clock",
  // },
  // {
  //   id: 20,
  //   title: "TISAX",
  //   subtitle: "Automotive security",
  //   icon: "card",
  // },
];

export default compliance;
