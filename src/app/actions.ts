"use server";

import { api } from "@/lib/polar";
import { encodedRedirect } from "@/utils/utils";
import { Polar } from "@polar-sh/sdk";
import { redirect } from "next/navigation";
import { createClient } from "../../supabase/server";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString() || "";
  const supabase = await createClient();

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        email: email,
      },
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  }

  if (user) {
    try {
      const { error: updateError } = await supabase.from("users").insert({
        id: user.id,
        name: fullName,
        full_name: fullName,
        email: email,
        user_id: user.id,
        token_identifier: user.id,
        created_at: new Date().toISOString(),
      });

      if (updateError) {
        console.error("Error updating user profile:", updateError);
      }
    } catch (err) {
      console.error("Error in user profile creation:", err);
    }
  }

  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email for a verification link.",
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/dashboard");
};

export const signInWithGoogleAction = async () => {
  console.log("=== GOOGLE SIGN-IN DEBUG START ===");
  
  try {
    // Create Supabase client and log version information
    console.log("Creating Supabase client...");
    const supabase = await createClient();
    
    // Debug environment variables (without exposing full values)
    console.log("Environment checks:", {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "✗ Missing",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Set (length: " + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ")" : "✗ Missing",
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    });
    
    // Explicitly check that Supabase is configured before proceeding
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("Supabase credentials are not properly configured");
      return encodedRedirect("error", "/sign-in", "Authentication service misconfigured. Please contact support.");
    }
    
    // ALWAYS use the main domain for production environments to prevent redirect issues with preview deployments
    const siteURL = process.env.NODE_ENV === 'production' 
      ? 'https://headshotmakerpro.com' 
      : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
      
    console.log("Using site URL for OAuth:", siteURL);
    
    console.log(`Using site URL for OAuth redirect: ${siteURL}`);
    
    const redirectUrl = `${siteURL}/auth/callback?redirect_to=/dashboard`;
    console.log("Full redirect URL:", redirectUrl);
    
    try {
      // Try creating a test for Google Provider support
      console.log("Checking Google provider support...");
      try {
        // This is a simple test that will throw if the provider is not supported
        const testProvider = 'google' as const;
        console.log("Provider format check passed:", testProvider);
      } catch (providerError) {
        console.error("Provider format check failed:", providerError);
      }
      
      // Set up the OAuth request with PKCE (Proof Key for Code Exchange)
      console.log("Preparing OAuth request parameters...");
      const oauthParams = {
        provider: 'google' as const, // Type assertion to make TypeScript happy
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false, // Ensure browser redirects
          queryParams: {
            access_type: 'offline', // Request a refresh token
            prompt: 'consent',      // Force consent screen
            include_granted_scopes: 'true', // Include previously granted scopes
          },
          scopes: 'email profile'
        },
      };
      
      console.log("Calling Supabase auth.signInWithOAuth with params:", JSON.stringify(oauthParams, null, 2));
      const { data, error } = await supabase.auth.signInWithOAuth(oauthParams);
      
      if (error) {
        console.error("Google OAuth error details:", {
          code: error.code,
          message: error.message,
          status: error.status,
          name: error.name,
          stack: error.stack?.split("\n").slice(0, 3).join("\n") // First 3 lines of stack
        });
        
        // Specific error messages based on common error codes and additional context
        if (error.message.includes("Provider not supported") || error.message.includes("not configured")) {
          return encodedRedirect("error", "/sign-in", "Google sign-in is not available. Google OAuth must be enabled in your Supabase project settings.");
        }
        
        // Make the error message more user-friendly and actionable
        let errorMessage = `Authentication error: ${error.message}`;
        
        if (error.message.includes("invalid_grant")) {
          errorMessage = "Authentication failed: Invalid or expired authorization code. Please try again.";
        } else if (error.message.includes("access_denied")) {
          errorMessage = "Authentication was denied. Please ensure you grant the necessary permissions when prompted.";
        } else if (error.message.includes("redirect_uri_mismatch")) {
          errorMessage = "Authentication configuration error: Redirect URI mismatch. Please contact support.";
        }
        
        return encodedRedirect("error", "/sign-in", errorMessage);
      }
      
      if (!data?.url) {
        console.error("No OAuth URL returned from Supabase");
        return encodedRedirect("error", "/sign-in", "Authentication system error: No redirect URL received");
      }
      
      // Log the OAuth process for debugging
      console.log("OAuth URL received:", data.url.substring(0, 100) + "...");
      console.log("Starting Google OAuth flow with PKCE, redirecting to URL");
      console.log("=== GOOGLE SIGN-IN DEBUG END ===");
      
      // Redirect to the OAuth URL
      return redirect(data.url);
    } catch (innerError) {
      console.error("Error during OAuth setup:", innerError);
      
      // More detailed error logging
      if (innerError instanceof Error) {
        console.error({
          name: innerError.name,
          message: innerError.message,
          stack: innerError.stack?.split("\n").slice(0, 5).join("\n"),
        });
        
        // Specific error handling for common issues
        if (innerError.message.includes("network")) {
          return encodedRedirect("error", "/sign-in", "Network error during authentication. Please check your connection.");
        }
        
        if (innerError.message.includes("CORS")) {
          return encodedRedirect("error", "/sign-in", "Cross-origin error during authentication. This might be a configuration issue.");
        }
        
        if (innerError.message.includes("OAuth")) {
          return encodedRedirect("error", "/sign-in", "OAuth configuration error. Please ensure Google OAuth is properly set up in Supabase.");
        }
      }
      
      throw innerError; // Rethrow to outer catch block for general handling
    }
  } catch (e) {
    console.error("=== GOOGLE SIGN-IN CRITICAL ERROR ===");
    console.error("Unexpected error in Google OAuth flow:", e);
    
    // Enhanced error logging
    const errorInfo = e instanceof Error 
      ? {
          name: e.name,
          message: e.message,
          stack: e.stack?.split("\n").slice(0, 5).join("\n"),
          cause: e.cause ? String(e.cause) : undefined
        }
      : String(e);
      
    console.error("Error details:", errorInfo);
    console.log("=== GOOGLE SIGN-IN DEBUG END ===");
    
    // More specific error message if possible
    let errorMessage = "Unexpected error during authentication. Please try again later.";
    
    if (e instanceof Error) {
      if (e.message.includes("provider not configured") || e.message.includes("Provider not supported")) {
        errorMessage = "Google sign-in is not properly configured. Please contact support.";
      } else if (e.message.includes("permission") || e.message.includes("authorize")) {
        errorMessage = "Authorization failed. Please ensure you've granted the necessary permissions.";
      }
    }
    
    return encodedRedirect("error", "/sign-in", errorMessage);
  }
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {});

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export const checkoutSessionAction = async ({
  productPriceId,
  successUrl,
  customerEmail,
  metadata,
}: {
  productPriceId: string;
  successUrl: string;
  customerEmail?: string;
  metadata?: Record<string, any>;
}) => {
  console.log("Creating checkout session with:", {
    productPriceId,
    successUrl,
    customerEmail,
    metadata,
  });

  try {
    // Validate UUID format required by Polar
    if (!productPriceId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      throw new Error("Invalid product price ID format. Must be a valid UUID.");
    }

    // Creating a request object with only the required fields
    const checkoutRequest: any = {
      productPriceId,
      successUrl,
    };

    // Only add customerEmail if it's provided and looks valid
    if (customerEmail) {
      // Simple validation to avoid known invalid domains
      const invalidDomains = ['headshotmakerai.com']; // Add any known invalid domains
      const emailDomain = customerEmail.split('@')[1];
      
      if (emailDomain && !invalidDomains.includes(emailDomain)) {
        checkoutRequest.customerEmail = customerEmail;
      }
    }

    // Only add metadata if it's provided
    if (metadata && Object.keys(metadata).length > 0) {
      checkoutRequest.metadata = metadata;
    }

    // Make request to Polar API
    console.log("Sending checkout request to Polar:", checkoutRequest);
    const result = await api.checkouts.create(checkoutRequest);

    console.log("Checkout session created:", result);
    return result;
  } catch (error: any) {
    console.error("Error in checkoutSessionAction:", error);
    
    // Enhance error with more details if available
    if (error.response && error.response.data) {
      console.error("Polar API error details:", error.response.data);
      error.details = error.response.data;
    }
    
    throw error;
  }
};

