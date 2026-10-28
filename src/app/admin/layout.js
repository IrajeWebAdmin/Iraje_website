// Shell for everything under /admin. No marketing navbar or footer — this is a
// staff tool. robots: tells search engines never to list these pages.
export const metadata = {
  title: "Iraje Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return <div className="min-h-screen bg-catskill text-ink antialiased">{children}</div>;
}