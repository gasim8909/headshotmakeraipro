import Link from "next/link";
import { ArrowUpRight, Check, Image as ImageIcon, Sparkles } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-background theme-transition">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial opacity-60 dark:opacity-30" />

      <div className="relative pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto theme-transition">
            <div className="flex justify-center mb-6">
              <Badge variant="outline" className="border-gradient bg-background/50 backdrop-blur-sm px-4 py-1.5 text-sm">
                <Sparkles className="w-4 h-4 mr-2 text-accent" />
                No account needed to start! Try as a Guest
              </Badge>
            </div>

            <h1 className="heading-1 mb-8">
              Transform{" "}
              <span className="text-gradient-primary">
                Photos
              </span>{" "}
              into <span className="text-gradient-alt">Professional</span> Headshots
            </h1>

            <p className="paragraph-large mb-12 max-w-2xl mx-auto">
              Turn your casual photos into stunning professional headshots with
              our AI-powered platform. Perfect for LinkedIn profiles and
              corporate portfolios. Start with 2 free generations as a guest!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/create">
                <Button 
                  variant="gradient" 
                  size="xl"
                  className="text-lg font-medium rounded-lg glow-primary theme-transition"
                >
                  Transform Your Photo
                  <ImageIcon className="ml-2 w-5 h-5" />
                </Button>
              </Link>

              <Link href="#pricing">
                <Button 
                  variant="bordered" 
                  size="xl"
                  className="text-lg font-medium rounded-lg theme-transition"
                >
                  View Pricing
                </Button>
              </Link>
            </div>

            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground theme-transition">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-success" />
                <span>Multiple professional styles</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-success" />
                <span>Powered by Google's Gemini AI</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-success" />
                <span>High-resolution downloads</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
