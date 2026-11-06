// ===========================================================================
// Events page content — transcribed from the Events design screenshots.
// Edit copy here, not inline in JSX (per project convention).
//
// Each event: date + location (shown as "20 Jul 2024 · Mumbai"), the title as
// it breaks onto two lines in the design, and the recap shown after "Read More".
// `images`: the event's photos, shown as a slider with ‹ › buttons. Put the files in
// public/images/events/ and list them here. An empty list draws a blue placeholder.
// ===========================================================================

const events = {
  // ---- Video ------------------------------------------------------------
  // `youtubeId`: the ID from the YouTube link (https://youtu.be/<ID>). The video
  // plays on the page, with a "Watch on YouTube" link underneath. To change the
  // video, paste the new ID here.
  // Or, for a file hosted on the site instead: clear youtubeId and set `src`
  // (e.g. "/videos/iraje-live.mp4") and optionally `poster`.
  // With neither set, a placeholder is drawn.
  video: {
    youtubeId: "ndsYcj6YRLM",
    title: "Iraje at GISEC Dubai 2026",
    watchOnYoutube: "Watch on YouTube",
    src: null,
    poster: null,
    badge: "LIVE",
    caption: "Iraje Live · Mumbai Studio",
  },

  // ---- Archive ----------------------------------------------------------
  archive: {
    eyebrow: "The Archive",
    heading: "Events that happened",
    intro:
      "Talks, booths, roundtables and training — a look back at where Iraje showed up. Tap any card for the full recap and gallery.",
    readMore: "Read More...",
    readLess: "Show less",
    // The tab selected when the page opens.
    defaultTab: "2026",
    // Tabs appear in this order: newest year first, Upcoming Event last.
    tabs: [
      { id: "2026", label: "2026" },
      { id: "2025", label: "2025" },
      { id: "2024", label: "2024" },
      { id: "upcoming", label: "Upcoming Event" },
    ],
  },

  // ---- Events, by tab id ------------------------------------------------
  byTab: {
    // Empty until the next event is announced; the tab then shows "No events here yet."
    // When an event happens, move it into its year's list and rewrite the text in past tense.
    upcoming: [],

    2026: [
      {
        date: "30-31 Jan 2026",
        location: "Manesar",
        titleLines: ["Digital CXOs Horizon", "Manesar"],
        images: ["/images/events/2026-01-30-digital-cxos-horizon-manesar-1.png"],
        description:
          "Iraje Software participated in Digital CXOs Horizon in Manesar, connecting with senior technology and business leaders to discuss the changing digital landscape. The event provided a valuable platform to exchange ideas on digital transformation, cybersecurity, and enterprise technology, while building meaningful connections with industry peers.",
      },
      {
        date: "06 Feb 2026",
        location: "Chennai",
        titleLines: ["Cybersecurity & AI", "Conference"],
        images: [
          "/images/events/2026-02-06-cybersecurity-ai-chennai-1.png",
          "/images/events/2026-02-06-cybersecurity-ai-chennai-2.png",
          "/images/events/2026-02-06-cybersecurity-ai-chennai-3.png",
          "/images/events/2026-02-06-cybersecurity-ai-chennai-4.png",
        ],
        description:
          "Iraje Software participated in the Cybersecurity and AI Conference 2026 in Chennai, engaging with CXOs, CISOs, and technology leaders on the convergence of AI and cybersecurity. The event offered an excellent opportunity to explore emerging security challenges, share industry insights, and connect with the wider cybersecurity community.",
      },
      {
        date: "08 May 2026",
        location: "Mumbai",
        titleLines: ["IDAM Summit ETCISO", "Mumbai"],
        images: [
          "/images/events/2026-05-08-etciso-idam-mumbai-1.png",
          "/images/events/2026-05-08-etciso-idam-mumbai-2.png",
          "/images/events/2026-05-08-etciso-idam-mumbai-3.png",
          "/images/events/2026-05-08-etciso-idam-mumbai-4.png",
          "/images/events/2026-05-08-etciso-idam-mumbai-5.png",
        ],
        description:
          "Iraje Software participated in the ETCISO IDAM Summit 2026 in Mumbai, engaging with industry leaders on the evolving role of Identity and Access Management in modern enterprises. The event brought valuable conversations around identity security, access governance, digital trust, and securing the enterprise in an AI-driven world.",
      },
      {
        date: "16 May 2026",
        location: "Bangalore",
        titleLines: ["Aspiring CXO Awards", "South Bangalore"],
        images: [
          "/images/events/2026-05-16-aca-south-bangalore-1.png",
          "/images/events/2026-05-16-aca-south-bangalore-2.png",
          "/images/events/2026-05-16-aca-south-bangalore-3.png",
          "/images/events/2026-05-16-aca-south-bangalore-4.png",
          "/images/events/2026-05-16-aca-south-bangalore-5.png",
        ],
        description:
          "Iraje Software participated in ACA - South 2026 in Bangalore, continuing its engagement with cybersecurity and technology leaders across the region. The event offered an opportunity to discuss emerging security priorities, including Privileged Access Management, Endpoint Privilege Management, and Identity Security, while building meaningful connections with enterprise decision-makers.",
      },
      {
        date: "09 Aug 2026",
        location: "Delhi",
        titleLines: ["Aspiring CXO Awards", "North Delhi"],
        images: [
          "/images/events/2026-08-aca-north-delhi-1.png",
          "/images/events/2026-08-aca-north-delhi-2.png",
          "/images/events/2026-08-aca-north-delhi-3.png",
          "/images/events/2026-08-aca-north-delhi-4.png",
          "/images/events/2026-08-aca-north-delhi-5.png",
        ],
        description:
          "Iraje Software was delighted to be part of ACA - North 2026 in Delhi, connecting with leading technology and cybersecurity professionals. The event brought valuable conversations around identity-driven security, privileged access, and endpoint protection, allowing Iraje Software to share its vision for helping enterprises achieve greater control, visibility, and security.",
      },
      {
        date: "16-18 Sep 2026",
        location: "Dubai",
        titleLines: ["GISEC DWTC", "Dubai"],
        images: [
          "/images/events/2026-09-16-gisec-dubai-1.png",
          "/images/events/2026-09-16-gisec-dubai-2.png",
          "/images/events/2026-09-16-gisec-dubai-3.png",
          "/images/events/2026-09-16-gisec-dubai-4.png",
          "/images/events/2026-09-16-gisec-dubai-5.png",
        ],
        description:
          "Iraje Software participated in GISEC GLOBAL 2026 in Dubai, connecting with cybersecurity leaders, technology innovators, and industry professionals from around the world. The event provided a global platform to showcase Iraje Software's approach to PAM, EPM, and Identity Security, while engaging in conversations shaping the future of enterprise cybersecurity.",
      },
      {
        date: "31 Oct 2026",
        location: "Mumbai",
        titleLines: ["Aspiring CXO Awards", "West Mumbai"],
        images: [
          "/images/events/2026-10-31-aca-west-mumbai-1.png",
          "/images/events/2026-10-31-aca-west-mumbai-2.png",
          "/images/events/2026-10-31-aca-west-mumbai-3.png",
          "/images/events/2026-10-31-aca-west-mumbai-4.png",
          "/images/events/2026-10-31-aca-west-mumbai-5.png",
          "/images/events/2026-10-31-aca-west-mumbai-6.png",
        ],
        description:
          "Iraje Software participated in ACA - West 2026 in Mumbai, bringing its expertise in Privileged Access Management, Endpoint Privilege Management, and Identity Security to an audience of technology leaders and cybersecurity professionals. The event offered a valuable opportunity to engage with industry peers, exchange insights, and explore the evolving security challenges facing modern enterprises.",
      },
    ],

    2025: [
      {
        date: "19 Apr 2025",
        location: "Ludhiana",
        titleLines: ["Punjab Chapter Event CIO", "Association Ludhiana"],
        images: [
          "/images/events/2025-04-19-cio-punjab-ludhiana-1.png",
          "/images/events/2025-04-19-cio-punjab-ludhiana-2.png",
          "/images/events/2025-04-19-cio-punjab-ludhiana-3.png",
          "/images/events/2025-04-19-cio-punjab-ludhiana-4.png",
        ],
        description:
          "Iraje Software was part of the CIO Association Punjab Chapter Event in Ludhiana, connecting with technology leaders and decision-makers from the region. The event fostered valuable discussions around enterprise technology, cybersecurity, and digital transformation while creating opportunities for meaningful industry engagement.",
      },
      {
        date: "10 May 2025",
        location: "Bangalore",
        titleLines: ["Aspiring CXO Awards", "South Bangalore"],
        images: [
          "/images/events/2025-05-10-aca-south-bangalore-1.png",
          "/images/events/2025-05-10-aca-south-bangalore-2.png",
          "/images/events/2025-05-10-aca-south-bangalore-3.png",
          "/images/events/2025-05-10-aca-south-bangalore-4.png",
          "/images/events/2025-05-10-aca-south-bangalore-5.png",
        ],
        description:
          "Iraje Software was proud to participate in ACA - South 2025 in Bangalore, connecting with technology and cybersecurity leaders from across South India. The event enabled meaningful discussions around privileged access, endpoint security, and identity protection, while providing an opportunity to exchange industry insights and explore the changing security requirements of modern enterprises.",
      },
      {
        date: "02 Aug 2025",
        location: "Delhi",
        titleLines: ["Aspiring CXO Awards", "North Delhi"],
        images: [
          "/images/events/2025-08-02-aca-north-delhi-1.png",
          "/images/events/2025-08-02-aca-north-delhi-2.png",
          "/images/events/2025-08-02-aca-north-delhi-3.png",
          "/images/events/2025-08-02-aca-north-delhi-4.png",
          "/images/events/2025-08-02-aca-north-delhi-5.png",
        ],
        description:
          "At ACA - North 2025 in Delhi, Iraje Software engaged with cybersecurity professionals, technology leaders, and enterprise decision-makers to discuss the evolving identity and access security landscape. The event created valuable opportunities to exchange perspectives on PAM, EPM, and Identity Security and explore practical approaches to strengthening enterprise security.",
      },
      {
        date: "09 Aug 2025",
        location: "Bangalore",
        titleLines: ["Empowering CXOs", "Cywayz Bangalore"],
        images: [
          "/images/events/2025-08-09-empowering-cxos-bangalore-1.png",
          "/images/events/2025-08-09-empowering-cxos-bangalore-2.png",
          "/images/events/2025-08-09-empowering-cxos-bangalore-3.png",
          "/images/events/2025-08-09-empowering-cxos-bangalore-4.png",
          "/images/events/2025-08-09-empowering-cxos-bangalore-5.png",
        ],
        description:
          "Iraje Software participated in Empowering CXOs 2025 in Bangalore, connecting with cybersecurity and technology leaders to exchange perspectives on leadership, digital transformation, and enterprise security. The event provided a valuable platform for meaningful conversations around building resilient and future-ready organizations.",
      },
      {
        date: "03-05 Dec 2025",
        location: "Delhi",
        titleLines: ["DSCI AISS", "DELHI 2025"],
        images: [
          "/images/events/2025-12-03-dsci-aiss-delhi-1.png",
          "/images/events/2025-12-03-dsci-aiss-delhi-2.png",
        ],
        description:
          "Iraje Software participated in DSCI AISS 2025 in New Delhi, joining one of India's prominent cybersecurity forums for discussions on security leadership, privacy, emerging technologies, cyber resilience, and the evolving threat landscape. The event provided an opportunity to engage with security leaders and contribute to meaningful industry conversations.",
      },
      {
        date: "08 Nov 2025",
        location: "Mumbai",
        titleLines: ["Aspiring CXO Awards", "West Mumbai"],
        images: [
          "/images/events/2025-11-08-aca-west-mumbai-1.png",
          "/images/events/2025-11-08-aca-west-mumbai-2.png",
          "/images/events/2025-11-08-aca-west-mumbai-3.png",
          "/images/events/2025-11-08-aca-west-mumbai-4.png",
          "/images/events/2025-11-08-aca-west-mumbai-5.png",
        ],
        description:
          "Iraje Software returned to ACA - West 2025 in Mumbai, engaging with industry leaders and cybersecurity professionals on the challenges of securing today's enterprise environments. Discussions focused on privileged access, endpoint control, and identity security, making the event a valuable platform for knowledge sharing, networking, and meaningful industry conversations.",
      },
    ],

    2024: [
      {
        date: "20 Jul 2024",
        location: "Mumbai",
        titleLines: ["Mumbai Annual Conclave", "CIO Association"],
        images: [
          "/images/events/2024-07-20-cio-conclave-mumbai-1.png",
          "/images/events/2024-07-20-cio-conclave-mumbai-2.png",
        ],
        description:
          "Iraje Software was pleased to be part of ACA Mumbai 2024, engaging with cybersecurity leaders, technology professionals, and business decision-makers from across the region. The event provided an excellent platform to exchange insights on evolving enterprise security challenges, with discussions around Privileged Access Management, Endpoint Privilege Management, and Identity Security. It was a valuable opportunity to connect with industry peers, share expertise, and explore new approaches to building more secure and resilient digital environments.",
      },
      {
        date: "22 Oct 2024",
        location: "Mumbai",
        titleLines: ["Aspiring CXO Awards", "Mumbai"],
        images: [
          "/images/events/2024-10-22-aca-mumbai-5.png",
          "/images/events/2024-10-22-aca-mumbai-1.png",
          "/images/events/2024-10-22-aca-mumbai-2.png",
          "/images/events/2024-10-22-aca-mumbai-3.png",
          "/images/events/2024-10-22-aca-mumbai-4.png",
        ],
        description:
          "Iraje Software participated in ACA Mumbai 2024, bringing together cybersecurity leaders, technology professionals, and business decision-makers from across the region. The event provided an engaging platform to discuss evolving enterprise security challenges, with conversations around Privileged Access Management, Endpoint Privilege Management, and Identity Security. It was a valuable opportunity for Iraje Software to connect with industry peers and share perspectives on building stronger and more secure digital environments.",
      },
    ],
  },
};

export default events;
