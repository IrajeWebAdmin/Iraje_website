import ComingSoon from "@/components/ComingSoon";

// Global 404 handler: any unmatched route (or a notFound() call) renders the
// Coming Soon placeholder. Rendered inside the root layout only, so it fills
// the viewport without a navbar/footer.
export default function NotFound() {
  return <ComingSoon />;
}
