import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import AdminNav from "@/components/Admin/AdminNav";
import UserMenu from "@/components/Admin/UserMenu";

// Top bar for the signed-in admin pages: logo, the three sections in the
// middle (with the number of new requests on the first) and the signed-in
// admin's menu on the right. "(panel)" is a route group: the brackets keep it
// out of the URL, so this folder's pages are still /admin/...
//
// This layout only *displays* who is signed in. It is not the security check —
// layouts don't re-run on every navigation, so each page calls requireAdmin().
export default async function AdminPanelLayout({ children }) {
  const [user, pending] = await Promise.all([
    getCurrentUser(),
    prisma.enrollment.count({ where: { status: "new" } }),
  ]);

  const items = [
    {
      href: "/admin/enrollments",
      label: "Certification requests",
      count: pending,
    },
    { href: "/admin/reports", label: "Reports" },
    { href: "/admin/materials", label: "Study materials" },
  ];

  return (
    <>
      <header className="border-mist sticky top-0 z-30 border-b bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-2.5 sm:px-6">
          <Link
            href="/admin/enrollments"
            aria-label="Iraje Admin home"
            className="shrink-0"
          >
            <Image
              src="/images/navbar/company-logo-nav.png"
              alt="Iraje"
              width={72}
              height={35}
              priority
            />
          </Link>
          <div className="flex justify-center overflow-x-auto">
            <AdminNav items={items} />
          </div>
          {user ? <UserMenu name={user.name} email={user.email} /> : <span />}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </>
  );
}
