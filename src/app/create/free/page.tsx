"use client";

import { useState, useEffect } from "react";
import DashboardNavbar from "@/components/dashboard-navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Save, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabaseClient";
import HeadshotEditor from "@/app/dashboard/components/headshot-editor";

export default function FreeCreatePage() {
  const [generationsRemaining, setGenerationsRemaining] = useState(5); // Free tier limit
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

        // Check if user exists and fetch their headshots count
        if (user) {
          const { count, error } = await supabase
            .from("headshots")
            .select("*", { count: "exact" })
            .eq("user_id", user.id);

          if (!error && count !== null) {
            // Calculate remaining generations based on monthly limit
            setGenerationsRemaining(Math.max(0, 5 - count));
          }
        }
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
      setError("You need to be logged in to save headshots.");
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
      <DashboardNavbar />
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Create Headshots</h1>
            <p className="text-gray-600">
              Transform your casual photos into professional headshots
            </p>
          </div>
          <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
            Free Account: {generationsRemaining}/5 generations remaining
          </Badge>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <HeadshotEditor
          onGenerate={handleGenerate}
          maxGenerations={5} // 5 for free tier
          generationsRemaining={generationsRemaining}
          isPremium={false}
        />

        {generationsRemaining === 0 && (
          <div className="mt-8 p-6 bg-blue-50 rounded-xl text-center">
            <h3 className="text-xl font-semibold mb-2">
              You've used all your free generations this month
            </h3>
            <p className="text-gray-600 mb-4">
              Upgrade to Premium for unlimited access and advanced features.
            </p>
            <Button asChild>
              <a href="/pricing">Upgrade to Premium</a>
            </Button>
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
                  {!item.saved && (
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
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upgrade Banner */}
        <div className="mt-12 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white text-center">
          <h3 className="text-xl font-semibold mb-2">
            Unlock Premium Features
          </h3>
          <p className="mb-4 max-w-2xl mx-auto">
            Upgrade to Premium for unlimited generations, advanced styles,
            high-resolution downloads, and more.
          </p>
          <Button variant="secondary" asChild>
            <a href="/pricing">View Premium Plans</a>
          </Button>
        </div>
      </div>
    </>
  );
}
