'use client';

import DashboardNavbar from "@/components/dashboard-navbar";
import ManageSubscription from "@/components/manage-subscription";
import { InfoIcon, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ClientAuthProtection from "@/components/client-auth-protection";
import { ClientSubscriptionCheck } from "@/components/client-subscription-check";
import { createBrowserClient } from "@supabase/ssr";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [subscriptionUrl, setSubscriptionUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUserAndSubscription() {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Get user
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.error("Error fetching user:", error);
          return router.push("/create/guest");
        }
        
        setUser(user);

        // Fetch subscription information
        // Note: This would typically call your API endpoint for subscription data
        try {
          const response = await fetch('/api/manage-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: user.id }),
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            if (data.error === "No active subscription found") {
              return router.push("/pricing");
            }
            console.error("Error fetching subscription:", data.error);
          } else if (data.url) {
            setSubscriptionUrl(data.url);
          }
        } catch (subError) {
          console.error("Error fetching subscription:", subError);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUserAndSubscription();
  }, [router]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <ClientAuthProtection>
      <ClientSubscriptionCheck>
        <DashboardNavbar />
      <main className="w-full">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          <div className="flex justify-end">
            {subscriptionUrl && <ManageSubscription redirectUrl={subscriptionUrl} />}
          </div>
          {/* Header Section */}
          <header className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="bg-secondary/50 text-sm p-3 px-4 rounded-lg text-muted-foreground flex gap-2 items-center">
              <InfoIcon size="14" />
              <span>
                This is a protected page only visible to authenticated users
              </span>
            </div>
          </header>

          {/* User Profile Section */}
          {user && (
            <section className="bg-card rounded-xl p-6 border shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <UserCircle size={48} className="text-primary" />
                <div>
                  <h2 className="font-semibold text-xl">User Profile</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 overflow-hidden">
                <pre className="text-xs font-mono max-h-48 overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </section>
          )}
        </div>
      </main>
      </ClientSubscriptionCheck>
    </ClientAuthProtection>
  );
}
