import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import prismaPkg from "@prisma/client";

const { PrismaClient } = prismaPkg;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
const TEMP_PASSWORD_DAYS = 14;

function generateTempPassword() {
  const groups = [];
  for (let g = 0; g < 4; g++) {
    let group = "";
    for (let i = 0; i < 4; i++) group += ALPHABET[randomInt(ALPHABET.length)];
    groups.push(group);
  }
  return groups.join("-");
}

const [, , rawEmail, ...nameParts] = process.argv;
const email = String(rawEmail ?? "").trim().toLowerCase();
const name = nameParts.join(" ").trim();

if (!email.includes("@") || !name) {
  console.error(
    'Usage: node --env-file=.env scripts/create-admin.mjs <email> "<Full Name>"',
  );
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.role !== "admin") {
    console.error(`${email} already has a learner account — refusing to change it.`);
    process.exit(1);
  }

  const tempPassword = generateTempPassword();
  const data = {
    name,
    passwordHash: await bcrypt.hash(tempPassword, 12),
    mustChangePassword: true,
    tempPasswordExpiresAt: new Date(
      Date.now() + TEMP_PASSWORD_DAYS * 24 * 60 * 60 * 1000,
    ),
  };

  if (existing) {
    await prisma.user.update({ where: { id: existing.id }, data });
    // Sign the admin out everywhere, since the old password no longer works.
    await prisma.session.deleteMany({ where: { userId: existing.id } });
    console.log(`Reset the password for admin ${email}.`);
  } else {
    await prisma.user.create({ data: { ...data, email, role: "admin" } });
    console.log(`Created admin ${email}.`);
  }

  console.log(`Temporary password: ${tempPassword}`);
  console.log(`Sign in at /admin/login within ${TEMP_PASSWORD_DAYS} days.`);
} finally {
  await prisma.$disconnect();
}