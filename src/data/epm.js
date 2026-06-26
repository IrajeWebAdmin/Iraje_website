// ===========================================================================
// EPM product page content — transcribed from the Figma "Website" EPM screen.
// Edit copy here, not inline in JSX (per project convention).
// ===========================================================================

const epm = {
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
    cta: { label: "Request a Demo", href: "/contact" },
  },

  // ---- Hero -------------------------------------------------------------
  hero: {
    eyebrow: "Endpoint Privilege Management",
    title: "Your first line of defence, right at the endpoint.",
    subtitle:
      "Iraje EPM enforces least privilege on every endpoint — removing standing local admin rights, rotating local admin passwords hourly, and stopping ransomware before it can start.",
    ctas: [
      { label: "Request a Demo", href: "/contact", primary: true },
      { label: "See How it Works", href: "#how-epm-works", primary: false },
    ],
    card: {
      eyebrow: "STOPS THE ATTACK BEFORE IT STARTS",
      pills: [
  {
    text: "Removes permanent local admin rights",
    icon: "/icons/perment-logic-admin-right.svg",
  },
  {
    text: "Just-in-Time privilege elevation",
    icon: "/icons/just-in-time.svg",
  },
  {
    text: "Application control & allowlisting",
    icon: "/icons/application-control.svg",
  },
  {
    text: "Blocks ransomware & privilege escalation",
    icon: "/icons/block-ransomware.svg",
  },
]
    },
    strip: [
  {
    name: "Manage",
    label: "LEAST PRIVILEGE",
    icon: "/icons/manage-least-privilege.svg",
  },
  {
    name: "Monitor",
    label: "FULL VISIBILITY",
    icon: "/icons/monitor-full-visibility.svg",
  },
  {
    name: "Control",
    label: "GOVERNANCE",
    icon: "/icons/control-governance.svg",
  },
  {
    name: "Discover",
    label: "EVERY ENDPOINT",
    icon: "/icons/discover-every-endpoint.svg",
  },
  {
    name: "Comply",
    label: "AUDIT READY",
    icon: "/icons/comply-audit-ready.svg",
  },
  {
    name: "Secure",
    label: "TAMPER PROOF",
    icon: "/icons/secure-tamper-proof.svg",
  },
]
  },

  // ---- The Threat -------------------------------------------------------
  threat: {
    eyebrow: "The Threat",
    heading: "Endpoints are Ground Zero for Cyberattacks",
    body: "Endpoints are the primary entry point for most cyberattacks — and modern ransomware almost always begins there before spreading across the enterprise. That's why endpoint security is now a central pillar of enterprise cybersecurity — and why preventing privilege misuse at the endpoint matters more than ever.",
    subheading: "Why endpoints are exposed",
    points: [
      "Users interact directly with emails and websites every day",
      "Credentials are stored on the endpoint itself",
      "Remote work has dramatically expanded the attack surface",
      "Malware almost always starts at the endpoint layer",
    ],
  },

  // ---- Ransomware kill chain -------------------------------------------
  killChain: {
    eyebrow: "The ransomware kill chain",
    heading: "How One Click Becomes a Full Environment Takeover",
    body: "EPM breaks the chain at privilege escalation — the step every attacker depends on.",
steps: [
  {
    label: "Phishing email",
    icon: "/icons/phishing-email.svg",
  },
  {
    label: "Endpoint compromise",
    icon: "/icons/endpoint-icon.svg",
  },
  {
    label: "Privilege escalation",
    icon: "/icons/privilege-escalation.svg",
  },
  {
    label: "Credential theft",
    icon: "/icons/credential.svg",
  },
  {
    label: "Lateral movement",
    icon: "/icons/lateral.svg",
  },
  {
    label: "Full takeover",
    icon: "/icons/takeover.svg",
  },
],
    blockedIndex: 2,
    blockedLabel: "BLOCKED BY EPM",
  },

  // ---- The missing layer (security stack) -------------------------------
  stack: {
    eyebrow: "The missing layer",
    heading: "A mature endpoint stack, with one critical gap",
    body: "Most enterprise endpoints already run a deep security stack. But almost every layer is built to detect and respond. Very few are built to prevent.",
    layers: [
      { name: "LAPS", role: "Local admin password rotation" },
      { name: "DLP", role: "Prevent data leakage" },
      { name: "Encryption", role: "Data Protection" },
      { name: "Iraje Epm", role: "Prevent Privilege Misuse" },
      { name: "Application Control", role: "Application Control/Allowing" },
      { name: "NGAV", role: "Signatureless threat detection" },
      { name: "EDR", role: "Detect malware, ransomware, lateral movement" },
      { name: "UEBA", role: "Detect abnormal user behaviour" },
      { name: "Threat hunting", role: "Identify Suspicious Activities"  },
      { name: "Vulnerability Assessment", role: "Detect missing patches" },
      { name: "XDR", role: "Unified investigation and response" },
      { name: "SOAR", role: "Automated playbooks and incident response" },
      { name: "Patch Management", role: "Fix vulnerabilities" },
      { name: "Endpoint Isolation", role: "Quarantine compromised machines" },
      { name: "Automated Remediation", role: "Kill malicious processes" },
    ],
    preventive: {
      name: "Iraje EPM — the preventive layer",
      role: "Stops privilege misuse, ransomware & credential theft before detection is even needed",
    },
    note: {
      heading: "Why detection alone isn't enough",
      body: "Microsoft LAPS is the most common tool for local admin password rotation — but it only covers Windows endpoints, and only rotates passwords. EDR and XDR are powerful, but they are built to monitor, detect and respond after an attacker is already active. EPM is the preventive control that precedes EDR/XDR — enforcing least privilege so the attack never escalates in the first place.",
    },
  },

  // ---- Prevention vs detection (3 cards) --------------------------------
  vs: {
    eyebrow: "EPM vs EDR / XDR",
    heading: "Prevention and detection solve different problems",
    body: "EDR and XDR are built to detect and respond once an attacker is active. EPM is built to make sure the attack never escalates in the first place. The strongest endpoint security uses both.",
    cards: [
      {
        tag: "Preventing",
        name: "EPM",
        headline: "Stops the attack from starting",
        body: "Enforces least privilege so malware has no admin rights to execute, escalate or spread.",
        highlight: true,
      },
      {
        tag: "Detecting",
        name: "EDR",
        headline: "Detects the attack when it starts",
        body: "Monitors endpoint processes, files and memory for suspicious activity, then reacts.",
        highlight: false,
      },
      {
        tag: "Correlating",
        name: "XDR",
        headline: "Connects & responds across systems",
        body: "Correlates telemetry across endpoint, cloud, identity and email for coordinated response.",
        highlight: false,
      },
    ],
    quote:
      "EDR / XDR tells you that you are under attack. Iraje EPM ensures the attack never succeeds.",
  },

  // ---- Detailed comparison table ----------------------------------------
  comparison: {
    eyebrow: "Detailed comparison",
    heading: "EPM vs EDR vs XDR, line by line",
    columns: ["Capability", "Iraje EPM", "EDR", "XDR"],
    rows: [
      [
        "Primary Objective",
        "Enforce least privilege & control admin rights",
        "Detect & respond to endpoint threats",
        "Detect & correlate threats across ecosystem",
      ],
      [
        "Security Approach",
        "Preventive (Zero Trust)",
        "Detective + Reactive",
        "Detective + Correlated Response",
      ],
      [
        "Core Function",
        "Remove standing admin rights, enable JIT elevation",
        "Monitor endpoints for suspicious activity",
        "Aggregate telemetry across endpoint, cloud, identity",
      ],
      [
        "Attack Stage Covered",
        "Before the attack executes",
        "During / after attack execution",
        "During & across the attack lifecycle",
      ],
      [
        "Admin Rights Control",
        "Full control — remove, rotate, elevate",
        "Limited / indirect",
        "Not designed for this",
      ],
      [
        "Attack Surface Reduction",
        "Very High — eliminates privilege misuse",
        "Moderate",
        "Moderate",
      ],
      [
        "Threat Detection",
        "Focused on privilege behaviour",
        "Strong endpoint detection",
        "Strong cross-domain detection",
      ],
      [
        "Response Actions",
        "Allow / deny elevation, session control, logging",
        "Kill process, isolate device",
        "Cross-domain automated response",
      ],
      [
        "Ransomware Protection",
        "Removes rights & blocks elevation",
        "Detects & stops encryption",
        "Detects spread & correlates signals",
      ],
      [
        "Lateral Movement Control",
        "Strong — no credentials to move with",
        "Detects suspicious movement",
        "Detects across identity + network",
      ],
      [
        "AI / Analytics",
        "Focused on privilege behaviour",
        "Behavioural analytics, threat intel",
        "AI correlation across multiple signals",
      ],
      [
        "Coverage Scope",
        "Endpoint privilege layer",
        "Endpoint only",
        "Endpoint + Cloud + Identity + Email",
      ],
      [
        "Compliance",
        "Strong for least privilege & audit",
        "Strong for incident detection logs",
        "Strong for enterprise security posture",
      ],
      [
        "Dependency",
        "Works standalone — the prevention layer",
        "Needs preventive controls like EPM",
        "Works best with identity + endpoint tools",
      ],
    ],
  },

  // ---- At a glance (condensed table) ------------------------------------
  glance: {
    eyebrow: "At a glance — across the attack lifecycle",
    columns: ["Stage", "Iraje EPM", "EDR / XDR"],
    rows: [
      ["Admin rights", "Prevents misuse", "No control"],
      ["Visibility", "Privilege-focused", "Detects activity"],
      ["Response", "Logs & audit", "Kill & isolate"],
      ["Ransomware", "Rotated hourly", "Static"],
      ["Lateral movement", "JIT + recording", "None"],
      ["Session evidence", "Recording + watermark", "Partial"],
    ],
  },

  // ---- The core problem -------------------------------------------------
  coreProblem: {
    eyebrow: "The core problem",
    heading:
      "Too many users and applications running with local admin privileges.",
    body: "The local administrator password is one of the most critical security elements in any enterprise — it provides full control over the device. Yet endpoints are routinely left vulnerable.",
    reasonsTitle: "Why endpoints get local admin rights",
    risksTitle: "…and the risk it creates",
    reasons: [
      "Applications historically required admin access to run",
      "It was simply more convenient for IT support",
      "Legacy software carried hard dependencies on admin rights",
    ],
    risks: [
      "Users install unauthorized and unmanaged software",
      "Malware instantly inherits admin privileges",
      "Security tools can be disabled; ransomware spreads rapidly",
    ],
    banner:
      "One compromised endpoint can quickly become an enterprise-wide incident.",
  },

  // ---- Eight ways EPM works ---------------------------------------------
  eightWays: {
    eyebrow: "How EPM Works",
    heading: "Eight ways EPM secures every endpoint",
    body: "By enforcing least privilege — giving users, applications and processes only the minimum access they need — EPM removes the conditions attackers depend on.",
    items: [
      {
        title: "Removes standing admin rights",
        body: "Strips permanent local admin privileges while users still complete authorized tasks.",
      },
      {
        title: "Just-in-Time elevation",
        body: "Elevates only the task that needs it, for only as long as it's needed, then revokes automatically.",
      },
      {
        title: "Controls application elevation",
        body: "Lets specific apps run elevated without ever making the user a local admin.",
      },
      {
        title: "Stops malware escalation",
        body: "Blocks the unauthorized privilege elevation malware needs to disable AV and encrypt files.",
      },
      {
        title: "Application control & allowlisting",
        body: "Trusted-application policies block unknown executables, scripts and shadow IT tools.",
      },
      {
        title: "Reduces ransomware risk",
        body: "Ransomware relies on privileged access — EPM removes rights and blocks elevation attempts.",
      },
      {
        title: "Visibility & auditability",
        body: "Records who requested elevation, which apps ran elevated, when, and what was done.",
      },
      {
        title: "Improves compliance posture",
        body: "Helps meet PCI-DSS, ISO 27001, NIST, CIS Benchmarks, RBI and CERT-In requirements.",
      },
    ],
  },

  // ---- Six pillars (capabilities) ---------------------------------------
  pillars: {
    eyebrow: "Iraje EPM capabilities",
    heading: "Six pillars of next-gen endpoint privilege management",
    body: "Iraje EPM features are organised across six areas — Manage, Monitor, Control, Discover, Comply and Secure.",
    items: [
      {
        name: "Manage",
        features: [
          "Local admin password rotation for Windows endpoints — every hour",
          "Just-in-Time (JIT) privilege elevation",
          "Secure privileged access to endpoints with workflow",
          "Manage remote accesses",
          "Multi-lingual support",
        ],
      },
      {
        name: "Monitor",
        features: [
          "Session recording of privileged activities on endpoints",
          "AI-assisted transcription of recorded sessions",
          "Live viewing of privileged sessions",
          "Seamless SIEM integration",
          "Forensic log analysis",
        ],
      },
      {
        name: "Control",
        features: [
          "Local admin governance",
          "Full audit trails for forensics",
          "Automated admin account lifecycle management",
          "Watermarking for all elevated accesses",
          "Reports & analytics for better decision making",
        ],
      },
      {
        name: "Discover",
        features: [
          "Discovery of endpoints across the enterprise",
          "Remote deployment and removal of agents",
          "Remotely enable / disable agents",
          "Manage remote accesses",
          "Shadow admin account detection",
        ],
      },
      {
        name: "Comply",
        features: [
          "Compliance with ISO, PCI-DSS, SOC 2, GDPR & NIST standards",
          "Mapping with RBI, SEBI, IRDAI, CERT-In, UIDAI & MeitY guidelines",
          "Pre-built reports for key regulatory compliances",
        ],
      },
      {
        name: "Secure",
        features: [
          "Tamper-proof agent for endpoints",
          "Zero Standing Privileges (ZSP)",
          "Secure access with workflow-based approvals",
          "Secure privilege escalation controls",
          "Prevents ransomware, phishing & lateral movement",
        ],
      },
    ],
  },

  // ---- Solution architecture --------------------------------------------
  architecture: {
    eyebrow: "Solution architecture",
    heading: "Simple to deploy. Redundant by design.",
    body: "Iraje EPM has a deliberately simple architecture — just one application server and one vault server. A redundant set of both can be deployed for seamless failover.",
    nodes: [
      {
        name: "Application Server",
        body: "Handles policy, workflow-based approvals and Just-in-Time privilege elevation across every endpoint.",
      },
      {
        name: "Vault Server",
        body: "Securely stores and rotates local admin credentials — no standing privileges, no exposed passwords.",
      },
      {
        name: "Tamper-proof Agents",
        body: "Lightweight agents enforce policy on every endpoint and can't be disabled by local users or malware.",
      },
    ],
  },

  // ---- Five differentiators ---------------------------------------------
  differentiators: {
    eyebrow: "Key differentiators",
    heading: "Five reasons Iraje EPM stands apart",
    body: "Capabilities engineered to prevent attacks — not just observe them.",
    items: [
      {
        num: "01",
        title: "Rotating local admin credentials every hour",
        body: "Eliminates the risk of credential misuse by automatically rotating local admin passwords every single hour — no static passwords, no shared secrets.",
      },
      {
        num: "02",
        title: "JIT elevation of privileges with session recordings",
        body: "Grant Just-in-Time access only when it's needed, and record every elevated session for complete accountability and audit readiness.",
      },
      {
        num: "03",
        title: "AI-enabled transcribed logs that integrate with SIEM",
        body: "AI-enabled transcription of session activities creates intelligent, searchable logs that integrate seamlessly with your SIEM.",
      },
      {
        num: "04",
        title: "Watermarking of elevated sessions",
        body: "Every elevated session is watermarked with user details, timestamp and device information — deterring misuse and ensuring full traceability.",
      },
      {
        num: "05",
        title: "Multilingual — available in 12 global languages",
        body: "A truly global solution supporting 12 languages, empowering organizations to secure endpoints across diverse regions and workforces.",
      },
    ],
  },

  // ---- Compliance & regulation ------------------------------------------
  compliance: {
    eyebrow: "Compliance & regulation",
    heading: "Mapped to endpoint-security regulation, worldwide",
    body: "Iraje EPM maps directly to global standards and Indian regulatory requirements on endpoint security — with audit evidence built in.",
    standardsTitle: "Global standards",
    standards: [
      { name: "ISO 27001", sub: "Information security" },
      { name: "SOC 2", sub: "Trust services" },
      { name: "PCI-DSS", sub: "Payment card data" },
      { name: "SOX", sub: "Financial controls" },
      { name: "HIPAA", sub: "Healthcare data" },
      { name: "EU GDPR", sub: "Data privacy" },
      { name: "NIST", sub: "Cybersecurity" },
    ],
    table: {
      title: "Compliance Mapping — Global",
      columns: [
        "Control Area",
        "Endpoint Requirement",
        "ISO 27001",
        "SOC 2",
        "PCI-DSS",
        "HIPAA",
        "SOX",
        "GDPR",
        "NIST",
        "Evidence",
      ],
      rows: [
        ["Least Privilege", "Remove permanent local admin rights", "A.5.15", "CC6.1", "Req 7.2", "164.308(a)(4)", "ITGC", "Art.25", "AC-6", "Admin rights report"],
        ["JIT Elevation", "Temporary admin access with expiry", "A.8.2", "—", "Req 7.2.5", "Addressable", "ITGC", "Art.25", "AC-2", "Elevation logs"],
        ["Privilege Escalation Control", "Restrict unauthorized elevation", "A.8.7", "—", "Req 5.2", "164.308(a)(5)", "ITGC", "Art.32", "SI-7", "Block logs"],
        ["Privileged Activity Logging", "Log admin actions", "A.8.15", "—", "Req 10", "164.312(b)", "ITGC", "Art.30", "AU-2", "SIEM logs"],
        ["Session Monitoring", "Monitor admin sessions", "A.8.15", "—", "Req 10.2", "164.312(b)", "ITGC", "Art.30", "AU-12", "Session logs"],
        ["SIEM Integration", "Centralized logging & alerting", "A.8.16", "—", "Req 10", "164.312(b)", "ITGC", "Art.33", "SI-4", "SIEM dashboards"],
        ["Access Reviews", "Periodic admin access review", "A.5.18", "—", "Req 7.2.4", "164.308(a)(4)", "ITGC", "Art.5", "AC-2", "Review reports"],
        ["MFA for Privileged Access", "MFA for admin login / elevation", "A.5.17", "—", "Req 8.4.2", "164.312(d)", "ITGC", "Art.32", "IA-2", "MFA logs"],
        ["Command & Script Control", "Restrict PowerShell / CMD usage", "A.8.7", "—", "Req 5.2", "164.308(a)(5)", "ITGC", "Art.32", "CM-7", "Execution logs"],
      ],
    },
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
          { name: "IAM (soon)", href: "/products/iam" },
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
          { name: "Partners", href: "/partners" },
          { name: "About", href: "/about" },
          { name: "Contact", href: "/contact" },
        ],
      },
    ],
    copyright: "© 2026 Iraje Software. All rights reserved.",
    tag: "Iraje · Identity is the new perimeter.",
  },
};

export default epm;
