import { createClient } from "../../../../supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  console.log("=== AUTH CALLBACK DEBUG START ===");
  
  try {
    console.log("Auth callback handler invoked");
    
    // Get URL and params from the request
    const requestUrl = new URL(request.url);
    
    // Log all searchParams for debugging
    const paramsObj: Record<string, string> = {};
    requestUrl.searchParams.forEach((value, key) => {
      paramsObj[key] = key === 'code' ? `${value.substring(0, 5)}...` : value; // Only show part of code for security
    });
    console.log("Auth callback received with params:", paramsObj);
    console.log("Full callback URL (without code):", request.url.replace(/code=[^&]+/, "code=REDACTED"));
    
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

    const supabase = await createClient();
    
    // Log that we're attempting to exchange the code
    console.log("Attempting to exchange auth code for session");
    
    // Exchange the code for a session - Supabase handles PKCE internally
    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (sessionError) {
      console.error("Error exchanging code for session:", sessionError);
      return NextResponse.redirect(
        new URL(`/sign-in?error=${encodeURIComponent(sessionError.message)}`, origin)
      );
    }
    
    if (!data.session) {
      console.error("No session data returned from exchangeCodeForSession");
      return NextResponse.redirect(
        new URL("/sign-in?error=Authentication+failed", origin)
      );
    }
    
    // Log successful authentication
    console.log("Session established successfully for user:", data.session.user.id);
    
    // Explicitly update user data in profiles table if needed
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (userData.user) {
        console.log("Attempting to update user profile for:", userData.user.id);
        
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
      } else {
        console.log("No user data available to update profile");
      }
    } catch (profileErr) {
      console.error("Error updating user profile:", profileErr);
      // Continue with login despite profile update errors
    }
    
    // URL to redirect to after sign in process completes
    const redirectTo = redirect_to || "/dashboard";
    
    // Create response with redirect
    const response = NextResponse.redirect(new URL(redirectTo, origin));
    console.log("Redirecting after successful authentication to:", new URL(redirectTo, origin).toString());
    console.log("=== AUTH CALLBACK DEBUG END ===");
    
    return response;
    
  } catch (err) {
    console.error("=== AUTH CALLBACK CRITICAL ERROR ===");
    console.error("Unexpected error in callback handler:", err);
    
    // Enhanced error logging
    const errorInfo = err instanceof Error 
      ? {
          name: err.name,
          message: err.message,
          stack: err.stack?.split("\n").slice(0, 5).join("\n"),
          cause: err.cause ? String(err.cause) : undefined
        }
      : String(err);
      
    console.error("Error details:", errorInfo);
    console.log("=== AUTH CALLBACK DEBUG END ===");
    
    // Determine redirect URL based on potential error details
    let errorMessage = "Unexpected authentication error";
    if (err instanceof Error) {
      if (err.message.includes("PKCE")) {
        errorMessage = "Authentication code verification failed";
      } else if (err.message.includes("expired")) {
        errorMessage = "Authentication code expired";
      }
    }
    
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(errorMessage)}`, 
              process.env.NODE_ENV === 'production' ? 'https://headshotmakerpro.com' : 'http://localhost:3000')
    );
  }
}
