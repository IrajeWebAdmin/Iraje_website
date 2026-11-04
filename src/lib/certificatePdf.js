import "server-only";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// Builds the certificate PDF. If the certification has a "Certificate design"
// uploaded in Sanity, the details are printed into its empty spaces; otherwise
// a plain branded certificate is drawn, so the feature works without a design.
//
// Positions: each `y` is the text's baseline as a fraction of the visible page's
// height measured from its BOTTOM edge (0.5 = middle); each `x` a fraction of
// its width from the LEFT edge. `align: "center"` centres the text on x,
// `"left"` starts it at x. (The visible page is the crop box, which in the
// Iraje designs starts 8.6pt above y = 0, so both reading the labels and
// drawing must measure from the same box.)
//
// The Iraje designs (A4 landscape) differ slightly from course to course, and
// get re-uploaded, so the layout is worked out from each design's own labels
// (see designLayout): the name goes between "…presented to" and "On Completing",
// the number after "Certificate ID :", the organisation after "Organization
// Name :", and the date above "DATE". The design must leave those spaces EMPTY.
const LABELS = {
  presented: "This certificate is proudly presented to",
  completing: "On Completing",
  number: "Certificate ID :",
  organization: "Organization Name :",
  date: "DATE",
};

// Used only if a design is missing one of the labels above (measured from the
// EPM101 design uploaded on 29 Oct 2026).
const DESIGN_LAYOUT = {
  name: {
    x: 0.638,
    y: 0.503,
    size: 40,
    font: "bold",
    color: "black",
    align: "center",
    maxWidth: 0.5,
  },
  number: {
    x: 0.565,
    y: 0.351,
    size: 14,
    font: "boldItalic",
    color: "blue",
    align: "left",
    maxWidth: 0.3,
  },
  organization: {
    x: 0.621,
    y: 0.312,
    size: 14,
    font: "boldItalic",
    color: "blue",
    align: "left",
    maxWidth: 0.3,
  },
  issued: {
    x: 0.827,
    y: 0.169,
    size: 13,
    font: "bold",
    color: "black",
    align: "center",
    maxWidth: 0.2,
  },
};

// Measured on the five Iraje designs (CT100, PAM101, PAM201, EPM101, EPM201)
// in Nov 2026, in points on the 595.5pt-high page: the rule the name sits on
// is 137.6pt below the "…presented to" baseline in every design, the rule over
// "DATE" is 23.4pt above the "DATE" baseline, and the date's baseline sits
// 2.5pt above its rule. The name gets the same 2.5pt, so both sit on their line.
const PAGE_HEIGHT = 595.5;
const NAME_RULE_BELOW_PRESENTED = 137.6 / PAGE_HEIGHT;
const DATE_RULE_ABOVE_DATE = 23.4 / PAGE_HEIGHT;
const ABOVE_RULE = 2.5 / PAGE_HEIGHT;

// The plain certificate drawn when no design is uploaded.
const PLAIN_LAYOUT = {
  name: {
    x: 0.5,
    y: 0.5,
    size: 34,
    font: "bold",
    color: "brand",
    align: "center",
    maxWidth: 0.8,
  },
  title: {
    x: 0.5,
    y: 0.41,
    size: 16,
    font: "regular",
    color: "ink",
    align: "center",
    maxWidth: 0.85,
  },
  number: {
    x: 0.5,
    y: 0.2,
    size: 11,
    font: "regular",
    color: "ink",
    align: "center",
    prefix: "Certificate No: ",
  },
  issued: {
    x: 0.3,
    y: 0.13,
    size: 11,
    font: "regular",
    color: "ink",
    align: "center",
    prefix: "Issued: ",
  },
  expires: {
    x: 0.7,
    y: 0.13,
    size: 11,
    font: "regular",
    color: "ink",
    align: "center",
    prefix: "Valid until: ",
  },
};

const COLORS = {
  ink: rgb(0.047, 0.118, 0.227), // #0C1E3A
  brand: rgb(0.016, 0.318, 0.8), // #0451CC
  black: rgb(0, 0, 0),
  blue: rgb(0.082, 0.376, 0.878), // the design's #1560E0
  grey: rgb(0.4, 0.4, 0.4),
};

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

// The built-in PDF fonts only know Western European characters. Swap common
// typographic punctuation for plain equivalents, and anything else for "?",
// rather than crash on an unusual name.
function printable(text) {
  return String(text)
    .replace(/[–—]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "?");
}

/**
 * certificate: { certificateNo, holderName, certificationTitle, certificationCode, issuedAt, expiresAt }
 * templateUrl: the Sanity file URL of the design, or null.
 * organization: the learner's organisation (from their enrolment request), or null.
 * Returns the PDF as a Uint8Array.
 */
