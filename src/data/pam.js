// ===========================================================================
// PAM product page content — transcribed from the Figma "Website" PAM screen.
// Edit copy here, not inline in JSX (per project convention).
// ===========================================================================

const pam = {
  // ---- Navbar -----------------------------------------------------------
  nav: {
    links: [
      { name: "Home", href: "/" },
      { name: "Products", href: "/products" },
      { name: "University", href: "/university" },
      { name: "Certification", href: "/certification" },
      { name: "Partners", href: "/partners" },
      { name: "Customers", href: "/customers" },
      { name: "About", href: "/about" },
    ],
    cta: { label: "Get in touch", href: "/contact" },
  },

  // ---- Hero -------------------------------------------------------------
  hero: {
    eyebrow: "Privileged Access Management",
    title: "Built for the crown jewels.",
    subtitle:
      "Iraje PAM manages, monitors and controls privileged access across your entire enterprise — turning scattered, ungoverned admin rights into a centralised, monitored and auditable control plane.",
    ctas: [
      { label: "Request a Demo", href: "/contact", primary: true },
      { label: "See How it Works", href: "#how-pam-works", primary: false },
    ],
    card: {
      eyebrow: "Built for the crown jewels",
      pills: [
        "Domain & Root administrators",
        "Database administrators",
        "Cloud & service accounts",
        "Emergency / break-glass accounts",
      ],
    },
  },

  // ---- Introduction: What is PIM / PAM? ---------------------------------
  intro: {
    eyebrow: "Introduction",
    heading: "What is PIM / PAM?",
    body: [
      "Privileged Identity & Access Management is a cybersecurity framework designed to manage, monitor and control privileged accounts and administrative access across your entire enterprise infrastructure.",
      "Privileged users — system administrators, DBAs, cloud operators, network engineers and third-party vendors — hold elevated rights to critical business systems and sensitive data. If those accounts are compromised, they become one of the biggest attack vectors for cyber threats, insider attacks, ransomware and data breaches.",
    ],
    listTitle: "Privileged accounts include",
    accounts: [
      "Domain Administrators",
      "Root accounts",
      "Database administrators",
      "Cloud administrators",
      "Service accounts",
      "Application accounts",
      "Emergency / break-glass accounts",
    ],
    note:
      "These accounts reach critical systems, sensitive data, servers, databases, network devices, cloud workloads and security infrastructure.",
  },

  // ---- The challenge ----------------------------------------------------
  challenge: {
    eyebrow: "The challenge",
    heading: "Why privileged access keeps CISOs awake at night",
    body:
      "Most major cyberattacks involve compromised privileged credentials. Traditional controls simply weren't built for this threat.",
    problems: [
      {
        icon: "/icons/problem.svg",
        tag: "PROBLEM 01",
        title: "The #1 target for attackers",
        body:
          "Once an attacker gains admin access they can disable security controls, steal data, deploy ransomware, move laterally and create backdoors.",
      },
      {
        icon: "/icons/problem.svg",
        tag: "PROBLEM 02",
        title: "Passwords on spreadsheets",
        body:
          "Shared admin passwords, Excel sheets, static credentials and manual rotation create major, unmonitored security gaps.",
      },
      {
        icon: "/icons/problem.svg",
        tag: "PROBLEM 03",
        title: "Insider threats need control",
        body:
          "Not every threat is external. Disgruntled employees, negligent admins, contractors and third-party vendors all carry risk.",
      },
      {
        icon: "/icons/problem.svg",
        tag: "PROBLEM 04",
        title: "Compliance demands it",
        body:
          "RBI, SEBI, IRDAI, CERT-In, PCI-DSS, ISO 27001, HIPAA, SOX, GDPR, NIST and the DPDP Act all require strong privileged access controls.",
      },
    ],
  },

  // ---- The solution -----------------------------------------------------
  solution: {
    eyebrow: "The solution",
    heading: "What a PAM solution delivers",
    body:
      "Iraje PAM turns scattered, ungoverned privileged access into a centralised, monitored and auditable control plane.",
    benefits: [
      {
        title: "Reduced cyber risk",
        body:
          "Cuts credential theft, ransomware spread, unauthorized access and insider abuse.",
      },
      {
        title: "Stops lateral movement",
        body:
          "Limits credential exposure, shared accounts and persistent privileges.",
      },
      {
        title: "Visibility & control",
        body:
          "Centralised view of all privileged accounts, users and active sessions.",
      },
      {
        title: "Secure vendor access",
        body:
          "Time-bound, monitored, approval-gated sessions with instant termination.",
      },
      {
        title: "Audit readiness",
        body:
          "Access logs, session recordings, rotation reports and approval history on tap.",
      },
      {
        title: "Zero Trust enablement",
        body:
          "Never trust, always verify, least privilege and continuous monitoring.",
      },
      {
        title: "Operational efficiency",
        body:
          "Automates password resets, provisioning, approvals and credential rotation.",
      },
      {
        title: "Hybrid & cloud cover",
        body:
          "Secures datacentres, cloud, SaaS, DevOps, Kubernetes and containers alike.",
      },
    ],
  },

  // ---- Six pillars ------------------------------------------------------
  pillars: {
    eyebrow: "Key capabilities",
    heading: "Six pillars of the Iraje Privileged Access Manager",
    body:
      "A complete solution to manage, monitor, control, discover, comply and secure privileged accounts.",
    items: [
      {
        name: "Manage",
        team: "IT OPERATIONS TEAM",
        tags: [
          "AD Authentication",
          "Role Based Access",
          "Secure File Transfer",
          "Privilege Elevation",
          "ITSM Integration",
          "Multi-Cloud",
          "App Integration",
          "DevOps Integration",
          "Secrets Management",
          "Time Based Access",
          "Multi-Factor Auth",
          "Just-In-Time",
        ],
      },
      {
        name: "Monitor",
        team: "SECURITY TEAM",
        tags: [
          "Live Session Viewing",
          "Live CXO Cockpit",
          "Command Search in Videos",
          "PAM Bypass Alerts",
          "Command Logs",
          "SIEM Integration",
          "Text & Video Logs",
          "Live Session Termination",
          "PAM Bypass Block",
        ],
      },
      {
        name: "Control",
        team: "SECURITY TEAM",
        tags: [
          "Windows Restrictions",
          "Database Restrictions",
          "Sensitive Device Alerts",
          "Restricted Command Alerts",
          "Dynamic Risk Score Card",
          "Dynamic Watermarking",
          "Remote Login Alerts",
          "SSH Restrictions",
          "File Transfer Restrictions",
          "Password Alerts",
        ],
      },
      {
        name: "Discover",
        team: "IT OPERATIONS TEAM",
        tags: [
          "Discover Devices — On-Prem & Cloud",
          "Discover Admin Accounts",
          "Discover Ports & Machine IDs",
          "Auto-Discover Users",
          "Auto-Discover Devices",
          "Auto-Onboard Users & Devices",
        ],
      },
      {
        name: "Comply",
        team: "RISK & COMPLIANCE TEAM",
        tags: [
          "On-Demand Reports",
          "Audit & Compliance Reports",
          "Regulatory Compliance",
          "Access Recertification",
          "GRC Reports",
          "Scheduled Reports",
          "Analytical Reports",
          "Trend Reports",
        ],
      },
      {
        name: "Secure",
        team: "MANAGEMENT",
        tags: [
          "Completely Hardened Solution",
          "No PAM OS Access — Even Super Admin",
          "Logs & Recordings Cannot Be Deleted",
          "Hourly PAM OS Credential Rotation",
          "3FA",
          "Security Val Codes",
          "Real Zero Trust Security",
        ],
      },
    ],
  },

  // ---- Solution architecture --------------------------------------------
  architecture: {
    eyebrow: "Solution architecture",
    heading: "Failsafe, Active-Active & completely Zero Trust",
    body:
      "Iraje PAM offers Active-Active and Active-Passive architecture options across DC and DR. A redundant set is deployed for failover, with a BCP module available for full break-glass of the PAM solution itself.",
    servers: [
      {
        num: "01",
        name: "Application Server",
        body:
          "The access layer that brokers every privileged session — with load balancing for high availability.",
      },
      {
        num: "02",
        name: "Vault Server",
        body:
          "Stores credentials encrypted with AES-256. No administrator — not even the super admin — can extract them.",
      },
      {
        num: "03",
        name: "Tools Server (optional)",
        body:
          "Supports discovery, automation and extended capabilities as the deployment scales.",
      },
    ],
    note:
      "Real Zero Trust: the architecture ensures even the super admin has no admin access to the PAM solution and cannot delete its logs or recordings.",
  },

  // ---- Key differentiators ----------------------------------------------
  differentiators: {
    eyebrow: "Key differentiators",
    heading: "What makes Iraje PAM different",
    body:
      "Unique, first-of-their-kind capabilities you won't find in a typical PAM solution.",
    items: [
      {
        badge: "Out of the box",
        title: "Integration of assets",
        body:
          "The only PAM that integrates every IT asset out of the box — no connectors, adaptors or APIs required.",
      },
      {
        badge: "First PAM",
        title: "Dynamic Watermarking",
        body:
          "The first PAM to apply a dynamic watermark on every session accessed through it — for data leak prevention and ownership.",
      },
      {
        badge: "First PAM",
        title: "PAM Bypass Alerts",
        body:
          "The first PAM to raise bypass alerts on Windows, Unix, Linux, AIX & Sun Solaris servers when access skips PAM.",
      },
      {
        badge: "First PAM",
        title: "Command Search in Videos",
        body:
          "The first PAM to let auditors search for specific commands within session video recordings — for faster forensics.",
      },
      {
        badge: "First PAM",
        title: "Unauthorized Access Alerts",
        body:
          "The first PAM to alert on unauthorized access to Windows servers using critical remote protocols.",
      },
      {
        badge: "Beyond EUBA",
        title: "Advanced Analytics",
        body:
          "Goes beyond end-user behaviour analytics to deliver End User, Device, Security and Trend analytics.",
      },
      {
        badge: "Real Zero Trust",
        title: "Real Zero Trust PAM",
        body:
          "The first real Zero Trust PAM — even the super admin cannot delete logs, recordings or tamper with the password vault.",
      },
      {
        badge: "First of its kind",
        title: "Dynamic Risk Score Card",
        body:
          "A first-of-its-kind risk score card that enables focused, prioritised monitoring of privileged users.",
      },
    ],
    note:
      "Plus next-gen capabilities — end-to-end SAP integration, iCROUN command restrictions across all device types, iZAC MAC & serial-number endpoint binding, on-demand Script Manager, and shift-based Advanced Time-Based Access.",
  },

  // ---- Iraje vs the rest (comparison table) -----------------------------
  comparison: {
    eyebrow: "Iraje vs the rest",
    heading: "How Iraje PAM compares",
    body:
      "A side-by-side look at where Iraje PAM goes further than a typical competitor's PAM solution.",
    columns: ["Key feature", "Typical competitor PAM", "Iraje PAM"],
    rows: [
      [
        "Integration of assets",
        "SSO to devices with connectors / agents",
        "SSO to any device without connectors or agents",
      ],
      [
        "PAM bypass alerts",
        "Limited alerts",
        "Bypass alerts for Windows, Unix, Linux, AIX & Sun Solaris servers",
      ],
      [
        "Unauthorized remote access alert",
        "Not available",
        "Alerts on unauthorized access to Windows servers via critical remote protocols",
      ],
      [
        "Zero Trust PAM",
        "Super admin holds credentials & can delete logs, recordings or setup files",
        "Even the super admin cannot delete logs, recordings or any files on PAM",
      ],
      [
        "Dynamic watermarking",
        "Not available",
        "Dynamic watermarking on all sessions accessed through PAM",
      ],
      [
        "Command search within videos",
        "Not available",
        "Search commands directly within session recordings",
      ],
      [
        "Advanced analytics",
        "End-user behaviour analytics only",
        "End User, Device, Security & Trend analytics",
      ],
      [
        "Risk score card",
        "Not available",
        "Dynamic risk score card for focused monitoring",
      ],
      [
        "SAP integration",
        "Not available",
        "End-to-end SAP integration meeting MCA requirements",
      ],
    ],
  },

  // ---- Maturity model ---------------------------------------------------
  maturity: {
    eyebrow: "Maturity model",
    heading: "Your journey from Initial to Zero Trust",
    body:
      "Iraje PAM grows with your security posture — from first integration through to a fully controlled, Zero Trust privileged-access programme.",
    flow: "INITIAL → MANAGED → DEFINE → CONTROLLED & ZERO TRUST",
    levels: [
      {
        level: "LEVEL 1",
        name: "Initial",
        features: [
          "AD & 2FA Integration",
          "Role & Time-Based Access",
          "Just-In-Time Access",
          "Integrate Servers",
          "Password Vaulting",
          "Secure File Transfers",
          "Session Recording & Replay",
          "Regulatory Compliance",
          "Zero Trust",
        ],
      },
      {
        level: "LEVEL 2",
        name: "Managed",
        features: [
          "Integrate Network, Firewall, DB, Thick Clients & Cloud",
          "3FA Integration",
          "Password Enforcement",
          "VOD Analysis & Reviews",
          "Workflow Integration",
          "Dynamic Watermarking",
          "Critical & PAM Bypass Alerts",
          "SIEM Integration",
          "Scheduled Reports & BCP Drills",
        ],
      },
      {
        level: "LEVEL 3",
        name: "Define",
        features: [
          "Integrate all critical assets",
          "Enforce password rotation across DB & network",
          "Controlled time-based access",
          "Discovery of users, devices & admin accounts",
          "ITSM Integration",
          "Secrets Management",
          "Command Controls",
          "GRC Reports",
          "DR Drills",
        ],
      },
      {
        level: "LEVEL 4",
        name: "Controlled",
        features: [
          "Database Restrictions",
          "Fully integrated with ITSM",
          "Automated user & device onboarding",
          "Entitlement reviews & recertification",
          "Lateral Movement Alerts",
          "Advanced Analytics",
          "Dynamic Risk Score Cards",
          "Snap BCP & DR Drills",
        ],
      },
    ],
  },

  // ---- Compliance & regulation ------------------------------------------
  compliance: {
    eyebrow: "Compliance & regulation",
    heading: "Built to satisfy regulators & standards",
    body:
      "Iraje PAM maps directly to regulatory requirements on privileged access and complies with leading global security standards.",
    standards: [
      { name: "ISO 27001", sub: "Information security" },
      { name: "EU GDPR", sub: "Data privacy" },
      { name: "PCI-DSS", sub: "Payment card data" },
      { name: "SOX", sub: "Financial controls" },
      { name: "HIPAA", sub: "Healthcare data" },
      { name: "NIST 800-63B", sub: "Digital identity" },
      { name: "BASEL III", sub: "Banking risk" },
      { name: "MAS", sub: "Singapore" },
      { name: "NESA", sub: "NESA" },
      { name: "DPDP Act", sub: "India 2023" },
    ],
    indianTitle: "Mapped to Indian regulators",
    indianBody:
      "Iraje has mapped the controls from circulars issued by India's financial regulators into a single view — covering least privilege, role & time-based access, MFA, session monitoring, data-leak prevention and audit facilitation.",
    indianRegulators: [
      { name: "RBI", desc: "Banking" },
      { name: "SEBI", desc: "Securities" },
      { name: "IRDAI", desc: "Insurance" },
      { name: "CERT-In", desc: "Advisory" },
    ],
    dpdpTitle: "DPDP Act 2023",
    dpdpSections: [
      "Section 7 — least privilege restricts data access to the specified purpose",
      'Section 8(5) — enforces MFA, logging & least privilege as "reasonable security safeguards"',
      "Section 8(6) — PAM logs & alerts support breach root-cause analysis & notification",
      "Section 9 — ensures authorised, traceable execution of data principal requests",
      "Section 10 — gives DPOs and auditors evidence of compliance for SDF obligations",
    ],
  },

  // ---- Industries -------------------------------------------------------
  industries: {
    eyebrow: "Industries",
    heading: "Securing privileged access across every vertical",
    body:
      "Iraje PAM is deployed across BFSI, healthcare, manufacturing, government and beyond.",
    items: [
      "Banks",
      "Financial Services",
      "Mutual Funds",
      "Insurance",
      "Healthcare",
      "IT / ITES",
      "Hospitality & Travel",
      "Chemical",
      "Pharmaceuticals",
      "Manufacturing",
      "Media",
      "Retail",
      "Defence",
    ],
  },

  // ---- Why Iraje --------------------------------------------------------
  whyIraje: {
    eyebrow: "Why Iraje",
    heading: "An over two-decade pedigree in enterprise security",
    body:
      "Iraje Software specialises in the privileged identity & access governance space — with a flagship solution built on real customer problems.",
    items: [
      {
        title: "Regulatory Compliance",
        body:
          "Controls mapped to RBI, SEBI, IRDAI, CERT-In and global standards — out of the box.",
      },
      {
        title: "Better Support",
        body:
          "Direct access to the team that builds the product — fast, hands-on and accountable.",
      },
      {
        title: "Continuous Innovation",
        body:
          "First-of-their-kind capabilities shipped on a steady, customer-led cadence.",
      },
      {
        title: "Scalable & Secure Architecture",
        body:
          "Active-Active, failsafe and Zero Trust by design — from a single site to the enterprise.",
      },
      {
        title: "Solution Roadmap",
        body:
          "A clear, published roadmap that takes you from Initial to Controlled & Zero Trust.",
      },
    ],
  },

  // ---- CTA / Contact ----------------------------------------------------
  contact: {
    heading: "Still thinking about which PAM to choose?",
    body:
      "Let's show you how Iraje PAM manages, monitors and controls privileged access — and gets adopted and enforced across your enterprise.",
    cta: { label: "Get in touch", href: "/contact" },
    email: "contact@iraje.com",
    website: "www.iraje.com",
  },

  // ---- Footer -----------------------------------------------------------
  footer: {
    brand: "Iraje",
    badge: "Privileged Security",
    tagline:
      "One platform to secure every privileged identity — across access, endpoints and identity.",
    columns: [
      {
        title: "Platform",
        links: [
          { name: "PAM", href: "/products/pam" },
          { name: "EPM", href: "/products/epm" },
          { name: "IAM (soon)", href: "#" },
        ],
      },
      {
        title: "Learn",
        links: [
          { name: "University", href: "/university" },
          { name: "Certification", href: "/certification" },
          { name: "Resources", href: "/resources" },
        ],
      },
      {
        title: "Company",
        links: [
          { name: "About", href: "/about" },
          { name: "Partners", href: "/partners" },
          { name: "Contact", href: "/contact" },
        ],
      },
    ],
    copyright: "© 2026 Iraje Software. All rights reserved.",
    tag: "Iraje · Identity is the new perimeter.",
  },
};

export default pam;
