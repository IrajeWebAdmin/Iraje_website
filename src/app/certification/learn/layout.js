import { getCurrentUser } from "@/lib/dal";
import PortalHeader from "@/components/Portal/PortalHeader";

// Chrome for the learning pages (course outline, modules, exam): the portal
// top bar instead of the site navbar. Every page under here still calls
// requireStudent() itself — this only needs the name for the user menu.
export default async function LearnLayout({ children }) {
  const user = await getCurrentUser();
  return (
    <div className="bg-catskill min-h-screen">
      <PortalHeader user={user} />
      {children}
    </div>
  );
}
