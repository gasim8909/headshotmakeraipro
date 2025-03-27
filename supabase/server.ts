import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { CookieOptions } from "@supabase/ssr";

/**
 * Safely retrieves environment variables with proper error handling
 * @param key The environment variable key to retrieve
 * @returns The environment variable value
 * @throws Error if the environment variable is not defined
 */
const getEnvVariable = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

/**
 * Create a Supabase client for server components
 * This uses the Next.js App Router cookies() API
 * 
 * NOTE: In Next.js 15.x, the cookies() function returns a Promise<ReadonlyRequestCookies>
 * which conflicts with what Supabase expects. We use 'as any' casting to work around 
 * this type mismatch. The code works at runtime despite TypeScript errors.
 */
export const createClient = () => {
  const supabaseUrl = getEnvVariable("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseKey = getEnvVariable("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        try {
          // Using 'as any' to bypass TypeScript errors with Next.js 15.x cookies API
          const cookieStore = cookies() as any;
          return cookieStore.get(name)?.value;
        } catch (error) {
          console.error(`Error getting cookie ${name}:`, error);
          return undefined;
        }
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          // Using 'as any' to bypass TypeScript errors with Next.js 15.x cookies API
          const cookieStore = cookies() as any;
          
          // Add secure cookie settings for production
          const cookieOptions = {
            ...options,
            secure: process.env.NODE_ENV === 'production',
            path: '/'
          };
          
          cookieStore.set(name, value, cookieOptions);
        } catch (error) {
          console.error(`Error setting cookie ${name}:`, error);
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          // Using 'as any' to bypass TypeScript errors with Next.js 15.x cookies API
          const cookieStore = cookies() as any;
          
          cookieStore.set(name, "", { 
            ...options, 
            maxAge: 0,
            secure: process.env.NODE_ENV === 'production',
            path: '/' 
          });
        } catch (error) {
          console.error(`Error removing cookie ${name}:`, error);
        }
      },
    },
    auth: {
      flowType: 'pkce', // Use PKCE flow for better security
      autoRefreshToken: true,
      persistSession: true
    }
  });
};
