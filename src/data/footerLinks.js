const footerLinks = {
  platform: [
    {
      name: "PAM",
      href: "/products/pam",
    },
    {
      name: "EPM",
      href: "/products/epm",
    },
    // IAM has no page yet. `disabled` makes the footers render it as plain
    // text — no href, so there is nothing to click or navigate to. Give it an
    // href and drop this flag once /products/iam exists.
    // {
    //   name: "IAM",
    //   disabled: true,
    // },
  ],

  learn: [
    {
      name: "University",
      href: "/university",
    },
    {
      name: "Certification",
      href: "/certification",
    },
    // {
    //   name: "Resources",
    //   href: "/resources",
    // },
  ],

  company: [
    {
      name: "About",
      href: "/about",
    },
    // No partners page yet — rendered as plain, unclickable text.
    // {
    //   name: "Partners",
    //   disabled: true,
    // },
    {
      name: "Contact Us",
      href: "/contact",
    },
  ],
};

export default footerLinks;