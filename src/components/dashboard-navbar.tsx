"use client";

import Link from "next/link";
import { createClient } from "../../supabase/client";
import { Button } from "./ui/button";
import { Image as ImageIcon, Sparkles } from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";
import UserProfile from "./user-profile";
import { useRouter, usePathname } from "next/navigation";
import { Badge } from "./ui/badge";

export default function DashboardNavbar({
  isGuest = false,
}: {
  isGuest?: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const isCreatePage = pathname?.startsWith('/create');

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
        <div className="flex gap-4 items-center">
          {isGuest ? (
            <>
              <ThemeSwitcher />
              <Link href="/sign-up">
                <Button className="bg-gradient-primary hover:opacity-90 transition-opacity theme-transition">
                  Sign Up
                </Button>
              </Link>
            </>
          ) : (
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
          )}
        </div>
      </div>
    </nav>
  );
}
