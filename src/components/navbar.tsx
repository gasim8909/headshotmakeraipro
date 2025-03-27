import Link from "next/link";
import { createClient } from "../../supabase/server";
import { Button } from "./ui/button";
import { Sparkles } from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";
import { Badge } from "./ui/badge";
import { headers } from "next/headers";
import ClientUserProfile from "./client-user-profile";

export default async function Navbar() {
  const supabase = createClient();
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isCreatePage = pathname.startsWith('/create');

  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  return (
    <nav className="w-full border-b border-border bg-background py-3 theme-transition">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" prefetch className="text-xl font-bold flex items-center theme-transition">
          {/* Custom Camera SVG Logo */}
          <svg width="24" height="24" viewBox="0 0 32 32" className="mr-2 text-primary glow-primary dark:glow-primary">
            <rect x="2" y="8" width="28" height="18" rx="2" fill="currentColor" />
            <rect x="2" y="8" width="28" height="18" rx="2" fill="url(#paint0_linear)" />
            <circle cx="16" cy="17" r="7" fill="#1E293B" />
            <circle cx="16" cy="17" r="5" fill="#334155" />
            <circle cx="16" cy="17" r="3" fill="#1E293B" />
            <rect x="22" y="12" width="4" height="2" rx="1" fill="#E2E8F0" />
            <path d="M12 8V6C12 5.44772 12.4477 5 13 5H19C19.5523 5 20 5.44772 20 6V8H12Z" fill="#334155" />
            <circle cx="14" cy="15" r="1" fill="#F8FAFC" />
            <defs>
              <linearGradient id="paint0_linear" x1="2" y1="8" x2="30" y2="26" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#3B82F6" />
                <stop offset="1" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
          <span className="text-gradient-primary flex items-center">
            Headshot Maker Pro
            <Sparkles className="h-4 w-4 ml-1 text-accent" />
          </span>
        </Link>
        <div className="hidden md:flex gap-6 items-center">
          <Link
            href="#features"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors theme-transition"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors theme-transition"
          >
            Pricing
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors theme-transition"
          >
            Examples
          </Link>
        </div>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              {!isCreatePage && (
                <Link href="/create">
                  <Button className="bg-gradient-primary hover:opacity-90 transition-opacity theme-transition">
                    Create
                  </Button>
                </Link>
              )}
              <ThemeSwitcher />
              <ClientUserProfile />
            </>
          ) : (
            <>
              <ThemeSwitcher />
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors theme-transition"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
              >
                <Button className="bg-gradient-primary hover:opacity-90 transition-opacity theme-transition">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
