// One-off backfill for the admin report columns on certification requests:
// organization_key (cleaned organisation name) and certification_code (the
// first requested code, canonical). Safe to run again: only rows whose values
// differ are written.
//
//   node --env-file=.env scripts/backfill-report-columns.mjs
import { PrismaClient } from "@prisma/client";
import { organizationKey } from "../src/lib/organizations.js";
import { parseCertList } from "../src/lib/certCodes.js";

const prisma = new PrismaClient();
const BATCH = 500;

let cursor = 0;
let scanned = 0;
let updated = 0;

for (;;) {
  const rows = await prisma.enrollment.findMany({
    where: { id: { gt: cursor } },
    orderBy: { id: "asc" },
    take: BATCH,
    select: {
      id: true,
      organization: true,
      certifications: true,
      organizationKey: true,
      certificationCode: true,
    },
  });
  if (rows.length === 0) break;

  for (const row of rows) {
    const key = organizationKey(row.organization);
    const code = parseCertList(row.certifications)[0] ?? null;
    if (key !== row.organizationKey || code !== row.certificationCode) {
      await prisma.enrollment.update({
        where: { id: row.id },
        data: { organizationKey: key, certificationCode: code },
      });
      updated += 1;
    }
    scanned += 1;
    cursor = row.id;
  }
}

console.log(`backfill-report-columns: scanned ${scanned}, updated ${updated}`);
await prisma.$disconnect();
