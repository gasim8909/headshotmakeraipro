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
  const supabase = await createClient();
  
  // Get the origin for the redirect URL
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 
                (typeof window !== 'undefined' ? window.location.origin : '');
  
  // Make sure we have a valid origin
  if (!origin) {
    console.error("Missing site URL for Google OAuth redirect");
    return encodedRedirect("error", "/sign-in", "Server configuration error: Missing site URL");
  }
  
  // Set up the OAuth request with specific options for better session handling
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?redirect_to=/dashboard`,
      queryParams: {
        access_type: 'offline', // Request a refresh token
        prompt: 'consent',      // Force consent screen
        include_granted_scopes: 'true', // Include previously granted scopes
      },
      // Include any other scopes you need
      scopes: 'email profile',
    },
  });

  if (error) {
    console.error("Google OAuth error:", error.message, error);
    return encodedRedirect("error", "/sign-in", `Authentication error: ${error.message}`);
  }

  if (!data?.url) {
    console.error("No OAuth URL returned from Supabase");
    return encodedRedirect("error", "/sign-in", "Authentication system error");
  }

  // Log the OAuth process for debugging
  console.log("Starting Google OAuth flow, redirecting to:", data.url);

  // Redirect to the OAuth URL
  return redirect(data.url);
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
