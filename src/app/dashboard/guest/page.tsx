import { redirect } from "next/navigation";

export default function GuestDashboardRedirect() {
  return redirect("/create/guest");
}
