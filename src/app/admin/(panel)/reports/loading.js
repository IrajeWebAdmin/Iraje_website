import ReportSkeleton from "@/components/Admin/ReportSkeleton";

// Placeholder blocks while the overview computes, so the layout does not jump.
export default function Loading() {
  return <ReportSkeleton tiles={5} charts={2} />;
}
