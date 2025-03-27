import { createClient } from "../../../../supabase/server";
import { NextResponse } from "next/server";

// Mark this route as dynamic to ensure it runs server-side
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  console.log("=== AUTH CALLBACK HANDLER STARTED ===");
  
  try {
    // Parse the request URL
    const requestUrl = new URL(request.url);
    console.log("Auth callback URL:", requestUrl.toString());
    
    // Get authentication code
    const code = requestUrl.searchParams.get("code");
    console.log("Auth code present:", code ? "Yes" : "No");
    
    // Get error information if any
    const error = requestUrl.searchParams.get("error");
    const error_description = requestUrl.searchParams.get("error_description");
    
    // Set the base URL for redirects
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://headshotmakerpro.com' 
      : 'http://localhost:3000';
    console.log("Using base URL for redirects:", baseUrl);
    
    // Handle OAuth errors
    if (error) {
      console.error("OAuth provider error:", error, error_description);
      return NextResponse.redirect(
        new URL(`/sign-in?type=error&message=${encodeURIComponent(error_description || error)}`, baseUrl)
      );
    }
    
    // Ensure we have an auth code
    if (!code) {
      console.error("No authentication code found in callback URL");
      return NextResponse.redirect(
        new URL("/sign-in?type=error&message=Missing+authentication+code", baseUrl)
      );
    }
    
    // Create Supabase client
    const supabase = createClient();
    
    // Exchange the code for a session
    console.log("Exchanging auth code for session...");
    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (sessionError) {
      console.error("Session exchange error:", sessionError.message);
      console.error("Session error details:", sessionError);
      return NextResponse.redirect(
        new URL(`/sign-in?type=error&message=${encodeURIComponent(sessionError.message)}`, baseUrl)
      );
    }
    
    if (!data.session) {
      console.error("No session returned from code exchange");
      return NextResponse.redirect(
        new URL("/sign-in?type=error&message=Authentication+failed", baseUrl)
      );
    }
    
    console.log("Authentication successful for user:", data.session.user.id);
    console.log("User email:", data.session.user.email);
    
    // Create or update user profile with more details if available
    try {
      // Get user details from the session
      const { user } = data.session;
      const userData = {
        id: user.id,
        user_id: user.id,
        email: user.email,
        updated_at: new Date().toISOString()
      };
      
      // Add name if available from user metadata
      if (user.user_metadata && user.user_metadata.full_name) {
        Object.assign(userData, { 
          full_name: user.user_metadata.full_name,
          name: user.user_metadata.full_name
        });
      }
      
      console.log("Upserting user profile with data:", userData);
      
      const { error: upsertError } = await supabase.from("users").upsert(
        userData, 
        { onConflict: 'id' }
      );
      
      if (upsertError) {
        console.error("Profile update error (non-fatal):", upsertError);
      } else {
        console.log("User profile updated successfully");
      }
    } catch (profileError) {
      console.error("Profile update error (non-fatal):", profileError);
      // Continue with login even if profile update fails
    }
    
    // Redirect to dashboard
    console.log("Redirecting to dashboard");
    console.log("=== AUTH CALLBACK HANDLER COMPLETED SUCCESSFULLY ===");
    return NextResponse.redirect(new URL("/dashboard", baseUrl));
    
  } catch (error) {
    console.error("=== AUTH CALLBACK CRITICAL ERROR ===", error);
    
    // Provide simple error message
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://headshotmakerpro.com' 
      : 'http://localhost:3000';
      
    return NextResponse.redirect(
      new URL("/sign-in?type=error&message=Authentication+failed.+Please+try+again", baseUrl)
    );
  }
}
