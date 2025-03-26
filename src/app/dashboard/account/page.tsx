"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabaseClient";
import {
  Download,
  Edit,
  User,
  CreditCard,
  History,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DashboardNavbar from "@/components/dashboard-navbar";
import { checkoutSessionAction } from "@/app/actions";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("account");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [headshots, setHeadshots] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUser(user);
          setName(user.user_metadata?.full_name || "");

          // Fetch user's headshots from database
          const { data: headshotsData, error: headshotsError } = await supabase
            .from("headshots")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (headshotsError) throw headshotsError;
          setHeadshots(headshotsData || []);

          // Fetch user's subscription status
          const { data: subscriptionData, error: subscriptionError } =
            await supabase
              .from("subscriptions")
              .select("*")
              .eq("user_id", user.id)
              .eq("status", "active")
              .single();

          if (!subscriptionError) {
            setSubscription(subscriptionData);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load account information. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      setError(null);
      setSuccess(null);
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name },
      });

      if (error) throw error;
      setEditMode(false);
      setSuccess("Profile updated successfully!");

      // Refresh user data
      const {
        data: { user: updatedUser },
      } = await supabase.auth.getUser();
      if (updatedUser) setUser(updatedUser);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setError(error.message || "Failed to update profile");
    }
  };

  const handleDeleteHeadshot = async (id: string) => {
    try {
      setError(null);
      setSuccess(null);
      setIsDeleting(true);

      const supabase = createClient();
      const { error } = await supabase.from("headshots").delete().eq("id", id);

      if (error) throw error;

      // Update the headshots list
      setHeadshots(headshots.filter((headshot) => headshot.id !== id));
      setSuccess("Headshot deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting headshot:", error);
      setError(error.message || "Failed to delete headshot");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleManagePlan = async () => {
    try {
      setError(null);
      if (!user) return;

      // For free users, redirect to pricing page to select a plan
      if (!subscription) {
        window.location.href = "/pricing";
        return;
      }

      // For subscribed users, redirect to Polar customer portal
      const result = await fetch("/api/manage-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      }).then((res) => res.json());

      if (result.error) throw new Error(result.error);
      if (result.url) window.location.href = result.url;
    } catch (error: any) {
      console.error("Error managing subscription:", error);
      setError(error.message || "Failed to manage subscription");
    }
  };

  const handleDownloadHeadshot = (imageUrl: string, index: number) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `headshot-${index + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <>
        <DashboardNavbar />
        <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse">Loading account information...</div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <DashboardNavbar />
        <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Not Logged In</h2>
            <p className="mb-4">Please sign in to view your account details.</p>
            <Button asChild>
              <a href="/sign-in">Sign In</a>
            </Button>
          </div>
        </div>
      </>
    );
  }

  // Determine subscription plan details
  const planName = subscription ? "Premium" : "Free";
  const planCredits = subscription ? "30" : "5";
  const planPrice = subscription
    ? `${(subscription.amount / 100).toFixed(2)}/month`
    : "$0.00/month";
  const renewalDate = subscription
    ? new Date(subscription.current_period_end).toLocaleDateString()
    : "N/A";

  return (
    <>
      <DashboardNavbar />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Account Details
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Headshot History
            </TabsTrigger>
            <TabsTrigger
              value="subscription"
              className="flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Subscription
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  View and update your account details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user.email} disabled />
                    <p className="text-xs text-gray-500">
                      Your email address cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    {editMode ? (
                      <>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                        <div className="flex gap-2 mt-2">
                          <Button onClick={handleUpdateProfile}>
                            Save Changes
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setEditMode(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Label htmlFor="name">Full Name</Label>
                        <div className="flex justify-between items-center">
                          <Input
                            id="name"
                            value={user.user_metadata?.full_name || "Not set"}
                            disabled
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-2"
                            onClick={() => setEditMode(true)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Account Created</Label>
                    <Input
                      value={new Date(user.created_at).toLocaleDateString()}
                      disabled
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <Button variant="destructive">Delete Account</Button>
                    <p className="text-xs text-gray-500 mt-2">
                      This action cannot be undone. All your data will be
                      permanently deleted.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Headshot History</CardTitle>
                <CardDescription>
                  View and download your previously generated headshots
                </CardDescription>
              </CardHeader>
              <CardContent>
                {headshots.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {headshots.map((headshot, index) => (
                      <div
                        key={headshot.id}
                        className="border rounded-lg overflow-hidden bg-white"
                      >
                        <div className="aspect-square relative">
                          <img
                            src={headshot.image_url}
                            alt={`Generated Headshot ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 right-0 p-2 flex gap-2">
                            <Button
                              size="icon"
                              variant="secondary"
                              onClick={() =>
                                handleDownloadHeadshot(
                                  headshot.image_url,
                                  index,
                                )
                              }
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => handleDeleteHeadshot(headshot.id)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium">
                            {headshot.style
                              ? headshot.style.charAt(0).toUpperCase() +
                                headshot.style.slice(1)
                              : "Custom"}{" "}
                            Style
                          </p>
                          <p className="text-xs text-gray-500">
                            Generated on{" "}
                            {new Date(headshot.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No headshots yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      You haven't generated any headshots yet. Create your first
                      professional headshot now!
                    </p>
                    <Button asChild>
                      <a href="/create">Create Headshot</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Details</CardTitle>
                <CardDescription>
                  Manage your subscription and billing information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium">Current Plan</h3>
                        <p className="text-blue-600 font-bold text-xl">
                          {planName}
                        </p>
                      </div>
                      <Button onClick={handleManagePlan}>
                        {subscription ? "Manage Plan" : "Upgrade Plan"}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500">
                        Subscription Period
                      </h4>
                      <p className="text-lg font-medium">
                        {subscription ? "Monthly" : "Free"}
                      </p>
                      {subscription && (
                        <p className="text-sm text-gray-500">
                          Renews on {renewalDate}
                        </p>
                      )}
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500">
                        Headshot Credits
                      </h4>
                      <p className="text-lg font-medium">
                        {planCredits} per month
                      </p>
                      <p className="text-sm text-gray-500">
                        {subscription
                          ? "Premium features included"
                          : "Upgrade for more credits"}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500">
                        Billing Cycle
                      </h4>
                      <p className="text-lg font-medium">{planPrice}</p>
                      {subscription && (
                        <p className="text-sm text-gray-500">
                          Next billing: {renewalDate}
                        </p>
                      )}
                    </div>
                  </div>

                  {subscription && (
                    <>
                      <div className="pt-4 border-t">
                        <h3 className="text-lg font-medium mb-4">
                          Payment Method
                        </h3>
                        <div className="flex items-center p-3 border rounded-md">
                          <div className="bg-gray-100 p-2 rounded mr-3">
                            <CreditCard className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-medium">•••• •••• •••• 4242</p>
                            <p className="text-sm text-gray-500">
                              Expires 12/2025
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto"
                            onClick={handleManagePlan}
                          >
                            Update
                          </Button>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <Button
                          variant="outline"
                          className="text-red-500"
                          onClick={handleManagePlan}
                        >
                          Cancel Subscription
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
