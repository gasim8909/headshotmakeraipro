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

    // Create checkout session
    try {
      const result = await checkoutSessionAction({
        productPriceId,
        successUrl,
        customerEmail: customerEmail || user.email,
        metadata: { ...metadata, userId: user.id },
      });

      return NextResponse.json({
        sessionId: result.id,
        url: result.url,
      });
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
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
