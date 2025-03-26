"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const ICON_SIZE = 20;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full w-8 h-8 flex items-center justify-center transition-colors hover:bg-secondary"
    >
      {theme === "dark" ? (
        <Sun size={ICON_SIZE} className="text-yellow-400" />
      ) : (
        <Moon size={ICON_SIZE} className="text-blue-600" />
      )}
    </Button>
  );
};

export { ThemeSwitcher };
