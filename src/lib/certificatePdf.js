import "server-only";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// Builds the certificate PDF. If the certification has a "Certificate design"
// uploaded in Sanity, the details are printed into its empty spaces; otherwise
// a plain branded certificate is drawn, so the feature works without a design.
//
// TO FIT THE DESIGN: change the numbers in DESIGN_LAYOUT. Each `y` is the text's
// baseline as a fraction of the page height measured from the BOTTOM (0.5 =
// middle); each `x` a fraction of the width. `align: "center"` centres the text
// on x, `"left"` starts it at x. Adjust, download a certificate, look, repeat.

// The Iraje design (A4 landscape): "Name" on the line, then "Certificate ID :",
// "Organization Name :" and "Date" — the certification name is part of the
// artwork. The design must have these four spaces EMPTY.
const DESIGN_LAYOUT = {
  name: { x: 0.5, y: 0.554, size: 40, font: "bold", color: "black", align: "center", maxWidth: 0.48 },
  // Values start just after their labels ("Certificate ID :" ends at x 0.553,
  // "Organization Name :" at 0.581 in the blank designs).
  number: { x: 0.561, y: 0.439, size: 14, font: "boldItalic", color: "blue", align: "left", maxWidth: 0.3 },
  organization: { x: 0.589, y: 0.399, size: 14, font: "boldItalic", color: "blue", align: "left", maxWidth: 0.3 },
  issued: { x: 0.284, y: 0.271, size: 12, font: "bold", color: "grey", align: "center", maxWidth: 0.18 },
};

// The plain certificate drawn when no design is uploaded.
const PLAIN_LAYOUT = {
  name: { x: 0.5, y: 0.5, size: 34, font: "bold", color: "brand", align: "center", maxWidth: 0.8 },
  title: { x: 0.5, y: 0.41, size: 16, font: "regular", color: "ink", align: "center", maxWidth: 0.85 },
  number: { x: 0.5, y: 0.2, size: 11, font: "regular", color: "ink", align: "center", prefix: "Certificate No: " },
  issued: { x: 0.3, y: 0.13, size: 11, font: "regular", color: "ink", align: "center", prefix: "Issued: " },
  expires: { x: 0.7, y: 0.13, size: 11, font: "regular", color: "ink", align: "center", prefix: "Valid until: " },
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
export async function renderCertificatePdf(certificate, templateUrl, organization = null) {
  let pdf;
  let page;
  if (templateUrl) {
    const res = await fetch(templateUrl);
    if (!res.ok) throw new Error(`Could not download the certificate design (${res.status})`);
    pdf = await PDFDocument.load(await res.arrayBuffer());
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
  const { width, height } = page.getSize();

  const values = {
    name: certificate.holderName,
    title: `${certificate.certificationCode} - ${certificate.certificationTitle}`,
    number: certificate.certificateNo,
    organization: organization || "—",
    issued: formatDate(certificate.issuedAt),
    expires: formatDate(certificate.expiresAt),
  };

  const layout = templateUrl ? DESIGN_LAYOUT : PLAIN_LAYOUT;
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
      x: spec.align === "left" ? width * spec.x : width * spec.x - textWidth / 2,
      y: height * spec.y,
      size,
      font,
      color: COLORS[spec.color],
    });
  }

  pdf.setTitle(`Iraje certificate ${certificate.certificateNo}`);
  return pdf.save();
}

function drawPlainDesign(page, bold) {
  const { width, height } = page.getSize();
  const { brand, ink } = COLORS;
  page.drawRectangle({ x: 24, y: 24, width: width - 48, height: height - 48, borderColor: brand, borderWidth: 3 });
  const heading = "Iraje University";
  page.drawText(heading, { x: width / 2 - bold.widthOfTextAtSize(heading, 20) / 2, y: height * 0.8, size: 20, font: bold, color: brand });
  const sub = "CERTIFICATE OF COMPLETION";
  page.drawText(sub, { x: width / 2 - bold.widthOfTextAtSize(sub, 14) / 2, y: height * 0.7, size: 14, font: bold, color: ink });
  const lead = "This certifies that";
  page.drawText(lead, { x: width / 2 - bold.widthOfTextAtSize(lead, 11) / 2, y: height * 0.59, size: 11, font: bold, color: ink });
}
