// ===========================================================================
// About page content — transcribed from the Figma "Website" About frame
// (node 710:861). Edit copy here, not inline in JSX (per project convention).
// Some Figma strings were still placeholder ("Text Here", repeated rows); those
// are filled with clean, on-brand copy here — refine against final design.
// ===========================================================================

const about = {
  // ---- Hero -------------------------------------------------------------
  hero: {
    eyebrow: "About Iraje",
    titleLead: "Securing the keys to the",
    titleAccent: "enterprise.",
    body:
      "For over two decades, Iraje has helped organisations protect what matters most — their privileged accounts, endpoints and identities. We build security that's powerful for defenders and invisible to everyone else.",
    ctas: [
      { label: "Our story", href: "#who-we-are", primary: true },
      { label: "Get in touch", href: "/contact", primary: false },
    ],
  },

  // ---- Who we are -------------------------------------------------------
  whoWeAre: {
    eyebrow: "About Us",
    heading: "Who we are",
    body: [
      "Iraje is a privileged access security company. We help enterprises control, monitor and govern access to their most sensitive systems — the servers, databases, network devices and applications that run the business.",
      "Privileged accounts are the most powerful — and most targeted — credentials in any organisation. A single compromised admin account can lead to a catastrophic breach. Iraje was founded on a simple conviction: securing privileged access shouldn't require ripping apart your infrastructure or slowing your teams down.",
      "That conviction shaped our agentless architecture — security that deploys fast, scales cleanly and stays out of the way. Today our portfolio spans Iraje PAM (privileged access management), Iraje EPM (endpoint privilege management) and the upcoming Iraje IAM — backed by the Iraje Academy, where we train the next generation of defenders.",
      "We're engineers and security practitioners first. We measure success by one thing: whether our customers can sleep at night knowing their keys are safe.",
    ],
    image: "/images/about/about-team.png", // TODO: drop the team/laptop photo here
    cards: [
      {
        title: "Our Vision",
        body: "A world where identity is the trusted perimeter — where strong, frictionless access controls are the default, not the exception.",
      },
      {
        title: "Our Mission",
        body: "To make privileged access security simple, complete and accessible — so every organisation can defend its most critical systems with confidence.",
      },
      {
        title: "Our Values",
        body: "Text Here Text Here Text HereText Here Text Here Text HereText Here Text HerevText Herevvv .",
      },
    ],
    timeline: [
      {
        stage: "Origins",
        title: "Built by practitioners",
        body: "Iraje begins with a focus on solving privileged access for complex enterprise environments — the hard problems others avoided.",
      },
      {
        stage: "Iraje PAM",
        title: "Privileged Access Manager",
        body: "Our flagship PAM matures into a full Active-Active, Zero Trust platform trusted across regulated industries.",
      },
      {
        stage: "Iraje EPM",
        title: "Endpoint Privilege Manager",
        body: "Least-privilege enforcement extends to every endpoint — stopping escalation before it starts.",
      },
      {

        stage: "Today",
        title: "One identity platform",
        body: "PAM, EPM and IAM converge into a single platform to secure every privileged identity.",
      },
    ],
  },
  

  // ---- Customers --------------------------------------------------------
  customers: {
    eyebrow: "About Our Customers",
    heading: "Trusted where the stakes are highest",
    body:
      "Our customers operate in the most demanding, regulated environments in the world — where a security lapse isn't an inconvenience, it's a crisis. They choose Iraje because it works, scales and proves compliance.",
    industries: [
      { title: "Banking & Financial Services", body: "Securing privileged access across leading private, public-sector and cooperative banks." },
      { title: "Healthcare", body: "Protecting patient data and clinical systems while satisfying HIPAA and privacy regulations." },
      { title: "Manufacturing", body: "Eliminating shared admin credentials across plants, OT systems and distributed sites." },
      { title: "Government & PSU", body: "Hardened, auditable access control for sovereign and public-sector infrastructure." },
      { title: "IT / ITeS", body: "Managing third-party and vendor access to host systems and platforms during rollouts." },
      { title: "Telecom", body: "Privileged access control across sprawling, always-on network operations." },
    ],
    trustTitle: "Why customers trust Iraje",
    trustPoints: [
      { lead: "Fast to deploy", body: "agentless architecture means value in days, not months." },
      { lead: "Compliance-ready", body: "complete session audit trails for every privileged action." },
      { lead: "Built to scale", body: "from a single data centre to thousands of sessions a day." },
      { lead: "Partner in security", body: "responsive support and a team that knows your stack." },
    ],
    testimonials: [
      {
        quote: "Iraje gave us complete visibility over every privileged session — and made our audits dramatically faster.",
        author: "CISO, Leading Private Bank",
      },
      {
        quote: "We eliminated shared admin passwords across 30+ sites without sharing a single root credential.",
        author: "Head of IT Security, Global Manufacturer",
      },
    ],
    link: { label: "Read customer case studies", href: "/customers" },
  },

  // ---- Partners ---------------------------------------------------------
  partners: {
    eyebrow: "About Partners",
    heading: "Stronger together",
    body:
      "Our partners extend Iraje's reach and deliver security outcomes to customers worldwide. We invest in our ecosystem with training, certification and hands-on enablement — so partners can build a thriving practice around Iraje.",
    types: [
      { title: "Resellers & Distributors", body: "Bring Iraje's portfolio to new markets with margins and deal support." },
      { title: "System Integrators", body: "Design and deploy Iraje within larger programmes as a certified implementation partner." },
      { title: "MSSPs", body: "Deliver privileged access as a managed service, backed by Iraje's platform." },
      { title: "Technology Partners", body: "Integrate with Iraje to connect tools, identity and the broader security ecosystem." },
    ],
    offersTitle: "What partnering with Iraje offers",
    offers: [
      "Free partner training & certification through the Iraje Academy",
      "Deal registration and competitive margins",
      "Dedicated partner success and technical enablement",
      "Pre-sales support, demos and proof-of-concept assistance",
      "Co-marketing, leads and joint go-to-market",
      "Roadmap inputs and a route to your markets",
    ],
    cta: { label: "Become a partner", href: "/partners" },
  },

  // ---- Culture & Values -------------------------------------------------
  culture: {
    eyebrow: "About Culture & Values",
    heading: "What we believe",
    body:
      "Security is a responsibility, not a checkbox. The way we work reflects the way we build — with rigour, humility and a deep respect for the people who trust us.",
    items: [
      { title: "Security First", body: "Every decision is made with the customer's security posture in mind — starting with our own." },
      { title: "Customer Success", body: "We earn trust one deployment at a time — never a contract, a logo or 'good enough'." },
      { title: "Integrity & Trust", body: "We handle the keys to the kingdom, so we act with humility and honesty, always." },
      { title: "Innovation", body: "First-of-their-kind capabilities, shipped on a steady, customer-led cadence." },
      { title: "Simplicity", body: "Powerful security that's invisible to everyone but the people who need it." },
      { title: "One Team", body: "Engineers, support and field — one team accountable to each other and to you." },
    ],
    badges: [
      { label: "Engineering-led", icon: "/icons/Engineering-led.svg" },
      { label: "Always learning", icon: "/icons/Always-learning.svg" },
      { label: "Ownership & impact", icon: "/icons/Ownershi- &-impact.svg" },
      { label: "Customer-facing from day one", icon: "/icons/Customer-facing.svg" },
    ],
  },

  // ---- CTA --------------------------------------------------------------
  cta: {
    eyebrow: "Get in touch",
    heading: "Let's secure what matters most.",
    body:
      "Whether you're protecting your enterprise, building a partner practice, or joining our team — we'd love to talk.",
    ctas: [
      { label: "Contact Iraje", href: "/contact", primary: true },
      { label: "Become a Partner", href: "/partners", primary: false },
    ],
  },
};

export default about;
