"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Hands the course root over to the page the learner should be on, from the
// browser rather than with a server-side redirect(). A redirect thrown inside
// a Server Component during a client-side navigation trips a bug in the React
// build bundled with Next 16.2 ("cannot have a negative time stamp"), so the
// course page renders this instead and lets the router move on.
export default function OpenCourse({ href }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(href);
  }, [router, href]);

  return (
    <p
      className="border-mist text-shuttle mt-6 rounded-2xl border bg-white p-6 text-sm"
      aria-live="polite"
    >
      Opening your course…
    </p>
  );
}
