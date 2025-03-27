import { NextRequest, NextResponse } from "next/server";
import { checkUserSubscription } from "@/app/actions";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required", isSubscribed: false },
        { status: 400 }
      );
    }

    const isSubscribed = await checkUserSubscription(userId);

    return NextResponse.json({ isSubscribed });
  } catch (error: any) {
    console.error("Error checking subscription:", error);
    return NextResponse.json(
      { 
        error: error.message || "Internal server error", 
        isSubscribed: false 
      },
      { status: 500 }
    );
  }
}
