import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";

export default async function CreatePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect based on authentication status
  if (user) {
    // User is logged in, check subscription status
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    // Redirect to the appropriate page based on subscription status
    if (subscription) {
      return redirect("/create/subscribed");
    } else {
      return redirect("/create/free");
    }
  } else {
    // User is not logged in, redirect to guest page
    return redirect("/create/guest");
  }
}
