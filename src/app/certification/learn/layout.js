// Ground for the learning pages (course outline, modules, exam). Each page
// draws its own top bar: the portal header on most of them, and the exam's
// own bar (course, countdown, Submit) while a paper is open — which is why
// the header is not here.
export default function LearnLayout({ children }) {
  return <div className="bg-catskill min-h-screen">{children}</div>;
}