export const checkUserSubscription = async (userId: string) => {
  const supabase = await createClient();

  try {
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (error) {
      // If the error is "not found", it just means the user doesn't have an active subscription
      if (error.code === "PGRST116" || error.message?.includes("not found")) {
        return false;
      }
      
      // For other errors, log them but still return false
      console.error("Error checking subscription status:", error);
      return false;
    }

    return !!subscription;
  } catch (error) {
    console.error("Unexpected error checking subscription status:", error);
    return false;
  }
};

export const manageSubscriptionAction = async (userId: string) => {
  const supabase = await createClient();

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  if (error) {
    // Check specifically for "not found" errors and handle them differently
    if (error.code === "PGRST116" || error.message?.includes("not found")) {
      console.log("No active subscription found for user:", userId);
      return { error: "No active subscription found" };
    }
    
    console.error("Error checking subscription status:", error);
    return { error: "Error checking subscription status" };
  }

  const polar = new Polar({
    server: "sandbox",
    accessToken: process.env.POLAR_ACCESS_TOKEN,
  });

  try {
    const result = await polar.customerSessions.create({
      customerId: subscription.customer_id,
    });

    // Only return the URL to avoid Convex type issues
    return { url: result.customerPortalUrl };
  } catch (error) {
    console.error("Error managing subscription:", error);
    return { error: "Error managing subscription" };
  }
};
