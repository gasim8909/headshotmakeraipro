"use client";

import { useState, useEffect } from "react";
import DashboardNavbar from "@/components/dashboard-navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Save, Check, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabaseClient";
import HeadshotEditor from "@/app/dashboard/components/headshot-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SubscribedCreatePage() {
  const [generationsRemaining, setGenerationsRemaining] = useState(30); // Premium tier limit
  const [generatedImages, setGeneratedImages] = useState<
    { image: string; saved: boolean; style: string }[]
  >([]);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        // Check if user exists and fetch their subscription status
        if (user) {
          const { data: subscriptionData, error: subscriptionError } =
            await supabase
              .from("subscriptions")
              .select("*")
              .eq("user_id", user.id)
              .eq("status", "active")
              .single();

          if (!subscriptionError && subscriptionData) {
            setSubscription(subscriptionData);
            // For premium users, we could track usage but let's set a high limit
            setGenerationsRemaining(30); // Premium tier gets 30 generations per month
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

  const handleDownload = (image: string, format = "jpg", quality = "high") => {
    // Create a temporary canvas to handle format conversion if needed
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Set canvas size based on quality
      const scale = quality === "ultra" ? 3 : quality === "high" ? 2 : 1;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      // Draw the image on the canvas
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Convert to the requested format
      const mimeType = format === "png" ? "image/png" : "image/jpeg";
      const dataUrl = canvas.toDataURL(mimeType, 0.9);

      // Create download link
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `professional-headshot-${quality}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    img.src = `data:image/jpeg;base64,${image}`;
  };

  return (
    <>
      <DashboardNavbar />
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Premium Headshot Creator
            </h1>
            <p className="text-gray-600">
              Create professional headshots with advanced features
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1">
            Premium Account: {generationsRemaining}/30 generations remaining
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
          maxGenerations={30} // 30 for premium tier
          generationsRemaining={generationsRemaining}
          isPremium={true} // Enable premium features
        />

        {generatedImages.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">
              Your Generated Headshots
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {generatedImages.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-lg overflow-hidden relative group shadow-sm hover:shadow-md transition-shadow"
                >
                  <img
                    src={`data:image/jpeg;base64,${item.image}`}
                    alt={`Generated Headshot ${index + 1}`}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="p-3 bg-white border-t">
                    <p className="text-sm font-medium">
                      {item.style.charAt(0).toUpperCase() + item.style.slice(1)}{" "}
                      Style
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {!item.saved ? (
                      <Button
                        onClick={() =>
                          handleSaveHeadshot(item.image, index, item.style)
                        }
                        disabled={savingIndex === index}
                        className="bg-blue-600 hover:bg-blue-700 mb-2"
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
                    ) : (
                      <div className="bg-green-500 text-white rounded-full p-1 mb-2">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          handleDownload(item.image, "jpg", "high")
                        }
                      >
                        <Download className="mr-1 h-3 w-3" /> JPG
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          handleDownload(item.image, "png", "ultra")
                        }
                      >
                        <Download className="mr-1 h-3 w-3" /> PNG
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Premium Features Section */}
        <div className="mt-12 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-blue-100">
          <h3 className="text-xl font-semibold mb-4 text-blue-800">
            Premium Features Available
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <h4 className="font-medium mb-2">Advanced Styles</h4>
              <p className="text-sm text-gray-600">
                Access all professional headshot styles including Executive,
                Tech, and Academic.
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <h4 className="font-medium mb-2">High Resolution</h4>
              <p className="text-sm text-gray-600">
                Download your headshots in ultra-high resolution for print and
                professional use.
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <h4 className="font-medium mb-2">Priority Processing</h4>
              <p className="text-sm text-gray-600">
                Your headshot generations are processed with priority for faster
                results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
