import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabaseClient";

// Helper function to implement exponential backoff retry logic
async function retryWithExponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000,
): Promise<T> {
  let retries = 0;
  let delay = initialDelay;

  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      // Check if it's a 503 error (service unavailable/overloaded)
      const isOverloaded =
        error.message?.includes("503 Service Unavailable") ||
        error.message?.includes("overloaded");

      // If we've reached max retries or it's not an overload error, throw
      if (retries >= maxRetries || !isOverloaded) {
        throw error;
      }

      // Log retry attempt
      console.log(
        `Gemini API overloaded. Retrying in ${delay}ms... (Attempt ${retries + 1}/${maxRetries})`,
      );

      // Wait for the delay period
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Increase retries and delay for next attempt
      retries++;
      delay *= 2; // Exponential backoff
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { image, style, intensity, saveToProfile } = await request.json();

    // Get API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 },
      );
    }

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Initialize the Google GenAI client
    const genAI = new GoogleGenAI({ apiKey });

    // Get style description based on selected style
    let styleDescription = "";
    let backgroundDescription = "";
    let lightingDescription = "";
    let expressionDescription = "";

    // Style descriptions
    if (style === "corporate") {
      styleDescription = "professional corporate headshot with business attire";
      backgroundDescription = "clean neutral background";
      lightingDescription = "professional studio lighting with soft shadows";
      expressionDescription = "confident and approachable expression";
    } else if (style === "creative") {
      styleDescription =
        "creative professional headshot with an artistic flair, modern and stylish";
      backgroundDescription = "subtle artistic background with soft bokeh";
      lightingDescription = "dramatic side lighting with artistic shadows";
      expressionDescription = "expressive and engaging look";
    } else if (style === "casual") {
      styleDescription =
        "casual professional headshot, approachable yet professional look";
      backgroundDescription = "soft blurred natural background";
      lightingDescription = "natural lighting with gentle highlights";
      expressionDescription = "friendly and approachable smile";
    } else if (style === "executive") {
      styleDescription =
        "executive leadership headshot with formal business attire";
      backgroundDescription = "premium dark gradient background";
      lightingDescription = "professional three-point lighting setup";
      expressionDescription = "authoritative and trustworthy expression";
    } else if (style === "tech") {
      styleDescription = "modern tech professional headshot";
      backgroundDescription = "subtle tech-themed or gradient background";
      lightingDescription = "clean modern lighting with blue undertones";
      expressionDescription = "focused and innovative expression";
    } else if (style === "academic") {
      styleDescription =
        "scholarly professional headshot suitable for academic profiles";
      backgroundDescription = "neutral bookshelf or institutional background";
      lightingDescription = "soft even lighting with minimal shadows";
      expressionDescription = "thoughtful and knowledgeable expression";
    }

    // Get intensity description
    const intensityDesc =
      intensity < 33 ? "subtle" : intensity < 66 ? "balanced" : "dramatic";

    try {
      const prompt = `Transform this photo into a ${intensityDesc} ${styleDescription}. 
      Make it look like a high-quality professional headshot with a ${backgroundDescription}.
      Use ${lightingDescription} to highlight the subject's features.
      The subject should have a ${expressionDescription}.
      Maintain the person's identity but enhance the professional appearance.
      Ensure proper framing with head and shoulders visible, professional color grading, and subtle skin retouching.`;

      // Call Gemini API with retry mechanism
      const response = await retryWithExponentialBackoff(async () => {
        return await genAI.models.generateContent({
          model: "gemini-2.0-flash-exp-image-generation",
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                { inlineData: { mimeType: "image/jpeg", data: image } },
              ],
            },
          ],
          config: {
            responseModalities: ["Text", "Image"],
          },
        });
      });

      // Extract the generated image from the response
      let generatedImage = null;
      if (
        response.candidates && 
        response.candidates.length > 0 && 
        response.candidates[0].content && 
        response.candidates[0].content.parts
      ) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            generatedImage = part.inlineData.data;
            break;
          }
        }
      }

      if (!generatedImage) {
        return NextResponse.json(
          { error: "Failed to generate image" },
          { status: 500 },
        );
      }

      // Note: We're now handling saving to profile from the client side
      // This allows for better user feedback and control

      return NextResponse.json({
        image: generatedImage,
        mimeType: "image/jpeg",
      });
    } catch (error: any) {
      console.error("Error generating image with Gemini:", error);
      return NextResponse.json(
        { error: error.message || "Failed to generate image" },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
