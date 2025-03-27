import { createClient } from "../../../../../supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * This is an alternative Google OAuth implementation that adds additional logging
 * and error handling to diagnose authentication issues.
 */
export async function GET(request: NextRequest) {
  console.log("=== DIRECT GOOGLE AUTH ROUTE DEBUG ===");
  
  try {
    const redirectToParam = request.nextUrl.searchParams.get("redirect_to") || "/dashboard";
    const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 
                   (process.env.NODE_ENV === "production" 
                     ? "https://headshotmakerpro.com" 
                     : "http://localhost:3000");
    
    console.log("Environment:", { 
      NODE_ENV: process.env.NODE_ENV,
      redirectTo: redirectToParam,
      siteURL
    });
    
    // Create direct auth URL with comprehensive debugging
    try {
      console.log("Creating Supabase client...");
      const supabase = await createClient();
      
      console.log("Generating OAuth URL with PKCE...");
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google' as const,
        options: {
          redirectTo: `${siteURL}/auth/callback?redirect_to=${redirectToParam}`,
          queryParams: {
            // These options increase the chances of getting a fresh token
            access_type: 'offline',
            prompt: 'consent', 
          },
        },
      });
      
      if (error) {
        console.error("OAuth URL generation failed:", {
          code: error.code,
          message: error.message,
          name: error.name,
          status: error.status
        });
        
        // Return a specific error page instead of redirecting
        return NextResponse.json(
          { error: "Failed to initiate Google authentication", details: error.message },
          { status: 500 }
        );
      }
      
      if (!data?.url) {
        console.error("No OAuth URL returned from Supabase");
        return NextResponse.json(
          { error: "No authentication URL generated" }, 
          { status: 500 }
        );
      }
      
      // Log the OAuth URL for debugging (without leaking sensitive parts)
      const sanitizedUrl = data.url.replace(/code=([^&]{5})[^&]*/, "code=$1...");
      console.log("OAuth URL generated successfully:", sanitizedUrl);
      
      // Redirect to Google OAuth
      return NextResponse.redirect(data.url);
      
    } catch (err) {
      console.error("Critical error in direct Google auth route:", err);
      
      if (err instanceof Error) {
        console.error({
          name: err.name,
          message: err.message,
          stack: err.stack?.split("\n").slice(0, 5).join("\n")
        });
      }
      
      return NextResponse.json({ 
        error: "Authentication initialization failed",
        message: err instanceof Error ? err.message : String(err)
      }, { status: 500 });
    }
    
  } catch (outerErr) {
    console.error("Uncaught exception in Google auth route:", outerErr);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
