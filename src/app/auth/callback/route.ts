import { createClient } from "../../../../supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirect_to = requestUrl.searchParams.get("redirect_to");

  if (code) {
    try {
      const supabase = await createClient();
      
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error("Error exchanging code for session:", error);
        return NextResponse.redirect(
          new URL(`/sign-in?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
        );
      }
      
      if (!data.session) {
        console.error("No session data returned from exchangeCodeForSession");
        return NextResponse.redirect(
          new URL("/sign-in?error=Authentication+failed", requestUrl.origin)
        );
      }
      
      console.log("Session established successfully for user:", data.session.user.id);
    } catch (err) {
      console.error("Unexpected error in callback handler:", err);
      return NextResponse.redirect(
        new URL("/sign-in?error=Unexpected+authentication+error", requestUrl.origin)
      );
    }
  } else {
    console.error("No code parameter found in callback URL");
    return NextResponse.redirect(
      new URL("/sign-in?error=Missing+authentication+code", requestUrl.origin)
    );
  }

  // URL to redirect to after sign in process completes
  const redirectTo = redirect_to || "/dashboard";
  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
}
