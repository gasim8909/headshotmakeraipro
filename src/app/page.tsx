import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import PricingCard from "@/components/pricing-card";
import {
  ArrowUpRight,
  CheckCircle2,
  Shield,
  Image as ImageIcon,
  Sparkles,
  Download,
  Palette,
} from "lucide-react";
import { createClient } from "../../supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: plans, error } = await supabase.functions.invoke(
    "supabase-functions-get-plans",
  );

  // Add custom tiers if they don't exist in the API response
  const customTiers = [
    {
      id: "free-tier",
      name: "Free",
      description:
        "5 headshot generations\nBasic styles only\nAccount required\nStandard resolution only",
      prices: [{ priceAmount: 0, id: "free-price" }],
      popular: false,
    },
    {
      id: "premium-tier",
      name: "Premium",
      description:
        "30 headshot generations\nAll professional styles\nCustom background options\nHigh resolution downloads\nPriority processing",
      prices: [{ priceAmount: 1499, id: "premium-price" }],
      popular: true,
    },
    {
      id: "professional-tier",
      name: "Professional",
      description:
        "Unlimited generations\nAll professional styles\nCustom background options\nUltra-high resolution downloads\nPriority processing\nBatch processing\nAdvanced editing tools",
      prices: [{ priceAmount: 2999, id: "professional-price" }],
      popular: false,
    },
  ];

  // Use custom tiers for now, later we can merge with API response
  const result = customTiers;

  return (
    <div className="min-h-screen bg-background theme-transition">
      <Navbar />
      <Hero />

      {/* Features Section */}
      <section className="py-24 bg-background theme-transition">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 theme-transition">
              Professional Headshots Made Easy
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto theme-transition">
              Our AI-powered platform transforms your casual photos into
              professional headshots in seconds. Try it for free, no account
              required!
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: "AI-Powered",
                description: "Cutting-edge Google Gemini AI technology",
              },
              {
                icon: <Palette className="w-6 h-6" />,
                title: "Multiple Styles",
                description: "Corporate, creative, casual professional & more",
              },
              {
                icon: <ImageIcon className="w-6 h-6" />,
                title: "Easy Comparison",
                description: "Before/after slider to see the transformation",
              },
              {
                icon: <Download className="w-6 h-6" />,
                title: "High Quality",
                description: "Download in multiple formats and resolutions",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-card rounded-xl shadow-sm hover:shadow-md border border-border transition-all theme-transition"
              >
                <div className="text-primary mb-4 theme-transition">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 theme-transition">{feature.title}</h3>
                <p className="text-muted-foreground theme-transition">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted theme-transition">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 theme-transition">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto theme-transition">
              Transform your photos in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 theme-transition">
                <span className="text-primary text-xl font-bold theme-transition">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 theme-transition">Upload Your Photo</h3>
              <p className="text-muted-foreground theme-transition">
                Drag & drop or browse to upload your casual photo
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 theme-transition">
                <span className="text-primary text-xl font-bold theme-transition">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 theme-transition">Select Your Style</h3>
              <p className="text-muted-foreground theme-transition">
                Choose from multiple professional headshot styles
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 theme-transition">
                <span className="text-primary text-xl font-bold theme-transition">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 theme-transition">Download & Share</h3>
              <p className="text-muted-foreground theme-transition">
                Get your professional headshot in multiple formats
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Transformations */}
      <section className="py-20 bg-background theme-transition">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 theme-transition">See the Transformation</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto theme-transition">
              Check out these amazing before and after examples
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[1, 2, 3].map((item) => (
              <div key={item} className="rounded-xl overflow-hidden shadow-md border border-border theme-transition">
                <div className="relative aspect-square bg-muted/50">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-r from-muted to-muted/70 animate-pulse"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-muted-foreground font-medium theme-transition">
                        Sample Transformation {item}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-card theme-transition">
                  <h3 className="font-semibold theme-transition">Professional Style {item}</h3>
                  <p className="text-sm text-muted-foreground theme-transition">
                    See how our AI transforms casual photos
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-muted theme-transition" id="pricing">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 theme-transition">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto theme-transition">
              Choose the perfect plan for your headshot needs. Start for free,
              no account required.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto justify-center">
            {result?.map((item: any) => (
              <PricingCard key={item.id} item={item} user={user} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background theme-transition">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 theme-transition">
            Ready to Transform Your Photos?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto theme-transition">
            Start with 2 free generations as a guest, or create an account for
            more features.
          </p>
          <a
            href="/create"
            className="inline-flex items-center px-6 py-3 text-primary-foreground bg-gradient-primary rounded-lg hover:opacity-90 glow-primary theme-transition"
          >
            Create Your Headshot Now
            <ArrowUpRight className="ml-2 w-4 h-4" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
