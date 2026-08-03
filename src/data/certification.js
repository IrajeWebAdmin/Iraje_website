// ===========================================================================
// Certification page content — transcribed from the Figma "Website"
// Certification frame (node 883:322). Edit copy here, not inline in JSX
// (per project convention: src/data/*.js is the content layer).
//
// The page is the "Iraje University & Certification Program": six
// certifications across three tracks (PAM, EPM, CyberTantra), each with an
// Associate (101) and Administrator (201) level.
// ===========================================================================

const certification = {
  // ---- Hero -------------------------------------------------------------
  hero: {
    eyebrow: "Iraje University & Certification Program",
    titleLead: "Get",
    titleAccent: "certified.",
    titleTrail: "Prove your expertise.",
    body: "Industry-recognised certifications across Iraje PAM, EPM and CyberTantra — from Associate fundamentals to Administrator-level governance. Learn online, sit a proctored exam, and earn a verifiable digital certificate.",
    ctas: [
      { label: "Enroll Now", href: "#enroll", primary: true },
      { label: "Explore certifications", href: "#tracks", primary: false },
    ],
    image: "/images/certification/hero.png",
  },

  // ---- Certification Tracks --------------------------------------------
  tracks: {
    eyebrow: "Certification Tracks",
    heading: "Six certifications, three tracks",
    body:
      "Each track offers an Associate (101) and Administrator (201) certification. Start with fundamentals, then advance to administration and governance.",
    items: [
      {
        track: "Privileged Access Management",
        subtitle: "Iraje PAM certifications",
        levels: [
          {
            code: "PAM 101",
            level: "Associate",
            title: "Certified Associate — PAM Fundamentals",
            role: "Foundations of privileged identity & access management.",
            audience: ["Sales", "Pre-Sales", "Security Teams", "Customers", "Partners"],
            questions: "50",
            duration: "60m",
            pass: "70%",
            prerequisite: "None",
          },
          {
            code: "PAM 201",
            level: "Administrator",
            title: "Certified Administrator — PAM Administration & Governance",
            role: "Deploy, administer and govern Iraje PAM in production.",
            audience: ["PAM Administrators", "Implementation Engineers", "SecOps Teams"],
            questions: "75",
            duration: "90m",
            pass: "75%",
            prerequisite: "PAM 101",
          },
        ],
      },
      {
        track: "Endpoint Privilege Management",
        subtitle: "Iraje EPM certifications",
        levels: [
          {
            code: "EPM 101",
            level: "Associate",
            title: "Certified Associate — EPM Fundamentals",
            role: "Endpoint privilege management essentials and least privilege.",
            audience: ["Endpoint Security Teams", "IT Teams", "Security Architects"],
            questions: "50",
            duration: "60m",
            pass: "70%",
            prerequisite: "None",
          },
          {
            code: "EPM 201",
            level: "Administrator",
            title: "Certified Administrator — EPM Administration & Governance",
            role: "Manage elevation policy, application control and endpoint governance.",
            audience: ["Desktop Engineering Teams", "Endpoint Security Admins"],
            questions: "75",
            duration: "90m",
            pass: "75%",
            prerequisite: "EPM 101",
          },
        ],
      },
      {
        track: "CyberTantra",
        subtitle: "Identity security certifications",
        levels: [
          {
            code: "CT 101",
            level: "Associate",
            title: "Certified Associate — Identity Security Fundamentals",
            role: "Core cybersecurity and identity security foundations.",
            audience: ["Security Professionals", "IAM Teams", "Customers", "Partners"],
            questions: "50",
            duration: "60m",
            pass: "70%",
            prerequisite: "None",
          },
          {
            code: "CT 201",
            level: "Administrator",
            title: "Certified Administrator — CyberTantra Administration & Governance",
            role: "Advanced identity security administration and governance.",
            audience: ["Product Administrators", "SecOps Teams"],
            questions: "75",
            duration: "90m",
            pass: "75%",
            prerequisite: "CyberTantra 101",
          },
        ],
      },
    ],
  },

  // ---- How It Works -----------------------------------------------------
  howItWorks: {
    eyebrow: "How It Works",
    heading: "From registration to certificate",
    intro:
      "A simple, governed journey — register, get approved, learn at your pace, pass the exam, and earn a verifiable certificate.",
    steps: [
      {
        num: "01",
        title: "Register",
        body: "Submit your personal and professional details and choose the certifications you want to pursue.",
      },
      {
        num: "02",
        title: "Get Approved",
        body: "Our team reviews each request — approve, request more information, or follow up. You're notified by email.",
      },
      {
        num: "03",
        title: "Learn & Certify",
        body: "Receive your login, complete the course modules, pass the proctored exam, and download your certificate.",
      },
    ],
    journey: ["Register", "Approval", "Learn", "Exam", "Certificate"],
  },

  // ---- Student Dashboard ------------------------------------------------
  dashboard: {
    eyebrow: "Student Dashboard",
    heading: "Learn at your own pace",
    intro:
      "Every learner gets a personal dashboard to track courses, progress and exam eligibility — with structured modules combining video, PDFs, presentations and knowledge checks.",
    features: [
      "My Courses, Certifications & Certificate downloads",
      "Pending & completed exams in one view",
      "Progress tracker: % complete, time spent, modules done",
      "Automatic exam-eligibility once modules are complete",
    ],
    insideTag: "Inside each course",
    modules: ["📹 Videos", "📄 PDF", "📊 Presentation", "✓ Knowledge Check"],
    mock: {
      url: "academy.iraje.com/dashboard",
      nav: ["Dashboard", "My Courses", "Certifications", "Exams", "Progress"],
      welcome: "Welcome back, John",
      sub: "Progress: 90% · Modules 14/15 · Exam eligible: YES",
      courses: [
        { code: "PAM 101", status: "80% Complete", state: "progress" },
        { code: "PAM 201", status: "Not started", state: "idle" },
        { code: "EPM 101", status: "Certified", state: "certified" },
      ],
    },
  },

  // ---- Online Examination Engine ---------------------------------------
  exam: {
    eyebrow: "Online Examination Engine",
    heading: "Proctored, fair, exam rules",
    intro:
      "Exams are taken online with questions drawn at random from large question banks — so every test is unique. Here's what to expect for each certification.",
    columns: ["Certification", "Level", "Questions", "Duration", "Passing"],
    rows: [
      ["Iraje PAM 101", "ASSOCIATE", "50 MCQs", "60 minutes", "70%"],
      ["Iraje PAM 201", "ADMIN", "75 MCQs", "90 minutes", "75%"],
      ["Iraje EPM 101", "ASSOCIATE", "50 MCQs", "60 minutes", "70%"],
      ["Iraje EPM 201", "ADMIN", "75 MCQs", "90 minutes", "75%"],
      ["CyberTantra 101", "ASSOCIATE", "50 MCQs", "60 minutes", "70%"],
      ["CyberTantra 201", "ADMIN", "75 MCQs", "90 minutes", "75%"],
    ],
    banks: [
      { count: "500+", label: "PAM question bank" },
      { count: "500+", label: "EPM question bank" },
      { count: "500+", label: "CyberTantra question bank" },
    ],
    notes: [
      "Randomised questions — no two tests alike",
      "Auto-graded with instant results",
      "Retake available after 7 days if not passed",
    ],
  },

  // ---- Your Certificate -------------------------------------------------
  certificate: {
    eyebrow: "Your Certificate",
    heading: "A credential you can prove",
    intro:
      "Pass your exam and a certificate is generated automatically — complete with a unique ID, QR code and public validation URL.",
    includes: [
      { text: "Candidate name & certification title" },
      { text: "Issue date & validity period" },
      { text: "Unique Certificate ID", sample: "IRJ-PAM101-2026-000123" },
      { text: "Scannable QR code & public validation URL" },
      { text: "Signature & official Iraje seal" },
    ],
    reveal:
      "On passing, you'll receive a congratulations email with your PDF certificate attached, plus download and verification links.",
    verifyCta: { label: "Verify a certificate", href: "#verify" },
    sample: {
      org: "Iraje University",
      kicker: "Certified Associate",
      code: "PAM 101",
      title: "Privileged Access Management Fundamentals",
      intro: "This certifies that",
      name: "John Smith",
      course:
        "has successfully completed Iraje PAM 101 — Privileged Access Management Fundamentals.",
      meta: [
        { label: "Issued On", value: "15 June 2026" },
        { label: "Certificate ID", value: "IRJ-PAM101-2026-000123" },
        { label: "Valid through", value: "15 June 2029" },
      ],
    },
  },

  // ---- Certification Roadmap -------------------------------------------
  roadmap: {
    eyebrow: "Certification Roadmap",
    heading: "A path from Associate to Expert",
    intro:
      "Launching with Associate and Administrator levels across all three tracks — with Professional and Expert tiers on the roadmap.",
    levels: [
      {
        level: "Level 01",
        title: "Associate",
        items: ["PAM 101", "EPM 101", "CyberTantra 101"],
        status: "Available",
      },
      {
        level: "Level 02",
        title: "Administrator",
        items: ["PAM 201", "EPM 201", "CyberTantra 201"],
        status: "Available",
      },
      {
        level: "Level 03",
        title: "Professional",
        items: ["PAM 301", "EPM 301", "CyberTantra 301"],
        status: "Roadmap",
      },
      {
        level: "Level 04",
        title: "Expert",
        items: ["PAM Architect", "EPM Architect", "CyberTantra Architect"],
        status: "Roadmap",
      },
    ],
  },

  // ---- Verification Portal ---------------------------------------------
  verify: {
    eyebrow: "Verification Portal",
    heading: "Verify an Iraje certificate",
    intro:
      "Employers and customers can confirm any Iraje certification instantly. Search by certificate number or candidate email.",
    placeholder: "e.g. IRJ-PAM101-2026-000123",
    cta: "Verify",
    hint: "Demo — try: IRJ-PAM101-2026-000123",
  },

  // ---- Enroll / Registration -------------------------------------------
  enroll: {
    eyebrow: "Enroll",
    heading: "Register for certification",
    intro:
      "Tell us about yourself and select the certifications you'd like to pursue. Your request goes to our team for approval.",
    detailStep: {
      label: "Step 1 · Your details",
      // `name` is the key the field is submitted under — it must match the
      // columns the /api/enroll route expects.
      fields: [
        { name: "name", label: "Full Name", required: true, placeholder: "John Smith" },
        { name: "email", label: "Business Email", required: true, placeholder: "john@company.com", type: "email" },
        { name: "mobile", label: "Mobile Number", required: true, placeholder: "+91 ..." },
        { name: "organization", label: "Organization", required: true, placeholder: "Company name" },
        { name: "designation", label: "Designation", required: false, placeholder: "e.g. Security Engineer" },
        { name: "country", label: "Country", required: true, placeholder: "India" },
      ],
    },
    backgroundStep: {
      label: "Professional background",
      // Every dropdown ends with "Other" so nobody is forced into a bucket
      // that doesn't describe them.
      fields: [
        {
          name: "experience",
          label: "Years of Experience",
          required: false,
          placeholder: "Select…",
          type: "select",
          options: [
            "0–1 years",
            "1–3 years",
            "3–5 years",
            "5–8 years",
            "8–12 years",
            "12+ years",
            "Other",
          ],
        },
        {
          name: "domain",
          label: "Technology Domain",
          required: false,
          placeholder: "Select…",
          type: "select",
          options: [
            "Privileged Access Management (PAM)",
            "Endpoint Security / EPM",
            "Identity & Access Management (IAM)",
            "Network & Infrastructure Security",
            "Cloud Security",
            "IT Audit, Risk & Compliance",
            "Other",
          ],
        },
        {
          name: "existingCustomer",
          label: "Existing Customer?",
          required: false,
          placeholder: "Select…",
          type: "select",
          options: [
            "No",
            "Yes — using PAM",
            "Yes — using EPM",
            "Yes — using both",
            "In evaluation / PoC",
            "Other",
          ],
        },
        {
          name: "existingPartner",
          label: "Existing Partner?",
          required: false,
          placeholder: "Select…",
          type: "select",
          options: [
            "No",
            "Yes — Reseller",
            "Yes — Distributor",
            "Yes — System Integrator",
            "Yes — MSSP / Managed Services",
            "In discussion",
            "Other",
          ],
        },
      ],
    },
    certStep: {
      label: "Step 2 · Choose certifications",
      required: true,
      options: [
        { code: "PAM 101", level: "Associate" },
        { code: "PAM 201", level: "Administrator" },
        { code: "EPM 101", level: "Associate" },
        { code: "EPM 201", level: "Administrator" },
        { code: "CyberTantra 101", level: "Associate" },
        { code: "CyberTantra 201", level: "Administrator" },
      ],
    },
    submit: "Submit registration request",
    note: "What happens next? Once approved, you'll receive an email with your login URL, username and a temporary password to access the Iraje University.",
  },

  // ---- Footer (Iraje University) ---------------------------------------
  footer: {
    brand: "Iraje University",
    badge: "Certification Program",
    tagline:
      "Industry-recognised certifications in privileged access, endpoint security and identity — built on two decades of security expertise.",
    columns: [
      {
        title: "Certifications",
        links: [
          { name: "PAM 101 & 201", href: "#tracks" },
          { name: "EPM 101 & 201", href: "#tracks" },
          { name: "CyberTantra 101 & 201", href: "#tracks" },
          { name: "Roadmap", href: "#roadmap" },
        ],
      },
      {
        title: "Program",
        links: [
          { name: "How It Works", href: "#how" },
          { name: "Exam Rules", href: "#exam" },
          { name: "Certificate", href: "#certificate" },
          { name: "Verify a Certificate", href: "#verify" },
        ],
      },
      {
        title: "Iraje",
        links: [
          { name: "Iraje Home", href: "/" },
          { name: "Courses", href: "/university" },
          { name: "Contact Us", href: "/contact" },
        ],
      },
    ],
    copyright: "© Iraje Software. All rights reserved.",
   
  },
};

export default certification;
