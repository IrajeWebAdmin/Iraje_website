const products = [
  {
    id: 1,
    shortName: "Iraje PAM",
    title: "Privileged Access Manager",
    description:
      "Agentless control over every privileged session —SSO, vaulting, discovery and a hardened Zero Trust OS.",
    icon: "/icons/pam-icon.svg",
    link: "/products/pam",
  },
  {
    id: 2,
    shortName: "Iraje EPM",
    title: "Endpoint Privilege Manager",
    description:
      "Remove standing local admin rights and enforce least privilege on every endpoint without breaking productivity.",
    icon: "/icons/epm-icon.svg",
    link: "/products/epm",
  },
  {
    id: 3,
    shortName: "Iraje IAM",
    title: "Identity & Access Manager",
    description:
      "Full lifecycle identity governance — provisioning, access reviews and certification across your enterprise.",
    icon: "/icons/iam-con.svg",
    // No IAM page yet — the card renders its inert state instead of a link.
    // Restore `link: "/products/iam"` and drop this flag once the page exists.
    comingSoon: true,
  },
];

export default products;