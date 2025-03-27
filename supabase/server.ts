import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Create a Supabase client for server components
 * This uses the Next.js App Router cookies() API
 */
export const createClient = () => {
  // @ts-ignore - Ignoring TypeScript errors with cookies API
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // @ts-ignore - Next.js cookies API TypeScript issue
        get(name) {
          return cookies().get(name)?.value;
        },
        // @ts-ignore - Next.js cookies API TypeScript issue
        set(name, value, options) {
          // Add secure cookie settings for production
          const cookieOptions = {
            ...options,
            secure: process.env.NODE_ENV === 'production',
            path: '/'
          };
          
          cookies().set(name, value, cookieOptions);
        },
        // @ts-ignore - Next.js cookies API TypeScript issue
        remove(name, options) {
          cookies().set(name, "", { 
            ...options, 
            maxAge: 0,
            secure: process.env.NODE_ENV === 'production',
            path: '/' 
          });
        },
      },
      auth: {
        flowType: 'pkce', // Use PKCE flow for better security
        autoRefreshToken: true,
        persistSession: true
      }
    }
  );
};
