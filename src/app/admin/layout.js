// Shell for everything under /admin. No marketing navbar or footer — this is a
// staff tool. robots: tells search engines never to list these pages.
export const metadata = {
  title: "Iraje Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return (
    <>
      {/* The page ground is painted on <html> as well as the wrapper, so the
          grey continues below the content however tall the window is. React
          hoists this into <head>; it goes away with the admin shell. */}
      <style
        href="admin-ground"
        precedence="default"
      >{`html{background-color:#f4f7fa}`}</style>
      <div className="bg-catskill text-ink min-h-screen antialiased">
        {children}
      </div>
    </>
  );
}
