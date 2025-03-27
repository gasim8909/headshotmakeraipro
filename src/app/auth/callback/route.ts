import { createClient } from "../../../../supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Get URL and params from the request
  const requestUrl = new URL(request.url);
  
  // Log all searchParams for debugging
  const paramsObj: Record<string, string> = {};
  requestUrl.searchParams.forEach((value, key) => {
    paramsObj[key] = key === 'code' ? `${value.substring(0, 5)}...` : value; // Only show part of code for security
  });
  console.log("Auth callback received with params:", paramsObj);
  
  const code = requestUrl.searchParams.get("code");
  const redirect_to = requestUrl.searchParams.get("redirect_to");
  const error = requestUrl.searchParams.get("error");
  const error_description = requestUrl.searchParams.get("error_description");
  
  // Determine the correct site URL/origin for different environments
  let origin = requestUrl.origin;
  
  // If we're in production but on localhost, override it
  if (origin.includes('localhost') && process.env.NODE_ENV === 'production') {
    origin = 'https://headshotmakerpro.com';
    console.log("Overriding localhost origin to production URL in callback");
  }

  // Check for OAuth error
  if (error) {
    console.error(`Auth provider error: ${error}`, error_description);
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(error_description || error)}`, origin)
    );
  }

  if (!code) {
    console.error("No code parameter found in callback URL");
    return NextResponse.redirect(
      new URL("/sign-in?error=Missing+authentication+code", origin)
    );
  }

  try {
    const supabase = await createClient();
    
    // Log that we're attempting to exchange the code
    console.log("Attempting to exchange auth code for session");
    
    // Exchange the code for a session - Supabase handles PKCE internally
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("Error exchanging code for session:", error);
      return NextResponse.redirect(
        new URL(`/sign-in?error=${encodeURIComponent(error.message)}`, origin)
      );
    }
    
    if (!data.session) {
      console.error("No session data returned from exchangeCodeForSession");
      return NextResponse.redirect(
        new URL("/sign-in?error=Authentication+failed", origin)
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
    const response = NextResponse.redirect(new URL(redirectTo, origin));
    console.log("Redirecting after successful authentication to:", new URL(redirectTo, origin).toString());
    
    return response;
    
  } catch (err) {
    console.error("Unexpected error in callback handler:", err);
    return NextResponse.redirect(
      new URL("/sign-in?error=Unexpected+authentication+error", origin)
    );
  }
}
