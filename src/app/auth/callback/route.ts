import { createClient } from "../../../../supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirect_to = requestUrl.searchParams.get("redirect_to");

  if (!code) {
    console.error("No code parameter found in callback URL");
    return NextResponse.redirect(
      new URL("/sign-in?error=Missing+authentication+code", requestUrl.origin)
    );
  }

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
    
    // Explicitly update user data in profiles table if needed
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (userData.user) {
        const { error: profileError } = await supabase.from("users").upsert({
          id: userData.user.id,
          email: userData.user.email,
          user_id: userData.user.id,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });
        
        if (profileError) {
          console.error("Error updating user profile:", profileError);
        } else {
          console.log("User profile updated successfully");
        }
      }
    } catch (profileErr) {
      console.error("Error updating user profile:", profileErr);
      // Continue with login despite profile update errors
    }
    
    console.log("Session established successfully for user:", data.session.user.id);
    
    // URL to redirect to after sign in process completes
    const redirectTo = redirect_to || "/dashboard";
    
    // Create response with redirect
    const response = NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
    
    return response;
    
  } catch (err) {
    console.error("Unexpected error in callback handler:", err);
    return NextResponse.redirect(
      new URL("/sign-in?error=Unexpected+authentication+error", requestUrl.origin)
    );
  }
}
