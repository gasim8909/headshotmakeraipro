"use client";

import { useState, useEffect } from "react";
import DashboardNavbar from "@/components/dashboard-navbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Upload,
  Image as ImageIcon,
  Briefcase,
  Palette,
  Camera,
  Download,
  RefreshCw,
  Settings,
  ChevronRight,
  AlertCircle,
  Save,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createClient } from "@/lib/supabaseClient";
import HeadshotEditor from "@/app/dashboard/components/headshot-editor";

export default function GuestCreatePage() {
  const [generationsRemaining, setGenerationsRemaining] = useState(2); // Guest limit
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleGenerate = (result: { image: string; style: string }) => {
    setGenerationsRemaining((prev) => Math.max(0, prev - 1));
  };

  const handleSaveHeadshot = async (image: string, style: string) => {
    if (!user) {
      setError(
        "You need to be logged in to save headshots. Please sign up or sign in.",
      );
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      setIsSaving(true);

      const supabase = createClient();

      // Save to headshots table
      const { data, error } = await supabase
        .from("headshots")
        .insert({
          user_id: user.id,
          image_url: `data:image/jpeg;base64,${image}`,
          style: style,
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;

      setSuccess("Headshot saved to your profile!");
    } catch (error: any) {
      console.error("Error saving headshot:", error);
      setError(error.message || "Failed to save headshot");
      throw error; // Re-throw so the HeadshotEditor can handle the error state
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <DashboardNavbar isGuest={!user} />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Headshot Maker AI</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Transform your casual photos into professional headshots in seconds
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

        <HeadshotEditor
          onGenerate={handleGenerate}
          onSaveToProfile={user ? handleSaveHeadshot : undefined}
          maxGenerations={2} // 2 for guests
          generationsRemaining={generationsRemaining}
          isPremium={false}
        />

        {generationsRemaining === 0 && !user && (
          <div className="mt-8 p-6 bg-blue-50 rounded-xl text-center">
            <h3 className="text-xl font-semibold mb-2">
              Want to create more headshots?
            </h3>
            <p className="text-gray-600 mb-4">
              Sign up for a free account to get 5 more generations or upgrade to
              Premium for unlimited access and advanced features.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" asChild>
                <a href="/sign-up">Create Free Account</a>
              </Button>
              <Button asChild>
                <a href="/pricing">
                  View Premium Plans <ChevronRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        )}


        {/* Create Account Banner */}
        <Card className="bg-blue-50 border-blue-100 mt-8">
          <CardHeader>
            <CardTitle className="text-blue-800">
              Want more generations?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 mb-4">
              Create a free account to get 5 headshot generations and access to
              more features.
            </p>
            <div className="flex gap-4">
              <a
                href="/sign-up"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Create Free Account
              </a>
              <a
                href="/pricing"
                className="px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors font-medium"
              >
                View Pricing
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
