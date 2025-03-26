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
  const [generatedImages, setGeneratedImages] = useState<
    { image: string; saved: boolean; style: string }[]
  >([]);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);

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
    setGeneratedImages((prev) => [
      ...prev,
      { image: result.image, saved: false, style: result.style },
    ]);
  };

  const handleSaveHeadshot = async (
    image: string,
    index: number,
    style: string,
  ) => {
    if (!user) {
      setError(
        "You need to be logged in to save headshots. Please sign up or sign in.",
      );
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      setSavingIndex(index);

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

      // Update the UI to show this image as saved
      const updatedImages = [...generatedImages];
      updatedImages[index].saved = true;
      setGeneratedImages(updatedImages);

      setSuccess("Headshot saved to your profile!");
    } catch (error: any) {
      console.error("Error saving headshot:", error);
      setError(error.message || "Failed to save headshot");
    } finally {
      setSavingIndex(null);
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

        {generatedImages.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">
              Your Generated Headshots
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {generatedImages.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-lg overflow-hidden relative group"
                >
                  <img
                    src={`data:image/jpeg;base64,${item.image}`}
                    alt={`Generated Headshot ${index + 1}`}
                    className="w-full aspect-square object-cover"
                  />
                  {user && !item.saved && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        onClick={() =>
                          handleSaveHeadshot(item.image, index, item.style)
                        }
                        disabled={savingIndex === index}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {savingIndex === index ? (
                          "Saving..."
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save to Profile
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  {item.saved && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
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
