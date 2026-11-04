import prismaPkg from "@prisma/client";

const { PrismaClient } = prismaPkg;
const prisma = new PrismaClient();

// Same rules as src/lib/certCodes.js: "PAM 101" -> "PAM101", and the retired
// CyberTantra codes ("CT101", "CT201", "CyberTantra 101") -> "CT100".
const RETIRED = { CT101: "CT100", CT201: "CT100", CYBERTANTRA: "CT100" };
function normalizeCertCode(raw) {
  const compact = String(raw ?? "").toUpperCase().replace(/[\s_-]+/g, "");
  if (RETIRED[compact]) return RETIRED[compact];
  const match = compact.match(/^([A-Z]+)(\d{3})$/);
  if (!match) return null;
  const code = (match[1] === "CYBERTANTRA" ? "CT" : match[1]) + match[2];
  return RETIRED[code] ?? code;
}

try {
  const approved = await prisma.enrollment.findMany({
    where: { status: "approved", userId: { not: null } },
    select: { id: true, userId: true, certifications: true },
  });

  for (const e of approved) {
    const codes = [...new Set(e.certifications.split(",").map(normalizeCertCode).filter(Boolean))];
    for (const code of codes) {
      await prisma.userCertification.upsert({
        where: { userId_certificationCode: { userId: e.userId, certificationCode: code } },
        create: { userId: e.userId, certificationCode: code },
        update: {},
      });
      console.log(`request #${e.id}: user ${e.userId} -> ${code}`);
    }
  }
  console.log(`Done. Checked ${approved.length} approved request(s).`);
} finally {
  await prisma.$disconnect();
}