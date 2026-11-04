import { logout } from "@/app/actions/auth";

// A form, not a link: signing out changes data, so it must be a POST that
// another site can't trigger just by linking to it.
export default function LogoutButton({ className = "" }) {
  return (
    <form action={logout}>
      <button
        type="submit"
        className={`rounded-lg border border-mist px-3 py-1.5 text-sm text-ink transition hover:bg-catskill ${className}`}
      >
        Sign out
      </button>
    </form>
  );
}