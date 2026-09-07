// ===========================================================================
// IAM product page content — transcribed from the Figma "Website" IAM screen
// (node 1595:4622). Edit copy here, not inline in JSX (per project convention).
// ===========================================================================

const iam = {
  // ---- Navbar -----------------------------------------------------------
  // Same set as PAM/EPM so the product pages share one nav shape.
  nav: {
    links: [
      { name: "Home", href: "/" },
      { name: "Products", href: "/products" },
      { name: "University", href: "/university" },
      { name: "Certification", href: "/certification" },
      { name: "About", href: "/about" },
    ],
    cta: { label: "Get in touch", href: "/contact" },
  },

  // ---- Hero -------------------------------------------------------------
  hero: {
    eyebrow: "Identity & Access Management",
    // Split so the accent clause can carry the gold highlight from the design.
    titleLead: "One identity. Every system. ",
    titleAccent: "Full accountability.",
    subtitle:
      "Iraje IAM decides who gets access to what, for how long, and on whose approval — then proves it. Joiners are productive on day one, movers lose what they no longer need, and leavers are cut off across every connected system the moment HR marks them exited.",
    ctas: [
      { label: "Book a Demo", href: "/contact", primary: true },
      { label: "Download the Datasheet", href: "/contact", primary: false },
    ],
    // Signature diagram: one governed identity fanning out to every managed
    // system. Exported from Figma as a single SVG rather than redrawn.
    diagram: {
      src: "/icons/iam/iam-identity-diagram.svg",
      alt: "A single governed identity resolving to entitlements across cloud consoles, SaaS applications, databases, network devices and legacy or core applications.",
    },
  },

  // ---- Fact strip (overlaps the hero) ------------------------------------
  strip: [
    {
      name: "Deploys",
      label: "On-prem, private cloud or hybrid",
      icon: "/icons/iam/iam-deploys.svg",
    },
    {
      name: "Converges with",
      label: "Iraje PAM and EPM",
      icon: "/icons/iam/iam-converges.svg",
    },
    {
      name: "Evidence for",
      label: "DPDP, RBI, SEBI, IRDAI, ISO 27001",
      icon: "/icons/iam/iam-evidence.svg",
    },
  ],

  // ---- The problem -------------------------------------------------------
  problem: {
    eyebrow: "The problem",
    heading: "Access is easy to grant and almost never taken back",
    body: "Most breaches don’t start with a broken firewall. They start with a valid login that should have been switched off months ago — a contractor who finished, a developer who changed teams, a shared service account nobody owns. Identity is now the control plane, and spreadsheets can’t govern it.",
    cards: [
      {
        title: "Day 1",
        body: "New joiners should have exactly the access their role needs before they open a laptop — not a week of raised tickets and borrowed credentials.",
      },
      {
        title: "Role change",
        body: "Internal moves are where entitlements pile up. Old access is rarely revoked, so privilege quietly accumulates across every year of service.",
      },
      {
        title: "Exit",
        body: "An orphaned account is a live credential with no owner and no one watching it. Auditors look for these first — and so do attackers.",
      },
    ],
  },

  // ---- Identity lifecycle ------------------------------------------------
  lifecycle: {
    eyebrow: "Identity lifecycle",
    heading: "Joiner, mover, leaver — driven by HR, not by tickets",
    body: "Iraje IAM treats your HR system as the source of truth. A record changes there, and entitlements across every connected system change with it. No manual provisioning queue, no forgotten revocation.",
    stages: [
      {
        tag: "JOIN",
        title: "Joiner",
        when: "Before day one",
        body: "Birthright access is derived from the role, department and location on the HR record, then provisioned automatically.",
        points: [
          "Role-based access templates",
          "Automated account creation via SCIM / LDAP",
          "Manager notified with the full grant list",
        ],
      },
      {
        tag: "MOVE",
        title: "Mover",
        when: "On role change",
        body: "The new role’s entitlements are added and the old role’s are removed in the same transaction, so privilege never quietly accumulates.",
        points: [
          "Delta calculated against the new role",
          "Segregation-of-duties conflicts flagged",
          "Time-boxed handover access, auto-expiring",
        ],
      },
      {
        tag: "LEAVE",
        title: "Leaver",
        when: "Within minutes of exit",
        body: "Disable first, delete later. Sessions are terminated, tokens revoked and accounts suspended across every connected system, with data retained for audit.",
        points: [
          "Active sessions killed, refresh tokens revoked",
          "Owned service accounts reassigned, not orphaned",
          "Signed revocation record kept for evidence",
        ],
      },
    ],
    // Brand-blue callout bar closing the section.
    callout: {
      lead: "The gap Iraje closes:",
      body: " in most organisations, joiner automation gets built first and leaver automation never gets finished. Iraje IAM ships both on the same policy engine, and reports on the difference between what HR says and what your systems actually allow.",
      cta: { label: "See a lifecycle walkthrough", href: "/contact" },
    },
  },

  // ---- Capabilities ------------------------------------------------------
  // Listed in reading order (row-major). The Figma grid is laid out in three
  // columns and each column shares one icon, which is why the icons cycle.
  capabilities: {
    eyebrow: "Capabilities",
    heading: "What’s in the platform",
    body: "Everything you need to run identity as a control, delivered as one product rather than four integrations you maintain yourself.",
    items: [
      {
        title: "Single sign-on",
        body: "SAML 2.0, OAuth 2.0 and OpenID Connect federation, so one authenticated session carries across web, cloud and internal applications.",
        icon: "/icons/iam/iam-cap-identity.svg",
      },
      {
        title: "Adaptive MFA",
        body: "Step-up authentication that reacts to device, location, network and time — strong where risk is high, invisible where it isn’t.",
        icon: "/icons/iam/iam-cap-access.svg",
      },
      {
        title: "Lifecycle automation",
        body: "HR-driven joiner, mover and leaver workflows with automated provisioning and de-provisioning across connected systems.",
        icon: "/icons/iam/iam-cap-governance.svg",
      },
      {
        title: "Role & attribute policy",
        body: "RBAC for the stable 80% of access, ABAC for the rest — evaluated against live attributes rather than a static group membership.",
        icon: "/icons/iam/iam-cap-identity.svg",
      },
      {
        title: "Access request & approval",
        body: "A self-service catalogue with multi-level approval chains, business justification capture and automatic expiry on temporary grants.",
        icon: "/icons/iam/iam-cap-access.svg",
      },
      {
        title: "Access certification",
        body: "Scheduled recertification campaigns that put entitlement lists in front of the right manager and revoke whatever isn’t confirmed.",
        icon: "/icons/iam/iam-cap-governance.svg",
      },
      {
        title: "Segregation of duties",
        body: "Conflict rules that block toxic entitlement combinations at request time, instead of surfacing them in an audit finding later.",
        icon: "/icons/iam/iam-cap-identity.svg",
      },
      {
        title: "Just-in-time access",
        body: "Elevated entitlements granted for a defined window and withdrawn automatically, so standing privilege stops being the default.",
        icon: "/icons/iam/iam-cap-access.svg",
      },
      {
        title: "Audit & reporting",
        body: "Immutable records of every grant, approval, denial and revocation, exportable as regulator-ready evidence packs.",
        icon: "/icons/iam/iam-cap-governance.svg",
      },
    ],
  },

  // ---- Authentication ----------------------------------------------------
  authentication: {
    eyebrow: "Authentication",
    heading: "Verify the person, not just the password",
    body: "Iraje evaluates each sign-in against context before it decides how much proof to ask for. A finance controller opening the ERP from the office at 10am is not the same event as the same account authenticating from an unmanaged device at 3am.",
    points: [
      "TOTP, push approval, hardware token and biometric factors",
      "Device posture and managed-endpoint checks before session start",
      "Impossible-travel and unfamiliar-network detection",
      "Self-service password reset with verified recovery paths",
      "Session timeouts and re-authentication on sensitive actions",
    ],
    panel: {
      eyebrow: "How a sign-in is decided",
      steps: [
        {
          title: "Identify",
          body: "The account is resolved against the directory and its current HR status is checked. Suspended records never reach a password prompt.",
        },
        {
          title: "Score the context",
          body: "Device, network, geography, time of day and recent behaviour are evaluated against the user’s baseline.",
        },
        {
          title: "Choose the challenge",
          body: "Low risk clears with SSO. Elevated risk triggers step-up MFA. High risk is blocked and raised to the security team.",
        },
        {
          title: "Authorise the entitlement",
          body: "Policy decides what this session may actually reach — not simply whether the login succeeded.",
        },
        {
          title: "Record it",
          body: "The decision, its inputs and its outcome are written to the audit trail, ready for the next review.",
        },
      ],
    },
  },

  // ---- Governance --------------------------------------------------------
  governance: {
    eyebrow: "Governance",
    heading: "Recertification that managers actually complete",
    body: "Certification campaigns fail when reviewers are handed a thousand rows of raw entitlements. Iraje presents access in business language, pre-flags what looks wrong, and turns a manager’s decision into an executed revocation rather than a spreadsheet comment.",
    points: [
      "Quarterly, annual or event-triggered campaigns",
      "Outliers highlighted — access nobody else in the role holds",
      "Dormant entitlements surfaced from real usage data",
      "Revoke decisions executed automatically, with rollback",
      "Sign-off certificates produced for the audit file",
    ],
    panel: {
      eyebrow: "Reports your auditor asks for",
      rows: [
        "Orphaned and ownerless accounts",
        "Dormant accounts by days inactive",
        "Entitlements granted outside the approval workflow",
        "Segregation-of-duties conflicts, open and resolved",
        "Privileged entitlement holders by system",
        "Certification completion by business unit",
      ],
    },
  },

  // ---- One platform (IAM + PAM + EPM on one policy engine) ---------------
  // Three product cards. Each keeps its own ground from the design: IAM is
  // washed blue because it is the page you are on, PAM near-transparent grey,
  // EPM off-white — all sharing the 4.6px brand rule along the top edge.
  platform: {
    eyebrow: "One platform",
    heading: "IAM, PAM and EPM on a single policy engine",
    body: "Identity governance stops at the standard user in most stacks — administrators and endpoints get bolted on separately. Iraje runs all three from the same directory, the same policy model and the same audit trail, so a leaver loses their application access, their privileged sessions and their local elevation rights in one action.",
    cards: [
      {
        name: "IAM",
        label: "You are here",
        body: "Governs standard workforce identity — lifecycle, SSO, entitlements, certification and access requests.",
        icon: "/icons/iam/iam-platform-iam.svg",
        href: "/products/iam",
        cta: "Explore IAM",
        ground: "bg-[#F4F8FF]",
      },
      {
        name: "PAM",
        label: "Privileged access",
        body: "Vaults credentials, brokers privileged sessions, records and watermarks activity, and enforces command-level control on servers, databases and network devices.",
        icon: "/icons/iam/iam-platform-pam.svg",
        href: "/products/pam",
        cta: "Explore PAM",
        ground: "bg-[#D9D9D9]/13",
      },
      {
        name: "EPM",
        label: "Endpoint privilege",
        body: "Removes local admin rights, elevates approved applications just in time, and audits what runs on every managed endpoint.",
        icon: "/icons/iam/iam-platform-epm.svg",
        href: "/products/epm",
        cta: "Explore EPM",
        ground: "bg-[#F8F8F8]",
      },
    ],
  },

  // ---- Integrations ------------------------------------------------------
  // Listed in the design's reading order (left to right, then down).
  integrations: {
    eyebrow: "Integrations",
    heading: "Connects to what you already run",
    body: "Iraje IAM federates with your existing directory rather than replacing it, and provisions outward through open standards. Where an application has no modern connector, connectors can be built against its API or database — including the older core systems that usually get left out of governance.",
    chips: [
      "Active Directory",
      "Azure AD / Entra ID",
      "LDAP directories",
      "SAML 2.0",
      "OAuth 2.0 / OIDC",
      "SCIM 2.0",
      "RADIUS",
      "Kerberos",
      "HR systems",
      "ITSM & ticketing",
      "SIEM & log forwarding",
      "REST API",
    ],
  },

  // ---- Compliance --------------------------------------------------------
  compliance: {
    eyebrow: "Compliance",
    heading: "Evidence, not assurances",
    body: "Indian and global frameworks all ask variations of the same three questions: who had access, who approved it, and when was it last reviewed. Iraje IAM answers them from the audit trail rather than from a reconstructed spreadsheet.",
    columns: ["Framework", "What it expects", "How Iraje IAM supports it"],
    rows: [
      {
        framework: "DPDP Act, 2023",
        expects:
          "Access to personal data limited to what the purpose requires, with accountability for processing.",
        supports:
          "Purpose-bound entitlements, approval records against every grant, and revocation logs on exit.",
      },
      {
        framework: "RBI cyber-security framework",
        expects:
          "Role-based access, periodic review of user rights, and strong authentication for critical systems.",
        supports:
          "RBAC policy model, scheduled certification campaigns, adaptive MFA on sensitive applications.",
      },
      {
        framework: "SEBI CSCRF",
        expects:
          "Least privilege, segregation of duties, and auditable trails of access changes.",
        supports:
          "SoD conflict rules at request time, immutable change history, exportable review evidence.",
      },
      {
        framework: "IRDAI guidelines",
        expects:
          "Controlled onboarding and offboarding of users with documented authorisation.",
        supports:
          "HR-triggered joiner and leaver automation with signed approval and revocation records.",
      },
      {
        framework: "ISO/IEC 27001:2022",
        expects:
          "Annex A controls on identity, authentication information and access rights.",
        supports:
          "Identity register, entitlement catalogue and review cycles mapped to the relevant controls.",
      },
      {
        framework: "SOC 2 & PCI-DSS",
        expects:
          "Logical access controls, unique IDs, and evidence of periodic access review.",
        supports:
          "Per-user identifiers, no shared accounts, and campaign reports ready for the auditor’s sample.",
      },
      {
        framework: "NIST SP 800-53 / Zero Trust",
        expects:
          "Continuous verification and least-privilege enforcement across every access decision.",
        supports:
          "Context-scored authentication, just-in-time entitlements, and policy re-evaluation per session.",
      },
    ],
  },

  // ---- Closing CTA -------------------------------------------------------
  cta: {
    eyebrow: "Next step",
    heading: "Find out what your systems are actually allowing",
    body: "Most conversations start with a review of orphaned and dormant accounts across your environment. It takes about an hour, and it usually surprises people. Bring your last audit finding and we’ll show you how the platform closes it.",
    ctas: [
      { label: "Book a Demo", href: "/contact", primary: true },
      { label: "Get the IAM Datasheet", href: "/contact", primary: false },
    ],
  },
};

export default iam;
