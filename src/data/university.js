// ===========================================================================
// University page content — transcribed from the Figma "Website" University
// frame (node 870:117). Edit copy here, not inline in JSX (per project
// convention). Colours/typography are mapped to the site's Poppins + brand
// design system in the section components.
// ===========================================================================

const university = {
  // ---- Hero -------------------------------------------------------------
  hero: {
    eyebrow: "Iraje University",
    titleLead: "Forging the",
    titleAccent: "defenders",
    titleTrail: "the world is short of.",
    body: [
      "A dedicated academy for Identity & Access Management and modern cyber defence  built to close the skills gap that leaves organisations exposed. Master cybersecurity through ",
      "CyberTantra", // inline brand accent
      " and become certified across Iraje PAM, EPM & IAM.",
    ],
    ctas: [
      { label: "Request Training", href: "#request", primary: true },
      { label: "Explore the Curriculum", href: "#master-course", primary: false },
    ],
    image: "/images/university/university-hero.webp",
    imageAlt: "Security professionals training in a modern operations centre",
  },

  // ---- Why this matters (skills) ---------------------------------------
  skills: {
    eyebrow: "Why this matters",
    heading: "Skills are the new frontline of cyber defence.",
    left: [
      "In the IT industry, technology refreshes every few months — but it is people and their skills that decide whether an organisation stays secure. Nowhere is this truer than in cybersecurity, where defenders must counter adversaries who are constantly evolving. Tools alone do not protect an enterprise; trained professionals who know how to deploy, operate and govern those tools do.",
      "And yet the world faces an acute shortage of exactly these people. The cybersecurity profession has shifted from a pure headcount problem to something more urgent: a deep skills deficit in the very areas that matter most — identity, privileged access, cloud, threat hunting and AI-era defence.",
    ],
    quote:
      "The most pressing concern for cybersecurity teams isn't headcount any more — it's skills.",
    right: [
      "For individuals, this gap is the single biggest opportunity for career progression in technology today. Structured, hands-on training is no longer a nice-to-have — it is the fastest route from aspiring practitioner to indispensable expert, and from operator to architect.",
      "Iraje University is a direct response to this shortage. Born out of two decades of building enterprise security products, it exists to turn the skills gap into a pipeline of capable, certified defenders — for our customers, our partners, and the wider security community.",
    ],
    stats: [
      { value: "95%", caption: "of cybersecurity teams report at least one skills gap within their team." },
      { value: "59%", caption: "describe those gaps as critical or significant — up sharply from 44% a year earlier." },
      { value: "88%", caption: "have suffered a significant security incident caused by a skills shortage." },
      { value: "~3.4M", caption: "professionals — the scale of the global cyber workforce gap recent studies have tracked." },
    ],
    source: "Source: ISC2 Cybersecurity Workforce Study (2023–2025).",
  },

  // ---- Iraje University intro + two domain cards ------------------------
  intro: {
    heading: "Iraje University",
    body:
      "Iraje University offers extensive training programs in Identity & Access Management, spanning the full spectrum of our products — Iraje PAM, Iraje EPM and the upcoming Iraje IAM. Our programs are designed for customers, partners and cybersecurity professionals who want to build a lasting career in the security domain. Training is delivered across two complementary domains.",
    cards: [
      {
        label: "Domain 01 · Foundations & Mastery",
        title: "Cybersecurity Training",
        body: [
          "Our flagship master course, ",
          "CyberTantra — The Sovereign Key", // accent
          " a complete, end-to-end cybersecurity curriculum for every professional, from foundations to advanced and emerging domains.",
        ],
        cta: { label: "View curriculum", href: "#master-course" },
      },
      {
        label: "Domain 02 · Product Certification",
        title: "Iraje Solutions Training",
        body: [
          "Role-based, hands-on certification tracks across ",
          "Iraje PAM, Iraje EPM and Iraje IAM", // accent
          "  from fundamentals (101) through advanced administration and operations (201).",
        ],
        cta: { label: "View tracks", href: "#certification" },
      },
    ],
  },

  // ---- The Master Course — CyberTantra ----------------------------------
  masterCourse: {
    eyebrow: "The Master Course",
    heading: "CyberTantra — The Sovereign Key",
    body:
      "The definitive cybersecurity course for every professional in the world — whether you are an established expert, an aspirant entering the field, or a practitioner seeking structured guidance. Eighteen modules across four parts take you from first principles to the frontier of AI-era defence and career mastery.",
    parts: [
      {
        label: "Part I",
        title: "Cybersecurity Foundations",
        modules: [
          "Introduction to Cybersecurity",
          "Network Security",
          "Operating System Concepts & Security",
          "Windows Administration & Windows Security",
          "Linux Administration & Linux Security",
          "Cryptography & Data Protection",
          "Application Security",
        ],
      },
      {
        label: "Part II",
        title: "Security Operations & Defence",
        modules: [
          "Ethical Hacking",
          "Incident Response & Forensics",
          "SecOps & SIEM",
          "Identity & Access Management (IAM)",
          "Privileged Access Management (PAM)",
        ],
      },
      {
        label: "Part III",
        title: "Advanced & Emerging Domains",
        modules: [
          "Emerging Technologies",
          "DevSecOps",
          "Advanced Threats & Threat Hunting",
          "Cyberlaw & Cyber Insurance",
          "AI in Cybersecurity",
        ],
      },
      {
        label: "Part IV",
        title: "Building Your Career",
        modules: ["Careers in Cybersecurity"],
        note:
          "The capstone of CyberTantra — translating mastery into a clear, defensible career path in the security industry.",
      },
    ],
  },

  // ---- Product Certification (Iraje Solutions Training) -----------------
  certification: {
    eyebrow: "Product Certification",
    heading: "Iraje Solutions Training",
    body:
      "Structured, hands-on certification tracks for Iraje's Identity & Access Management portfolio. Begin with the 101 fundamentals and progress to 201 advanced administration and operations. Tap any track to view its module outline.",
    tracks: [
      {
        code: "PAM 101",
        pill: "Iraje PAM 101",
        title: "Fundamentals of Privileged Identity & Access Management",
        summary:
          "Foundations, architecture, Zero Trust and core capabilities of Iraje PAM.",
        modules: [
          "Introduction to PAM & Identity Security",
          "Industry Challenges & Problem Statement",
          "What is Iraje PAM?",
          "Iraje PAM Architecture",
          "Zero Trust Security in Iraje PAM",
          "Iraje PAM Core Features",
          "Deployment & Integration",
          "Use Cases & Case Studies",
          "Iraje PAM Differentiators",
          "Hands-On Demo / Lab",
          "Best Practices & Operational Governance",
        ],
      },
      {
        code: "PAM 201",
        pill: "Iraje PAM 201",
        title: "Advanced Administration & Operations",
        summary:
          "Deep-dive deployment, hardening, RBAC, HA/DR and operational governance.",
        modules: [
          "Iraje PAM Administration Overview",
          "Detailed Architecture Deep Dive",
          "Installation & Initial Configuration",
          "Hardening & Security Configuration",
          "Active Directory & Identity Integration",
          "Role Based Access Control (RBAC) Administration",
          "Device & Asset Onboarding",
          "Password Vault Administration",
          "Session Management Administration",
          "Workflow & Approval Configuration",
          "Compliance, Audit & Reporting Administration",
          "Integration with Security Ecosystem",
          "High Availability (HA) & Disaster Recovery (DR)",
          "Performance Tuning & Scalability",
          "Troubleshooting & Operational Support",
          "Operational Governance & Best Practices",
        ],
      },
      {
        code: "EPM 101",
        pill: "Iraje EPM 101",
        title: "Endpoint Privilege Management Fundamentals",
        summary:
          "Endpoint risks, least privilege, application elevation and Iraje EPM essentials.",
        modules: [
          "Introduction to Endpoint Security",
          "What is Endpoint Privilege Management (EPM)?",
          "Industry Challenges & Endpoint Risks",
          "Why Organizations Need EPM?",
          "What is Iraje EPM?",
          "Iraje EPM Architecture",
          "Iraje EPM Core Features",
          "Application Elevation Workflows",
          "Local Admin Password Security",
          "Endpoint Threat Prevention Use Cases",
          "Compliance & Governance",
          "Iraje EPM Differentiators",
          "Use Cases & Case Studies",
          "Hands-On Demo / Lab",
          "Best Practices & Operational Governance",
        ],
      },
      {
        code: "EPM 201",
        pill: "Iraje EPM 201",
        title: "Advanced Administration & Governance",
        summary:
          "Agent management, privilege elevation policy, application control and HA/DR.",
        modules: [
          "Iraje EPM Administration Overview",
          "Iraje EPM Architecture Deep Dive",
          "Installation & Initial Deployment",
          "Endpoint Agent Management",
          "Active Directory & Identity Integration",
          "Role Based Access Control (RBAC) Administration",
          "Endpoint Onboarding & Asset Management",
          "Privilege Elevation Policy Administration",
          "Least Privilege Enforcement Administration",
          "Application Control & Governance",
          "Local Admin Password Governance",
          "Workflow & Approval Administration",
          "Endpoint Security Governance",
          "Monitoring, Logging & Reporting",
          "Integration with Security Ecosystem",
          "High Availability (HA) & Disaster Recovery (DR)",
          "Performance Tuning & Scalability",
          "Troubleshooting & Operational Support",
          "Operational Governance & Best Practices",
        ],
      },
      {
        code: "IAM 101",
        pill: "Iraje IAM 101 · Coming Soon",
        title: "Iraje IAM Fundamentals",
        summary:
          "The next addition to the Iraje IAM portfolio. Curriculum to be announced.",
        modules: [],
        upcoming: true,
      },
    ],
  },

  // ---- Training programs & delivery formats -----------------------------
  formats: {
    eyebrow: "How you learn",
    heading: "Training programs & delivery formats",
    body:
      "Flexible formats tailored to your role and location — whether you're securing your own enterprise or building a practice as an Iraje partner.",
    groups: [
      {
        label: "For Customers",
        title: "Customer-Focused Programs",
        items: [
          { title: "Online Training Programs", desc: "Self-paced and instructor-led 101 & 201 courses." },
          { title: "Classroom Training Programs", desc: "Scheduled once a quarter, in-person and hands-on." },
          { title: "Masterclass Trainings", desc: "Online deep-dive sessions, scheduled biweekly." },
          { title: "Onsite Training", desc: "Delivered at your location, scheduled with your team." },
        ],
      },
      {
        label: "For Partners",
        title: "Partner-Focused Programs",
        items: [
          { title: "Online Training Programs", desc: "Enablement-ready 101 & 201 courses for your teams." },
          { title: "Masterclass Trainings", desc: "Online sessions, scheduled biweekly." },
          { title: "Onsite Training", desc: "Delivered at your premises, scheduled with your team." },
        ],
        note:
          "Partner programs are designed to build deployment, support and advisory capability — turning your team into certified Iraje practitioners.",
      },
    ],
  },

  // ---- Request a training ----------------------------------------------
  request: {
    eyebrow: "Get started",
    heading: "Request a training",
    body:
      "Tell us who you are and what you'd like to learn. Our academy team will follow up with available schedules, formats and enrolment details.",
    contact: [
      { icon: "mail", text: "university@iraje.com" },
      { icon: "phone", text: "Response within 1–2 business days" },
      { icon: "map", text: "Online · Classroom · Masterclass · Onsite" },
    ],
    audiences: ["Customer", "Partner", "Individual / Professional", "Student"],
    courses: [
      "CyberTantra — The Sovereign Key (Master Course)",
      "Iraje PAM 101 — Fundamentals",
      "Iraje PAM 201 — Advanced Administration & Operations",
      "Iraje EPM 101 — Fundamentals",
      "Iraje EPM 201 — Advanced Administration & Governance",
      "Iraje IAM 101 — Fundamentals (Upcoming)",
    ],
    deliveryFormats: ["Online", "Classroom", "Masterclass", "Onsite"],
  },

  // ---- Footer -----------------------------------------------------------
  footer: {
    brandLead: "Iraje",
  
    description:
    "One platform to secure  every identity.",
    columns: [
      {
        title: "Training",
        links: [
          { name: "CyberTantra", href: "#master-course" },
          { name: "PAM", href: "/products/pam" },
          { name: "EPM", href: "/products/epm" },
          // No IAM page yet — rendered as plain, unclickable text.
          { name: "IAM", disabled: true },
        ],
      },
      {
        title: "Programs",
        links: [
          { name: "For Customers", href: "#formats" },
          { name: "For Partners", href: "#formats" },
          { name: "Masterclasses", href: "#formats" },
          { name: "Request Training", href: "#request" },
        ],
      },
      {
        title: "Iraje",
        links: [
          { name: "Iraje Home", href: "/" },
          { name: "PAM Solution", href: "/products/pam" },
          { name: "Contact Us", href: "/contact" },
        ],
      },
    ],
    copyright: "© Iraje Software. All rights reserved.",
  
  },
};

export default university;
