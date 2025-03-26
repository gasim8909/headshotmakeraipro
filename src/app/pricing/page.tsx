import Navbar from "@/components/navbar";
import PricingCard from "@/components/pricing-card";
import { createClient } from "../../../supabase/server";

export default async function Pricing() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: plans, error } = await supabase.functions.invoke(
    "supabase-functions-get-plans",
  );

  // Filter out guest plan if it exists in the API response
  const filteredPlans = plans?.items?.filter(
    (item: any) => item.name.toLowerCase() !== "guest",
  );

  // If no plans from API, use custom tiers
  const customTiers = [
    {
      id: "free-tier",
      name: "Free",
      description:
        "5 headshot generations\nBasic styles only\nAccount required\nStandard resolution only",
      prices: [{ priceAmount: 0, id: "free-price" }],
      popular: false,
    },
    {
      id: "premium-tier",
      name: "Premium",
      description:
        "30 headshot generations\nAll professional styles\nCustom background options\nHigh resolution downloads\nPriority processing",
      prices: [{ priceAmount: 1499, id: "premium-price" }],
      popular: true,
    },
    {
      id: "professional-tier",
      name: "Professional",
      description:
        "Unlimited generations\nAll professional styles\nCustom background options\nUltra-high resolution downloads\nPriority processing\nBatch processing\nAdvanced editing tools",
      prices: [{ priceAmount: 2999, id: "professional-price" }],
      popular: false,
    },
  ];

  const result = filteredPlans?.length > 0 ? filteredPlans : customTiers;

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose the perfect plan for your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto justify-center">
          {result?.map((item: any) => (
            <PricingCard key={item.id} item={item} user={user} />
          ))}
        </div>
      </div>
    </>
  );
}
