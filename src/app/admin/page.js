import { redirect } from "next/navigation";

// /admin on its own goes straight to the requests queue.
export default function AdminHome() {
  redirect("/admin/enrollments");
}