"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Download,
  Sparkles,
  Save,
  AlertCircle,
  CreditCard,
  X,
} from "lucide-react";

interface HeadshotEditorProps {
  onGenerate?: (result: { image: string; style: string }) => void;
  maxGenerations?: number;
  generationsRemaining?: number;
  isPremium?: boolean;
}

export default function HeadshotEditor({
  onGenerate,
  maxGenerations = 5,
  generationsRemaining = 5,
  isPremium = false,
}: HeadshotEditorProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [style, setStyle] = useState("corporate");
  const [intensity, setIntensity] = useState(50);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setGeneratedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setGeneratedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const [showSubscribePopup, setShowSubscribePopup] = useState(false);

  const generateHeadshot = async () => {
    if (!selectedImage) return;

    if (generationsRemaining <= 0) {
      setShowSubscribePopup(true);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: selectedImage.split(",")[1], // Remove the data URL prefix
          style,
          intensity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate headshot");
      }

      const data = await response.json();
      setGeneratedImage(
        `data:${data.mimeType || "image/jpeg"};base64,${data.image}`,
      );

      if (onGenerate) {
        onGenerate({ image: data.image, style });
      }
    } catch (err: any) {
      setError(
        err.message || "An error occurred while generating your headshot",
      );
      console.error("Error generating headshot:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;

    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `headshot-${style}-${new Date().getTime()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const router = useRouter();

  return (
    <div className="w-full max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      {showSubscribePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-amber-500" />
                No Credits Remaining
              </h3>
              <button
                onClick={() => setShowSubscribePopup(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              You've used all your available headshot generations. Upgrade to a
              premium plan to create more professional headshots with advanced
              features.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowSubscribePopup(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  router.push("/pricing");
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                View Pricing Plans
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left side - Upload and Original Image */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Upload Your Photo</h3>

          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center h-80 bg-gray-50"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {selectedImage ? (
              <div className="relative w-full h-full">
                <img
                  src={selectedImage}
                  alt="Original"
                  className="w-full h-full object-contain"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute bottom-2 right-2"
                  onClick={() => setSelectedImage(null)}
                >
                  Change Photo
                </Button>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center mb-4">
                  Drag & drop your photo here or click to browse
                </p>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <Button
                  variant="outline"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                >
                  Select Photo
                </Button>
              </>
            )}
          </div>

          {/* Style Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Select Style</h3>
            <Tabs
              defaultValue="corporate"
              value={style}
              onValueChange={setStyle}
            >
              <TabsList className="w-full grid grid-cols-3 md:grid-cols-6">
                <TabsTrigger value="corporate">Corporate</TabsTrigger>
                <TabsTrigger value="creative">Creative</TabsTrigger>
                <TabsTrigger value="casual">Casual</TabsTrigger>
                <TabsTrigger value="executive" disabled={!isPremium}>
                  Executive
                </TabsTrigger>
                <TabsTrigger value="tech" disabled={!isPremium}>
                  Tech
                </TabsTrigger>
                <TabsTrigger value="academic" disabled={!isPremium}>
                  Academic
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {!isPremium && (
              <p className="text-xs text-gray-500">
                Upgrade to Premium for access to all professional styles
              </p>
            )}
          </div>

          {/* Intensity Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Transformation Intensity</h3>
              <span className="text-sm text-gray-500">{intensity}%</span>
            </div>
            <Slider
              value={[intensity]}
              min={10}
              max={90}
              step={10}
              onValueChange={(value) => setIntensity(value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Subtle</span>
              <span>Balanced</span>
              <span>Dramatic</span>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            className="w-full"
            size="lg"
            disabled={
              !selectedImage || isGenerating || generationsRemaining <= 0
            }
            onClick={generateHeadshot}
          >
            {isGenerating ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Generate Professional Headshot ({generationsRemaining}/
                {maxGenerations})
              </>
            )}
          </Button>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Right side - Generated Image */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Your Professional Headshot</h3>

          <div className="border rounded-lg p-2 h-80 bg-gray-50 flex items-center justify-center">
            {generatedImage ? (
              <div className="relative w-full h-full">
                <img
                  src={generatedImage}
                  alt="Generated Headshot"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <ImageIcon className="w-12 h-12 mx-auto mb-4" />
                <p>Your generated headshot will appear here</p>
              </div>
            )}
          </div>

          {generatedImage && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={downloadImage}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Headshot
              </Button>
            </div>
          )}

          {isPremium && generatedImage && (
            <div className="space-y-4">
              <h4 className="text-md font-medium">Premium Options</h4>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" size="sm">
                  High Resolution
                </Button>
                <Button variant="outline" size="sm">
                  PNG Format
                </Button>
                <Button variant="outline" size="sm">
                  Adjust Lighting
                </Button>
                <Button variant="outline" size="sm">
                  Background Options
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