export async function renderCertificatePdf(
  certificate,
  templateUrl,
  organization = null,
) {
  let pdf;
  let page;
  let layout = PLAIN_LAYOUT;
  if (templateUrl) {
    const res = await fetch(templateUrl);
    if (!res.ok)
      throw new Error(
        `Could not download the certificate design (${res.status})`,
      );
    const bytes = new Uint8Array(await res.arrayBuffer());
    layout = await designLayout(bytes);
    pdf = await PDFDocument.load(bytes);
    page = pdf.getPage(0);
  } else {
    pdf = await PDFDocument.create();
    page = pdf.addPage([842, 595]); // A4 landscape, in points
    drawPlainDesign(page, await pdf.embedFont(StandardFonts.HelveticaBold));
  }

  const fonts = {
    bold: await pdf.embedFont(StandardFonts.HelveticaBold),
    boldItalic: await pdf.embedFont(StandardFonts.HelveticaBoldOblique),
    regular: await pdf.embedFont(StandardFonts.Helvetica),
  };
  // Measure from the visible page (crop box), the same box findLabels reads.
  const box = page.getCropBox();
  const { width, height } = box;

  const values = {
    name: certificate.holderName,
    title: `${certificate.certificationCode} - ${certificate.certificationTitle}`,
    number: certificate.certificateNo,
    organization: organization || "—",
    issued: formatDate(certificate.issuedAt),
    expires: formatDate(certificate.expiresAt),
  };

  for (const [field, spec] of Object.entries(layout)) {
    const font = fonts[spec.font];
    const text = printable((spec.prefix ?? "") + values[field]);
    // Long names and organisations shrink to fit their space instead of overflowing.
    let size = spec.size;
    if (spec.maxWidth) {
      const fit = (width * spec.maxWidth) / font.widthOfTextAtSize(text, size);
      if (fit < 1) size = Math.max(8, size * fit);
    }
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x:
        box.x +
        (spec.align === "left"
          ? width * spec.x
          : width * spec.x - textWidth / 2),
      y: box.y + height * spec.y,
      size,
      font,
      color: COLORS[spec.color],
    });
  }

  pdf.setTitle(`Iraje certificate ${certificate.certificateNo}`);
  return pdf.save();
}

/**
 * Find the labels in the design and place each value next to its label.
 * Falls back to DESIGN_LAYOUT if the design can't be read or a label is missing.
 */
async function designLayout(bytes) {
  let found;
  try {
    found = await findLabels(bytes);
  } catch (err) {
    console.error("[certificate] could not read the design's labels:", err);
    return DESIGN_LAYOUT;
  }
  const { presented, completing, number, organization, date } = found;
  if (!presented || !completing || !number || !organization || !date) {
    console.warn(
      "[certificate] design is missing a label; using the default layout",
    );
    return DESIGN_LAYOUT;
  }

  const gap = 0.008; // a small space after "Certificate ID :" and "Organization Name :"
  return {
    // Sitting on the rule below it, like the date on its line.
    name: {
      ...DESIGN_LAYOUT.name,
      x: (presented.x0 + presented.x1) / 2,
      y: presented.y - NAME_RULE_BELOW_PRESENTED + ABOVE_RULE,
      maxWidth: (presented.x1 - presented.x0) * 1.1,
    },
    // On the same baseline as their labels.
    number: { ...DESIGN_LAYOUT.number, x: number.x1 + gap, y: number.y },
    organization: {
      ...DESIGN_LAYOUT.organization,
      x: organization.x1 + gap,
      y: organization.y,
    },
    // Just above the signature-style line that sits over "DATE".
    issued: {
      ...DESIGN_LAYOUT.issued,
      x: (date.x0 + date.x1) / 2,
      y: date.y + DATE_RULE_ABOVE_DATE + ABOVE_RULE,
    },
  };
}

/**
 * Each label's left/right edge and baseline on page 1, as fractions of the
 * visible page (its crop box) measured from that box's bottom-left corner.
 */
async function findLabels(bytes) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  // pdf.js takes ownership of the buffer it's given, so hand it a copy.
  const task = pdfjs.getDocument({
    data: bytes.slice(),
    verbosity: 0,
    isEvalSupported: false,
  });
  try {
    const doc = await task.promise;
    const pdfPage = await doc.getPage(1);
    // `view` is [left, bottom, right, top]; the Iraje designs' box starts at
    // y = 8.6, not 0, so subtract the corner before dividing by the size.
    const [left, bottom, right, top] = pdfPage.view;
    const width = right - left;
    const height = top - bottom;
    const { items } = await pdfPage.getTextContent();
    const found = {};
    for (const [key, label] of Object.entries(LABELS)) {
      const item = items.find(
        (i) => i.str?.trim().toLowerCase() === label.toLowerCase(),
      );
      if (item) {
        const x = item.transform[4] - left;
        const y = item.transform[5] - bottom;
        found[key] = {
          x0: x / width,
          x1: (x + item.width) / width,
          y: y / height,
        };
      }
    }
    return found;
  } finally {
    await task.destroy(); // in pdf.js v6 only the loading task can be destroyed
  }
}

function drawPlainDesign(page, bold) {
  const { width, height } = page.getSize();
  const { brand, ink } = COLORS;
  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    borderColor: brand,
    borderWidth: 3,
  });
  const heading = "Iraje University";
  page.drawText(heading, {
    x: width / 2 - bold.widthOfTextAtSize(heading, 20) / 2,
    y: height * 0.8,
    size: 20,
    font: bold,
    color: brand,
  });
  const sub = "CERTIFICATE OF COMPLETION";
  page.drawText(sub, {
    x: width / 2 - bold.widthOfTextAtSize(sub, 14) / 2,
    y: height * 0.7,
    size: 14,
    font: bold,
    color: ink,
  });
  const lead = "This certifies that";
  page.drawText(lead, {
    x: width / 2 - bold.widthOfTextAtSize(lead, 11) / 2,
    y: height * 0.59,
    size: 11,
    font: bold,
    color: ink,
  });
}
