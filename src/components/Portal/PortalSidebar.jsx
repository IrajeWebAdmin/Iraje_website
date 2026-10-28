import Link from "next/link";
import {
  FiGrid,
  FiBook,
  FiAward,
  FiCheckSquare,
  FiTrendingUp,
  FiLogOut,
} from "react-icons/fi";
import { logout } from "@/app/actions/auth";

// The dashboard is one page for now, so every entry but "Dashboard" jumps to
// the matching section of it (ids set in dashboard/page.js). When those grow
// into pages of their own, only the hrefs here need to change.
const NAV = [
  {
    name: "Dashboard",
    href: "/certification/dashboard",
    icon: FiGrid,
    active: true,
  },
  { name: "My Courses", href: "#courses", icon: FiBook },
  { name: "Certifications", href: "#certifications", icon: FiAward },
  { name: "Exams", href: "#exams", icon: FiCheckSquare },
  { name: "Progress", href: "#progress", icon: FiTrendingUp },
];

const ITEM =
  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm whitespace-nowrap transition";

export default function PortalSidebar() {
  return (
    <aside className="border-mist rounded-2xl border bg-white p-2 lg:sticky lg:top-20">
      <nav aria-label="Dashboard">
        {/* A horizontal strip on small screens, a column from lg up. */}
        <ul className="flex gap-1 overflow-x-auto lg:flex-col">
          {NAV.map(({ name, href, icon: Icon, active }) => (
            <li key={name} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`${ITEM} ${
                  active
                    ? "text-brand bg-[#E8EEFF] font-semibold"
                    : "text-shuttle hover:bg-catskill hover:text-ink"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sign out lives in the user menu too, so it is hidden here on phones. */}
      <form
        action={logout}
        className="border-mist mt-2 hidden border-t pt-2 lg:block"
      >
        <button
          type="submit"
          className={`${ITEM} text-shuttle hover:bg-catskill hover:text-ink w-full`}
        >
          <FiLogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </form>
    </aside>
  );
}
