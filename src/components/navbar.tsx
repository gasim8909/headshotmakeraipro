import Link from "next/link";
import { createClient } from "../../supabase/server";
import { Button } from "./ui/button";
import { Image as ImageIcon, Sparkles } from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";
import UserProfile from "./user-profile";
import { Badge } from "./ui/badge";
import { headers } from "next/headers";

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
          <ImageIcon className="h-6 w-6 mr-2 text-primary glow-primary dark:glow-primary" />
          <span className="text-gradient-primary flex items-center">
            Headshot Maker AI
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
              <UserProfile />
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
