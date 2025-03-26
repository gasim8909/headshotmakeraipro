import { NextRequest, NextResponse } from "next/server";
import { checkoutSessionAction } from "@/app/actions";
import { createClient } from "../../../../supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { productPriceId, successUrl, customerEmail, metadata } =
      await request.json();

    if (!productPriceId || !successUrl) {
      return NextResponse.json(
        { error: "Product price ID and success URL are required" },
        { status: 400 },
      );
    }

    // Verify user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 },
      );
    }

    // Validate email domain and format
    const emailToUse = customerEmail || user.email || '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmail = emailRegex.test(emailToUse) ? emailToUse : undefined;

    // Log the checkout request for debugging
    console.log("Checkout request parameters:", {
      productPriceId,
      successUrl,
      customerEmail: validEmail,
      metadata: { ...metadata, userId: user.id },
    });

    // Create checkout session
    try {
      // Check if productPriceId is a valid UUID format - Polar requires this
      if (!productPriceId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        console.error("Invalid product price ID format:", productPriceId);
        return NextResponse.json(
          { error: "Invalid product price ID format. Must be a valid UUID." },
          { status: 400 }
        );
      }

      const result = await checkoutSessionAction({
        productPriceId,
        successUrl,
        customerEmail: validEmail, // Only include if valid
        metadata: { ...metadata, userId: user.id },
      });

      return NextResponse.json({
        sessionId: result.id,
        url: result.url,
      });
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      
      // More informative error to help debug API issues
      if (error.response) {
        console.error("Polar API response error:", error.response.data);
        return NextResponse.json(
          { 
            error: "API error occurred", 
            details: error.response.data 
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: error.message || "Failed to create checkout session" },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
