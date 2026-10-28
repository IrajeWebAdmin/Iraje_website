import Link from "next/link";
import LogoutButton from "@/components/Auth/LogoutButton";
import { getCurrentUser } from "@/lib/dal";

// Top bar for the signed-in admin pages. "(panel)" is a route group: the
// brackets keep it out of the URL, so this folder's pages are still /admin/...
//
// This layout only *displays* who is signed in. It is not the security check —
// layouts don't re-run on every navigation, so each page calls requireAdmin().
export default async function AdminPanelLayout({ children }) {
  const user = await getCurrentUser();

  return (
    <>
      <header className="border-b border-mist bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin/enrollments" className="font-semibold text-brand">
              Iraje Admin
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/admin/enrollments" className="text-ink hover:text-brand">
                Certification requests
              </Link>
              <Link href="/admin/learners" className="text-ink hover:text-brand">
                Learners
              </Link>
              <Link href="/admin/materials" className="text-ink hover:text-brand">
                Study materials
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-shuttle">
            {user && <span className="hidden sm:inline">{user.email}</span>}
            <Link href="/admin/change-password" className="hover:text-brand">
              Change password
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </>
  );
}
