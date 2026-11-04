import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeCertificateNumber } from "@/lib/learning";
import { createRateLimiter, clientIp } from "@/lib/rateLimit";

// 30 checks per 15 minutes per network: plenty for a person, too few to guess
// numbers by brute force (there are about a trillion per certification).
const limiter = createRateLimiter({ limit: 30, windowMs: 15 * 60 * 1000 });

// GET /api/certificates/verify?number=IRJ-PAM101-7K2Q-9XM4 — public.
// Answers only what a verifier needs; never the email or anything private.
export async function GET(request) {
  if (!limiter.check(clientIp(request)).allowed) {
    return NextResponse.json(
      { status: "error", message: "Too many checks. Please try again in a few minutes." },
      { status: 429 },
    );
  }

  const number = normalizeCertificateNumber(new URL(request.url).searchParams.get("number"));
  if (!number) {
    return NextResponse.json({
      status: "invalid",
      message: "That doesn't look like an Iraje certificate number (IRJ-XXX000-XXXX-XXXX).",
    });
  }

  const cert = await prisma.certificate.findUnique({ where: { certificateNo: number } });
  if (!cert) return NextResponse.json({ status: "not_found", number });

  const status =
    cert.status === "revoked" ? "revoked" : cert.expiresAt < new Date() ? "expired" : "valid";

  return NextResponse.json({
    status,
    number,
    holderName: cert.holderName,
    certificationCode: cert.certificationCode,
    certificationTitle: cert.certificationTitle,
    issuedAt: cert.issuedAt,
    expiresAt: cert.expiresAt,
  });
}
