import { createBrowserClient } from "@supabase/ssr";

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
 * Create a Supabase client for the browser
 */
export const createBrowserSupabaseClient = () => {
  const supabaseUrl = getEnvVariable("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseKey = getEnvVariable("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  
  return createBrowserClient(supabaseUrl, supabaseKey);
};
