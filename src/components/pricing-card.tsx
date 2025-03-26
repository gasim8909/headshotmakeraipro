"use client";

import { supabase } from "../../supabase/supabase";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { User } from "@supabase/supabase-js";
import { Check, Image as ImageIcon, X } from "lucide-react";
import Link from "next/link";

export default function PricingCard({
  item,
  user,
}: {
  item: any;
  user: User | null;
}) {
  // Handle checkout process
  const handleCheckout = async (priceId: string) => {
    if (!user) {
      // Redirect to login if user is not authenticated
      window.location.href = "/sign-in";
      return;
    }

    try {
      console.log("Creating checkout session with price ID:", priceId);

      // Use the checkoutSessionAction from actions.ts instead of directly calling the Supabase function
      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productPriceId: priceId,
          successUrl: `${window.location.origin}/dashboard`,
          customerEmail: user.email || "",
          metadata: {
            userId: user.id,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const data = await response.json();

      // Redirect to Polar checkout
      if (data?.url) {
        console.log("Redirecting to checkout URL:", data.url);
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Failed to create checkout session. Please try again later.");
    }
  };

  // Custom tier features based on plan name
  const getTierFeatures = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "guest":
        return [
          "2 headshot generations",
          "Basic styles only",
          "No account required",
          "Standard resolution only",
        ];
      case "free":
        return [
          "5 headshot generations",
          "Basic styles only",
          "Account required",
          "Standard resolution only",
        ];
      case "premium":
        return [
          "30 headshot generations",
          "All professional styles",
          "Custom background options",
          "High resolution downloads",
          "Priority processing",
        ];
      case "professional":
        return [
          "Unlimited generations",
          "All professional styles",
          "Custom background options",
          "Ultra-high resolution downloads",
          "Priority processing",
          "Batch processing",
          "Advanced editing tools",
        ];
      default:
        return item.description
          ? item.description.split("\n").map((desc: string) => desc.trim())
          : [];
    }
  };

  // Check if this is a free tier
  const isFreeTier = item.name.toLowerCase() === "free";
  const isGuestTier = false; // Removed guest tier
  const features = getTierFeatures(item.name);

  return (
    <Card
      className={`w-[350px] relative overflow-hidden ${item.popular ? "border-2 border-blue-500 shadow-xl scale-105" : "border border-gray-200"}`}
    >
      {item.popular && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-30" />
      )}
      <CardHeader className="relative">
        {item.popular && (
          <div className="px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-fit mb-4">
            Most Popular
          </div>
        )}
        <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
          {item.name}
        </CardTitle>
        <CardDescription className="flex items-baseline gap-2 mt-2">
          {isFreeTier ? (
            <span className="text-4xl font-bold text-gray-900">Free</span>
          ) : (
            <>
              <span className="text-4xl font-bold text-gray-900">
                ${item?.prices?.[0]?.priceAmount / 100}
              </span>
              <span className="text-gray-600">/month</span>
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <ul className="space-y-4">
          {features.map((feature: string, index: number) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
              <span className="text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="relative">
        {isFreeTier ? (
          <Link href="/sign-up" className="w-full">
            <Button
              className={`w-full py-6 text-lg font-medium bg-gray-100 hover:bg-gray-200 text-gray-900`}
            >
              <ImageIcon className="mr-2 h-5 w-5" />
              Sign Up Free
            </Button>
          </Link>
        ) : (
          <Button
            onClick={async () => {
              await handleCheckout(item?.prices?.[0]?.id);
            }}
            className={`w-full py-6 text-lg font-medium ${
              item.popular
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-900"
            }`}
          >
            <ImageIcon className="mr-2 h-5 w-5" />
            Transform Photos Now
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
