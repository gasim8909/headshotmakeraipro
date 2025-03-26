"use client";

import { useState, useEffect } from "react";
import HeadshotEditor from "../components/headshot-editor";
import { Button } from "@/components/ui/button";
import { ArrowRight, Save, Check, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DashboardNavbar from "@/components/dashboard-navbar";

export default function HeadshotPage() {
  const [generationsRemaining, setGenerationsRemaining] = useState(2); // Guest limit
  const [generatedImages, setGeneratedImages] = useState<
    { image: string; saved: boolean; style: string }[]
  >([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
      } finally {
        setLoading(false);
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

      // Convert base64 to URL by uploading to Supabase Storage
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
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <HeadshotEditor
          onGenerate={handleGenerate}
          maxGenerations={user ? 5 : 2} // 5 for logged in users, 2 for guests
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
                  View Premium Plans <ArrowRight className="ml-2 h-4 w-4" />
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
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
