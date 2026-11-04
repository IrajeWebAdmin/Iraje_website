import Image from "next/image";
import Link from "next/link";
import UserMenu from "./UserMenu";

// Top bar of the learner portal: the Iraje logo on the left, the signed-in
// learner's menu (change password / logout) on the right. No site menu here —
// the portal is its own space, separate from the marketing pages. `user` may
// be null for the instant before a page redirects an unsigned visitor.
export default function PortalHeader({ user }) {
  return (
    <header className="border-mist sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Iraje Home">
          <Image
            src="/images/navbar/company-logo-nav.png"
            alt="Iraje Identity Security Platform Logo"
            width={90}
            height={32}
            priority
          />
        </Link>
        {user && <UserMenu name={user.name} />}
      </div>
    </header>
  );
}
