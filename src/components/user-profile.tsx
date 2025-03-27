"use client";
import { User, LogOut, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function UserProfile() {
  const supabase = createClient();
  const router = useRouter();
  const [initial, setInitial] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        setIsLoading(true);
        
        // Get current session
        const { data: sessionData } = await supabase.auth.getSession();
        
        // If we have a session, get the user
        if (sessionData.session) {
          const { data } = await supabase.auth.getUser();
          
          if (data.user?.email) {
            setInitial(data.user.email.charAt(0).toUpperCase());
            setIsAuthenticated(true);
          } else if (data.user?.user_metadata?.full_name) {
            // Try to get name from metadata if email is not available
            setInitial(data.user.user_metadata.full_name.charAt(0).toUpperCase());
            setIsAuthenticated(true);
          } else if (data.user?.id) {
            // Fallback to first character of user ID
            setInitial(data.user.id.charAt(0).toUpperCase());
            setIsAuthenticated(true);
          }
        } else {
          // No active session
          setIsAuthenticated(false);
          
          // Force refresh if we think we should be authenticated
          if (document.cookie.includes('supabase-auth-token')) {
            console.log("Auth token exists but no active session. Refreshing...");
            await supabase.auth.refreshSession();
            // Retry getting the user
            const { data: refreshedData } = await supabase.auth.getUser();
            if (refreshedData.user) {
              setIsAuthenticated(true);
              setInitial(refreshedData.user.email?.charAt(0).toUpperCase() || 'U');
            }
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    getUser();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          setIsAuthenticated(true);
          setInitial(session.user.email?.charAt(0).toUpperCase() || 'U');
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setInitial("");
      }
    });
    
    // Clean up the listener
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth, router]);

  // If still loading, show loading indicator
  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" className="rounded-full bg-primary/10 w-8 h-8 theme-transition">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </Button>
    );
  }

  // If not authenticated, don't show the profile menu
  if (!isAuthenticated) {
    console.log("User not authenticated, should redirect to sign-in");
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full bg-primary/10 w-8 h-8 theme-transition">
          <span className="text-black dark:text-white font-medium theme-transition">{initial}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href="/dashboard/account" className="flex items-center theme-transition">
            <User className="mr-2 h-4 w-4" />
            My Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            try {
              await supabase.auth.signOut();
              // Clear any stored state that might be causing issues
              localStorage.removeItem('supabase.auth.token');
              
              // Force a hard refresh to ensure all state is cleared
              window.location.href = '/';
            } catch (error) {
              console.error("Error signing out:", error);
              router.push('/');
            }
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
