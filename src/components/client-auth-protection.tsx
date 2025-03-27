'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';

type AuthProtectionProps = {
  children: ReactNode;
  allowGuest?: boolean;
};

export default function ClientAuthProtection({ 
  children, 
  allowGuest = false 
}: AuthProtectionProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkAuth() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth session error:', error);
        setIsAuthenticated(false);
      } else if (session) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    }
    
    checkAuth();
  }, []);
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Check if this is a protected path that requires authentication
      const isProtectedPath = pathname.startsWith('/dashboard') && 
                             (!allowGuest || !pathname.startsWith('/dashboard/guest'));
      
      if (isProtectedPath) {
        router.push('/sign-in');
      }
    }
  }, [isLoading, isAuthenticated, pathname, router, allowGuest]);
  
  // Show loading state, could be replaced with a spinner or loading component
  if (isLoading) {
    return <div className="w-full h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // For protected routes, only show content if authenticated
  if (pathname.startsWith('/dashboard') && 
      (!allowGuest || !pathname.startsWith('/dashboard/guest'))) {
    return isAuthenticated ? <>{children}</> : null;
  }
  
  // For public routes and guest routes, always show content
  return <>{children}</>;
}
