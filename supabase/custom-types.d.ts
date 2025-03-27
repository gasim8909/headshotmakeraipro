/**
 * Type declarations to fix compatibility issues between Next.js and Supabase
 */
declare module "next/headers" {
  export function cookies(): {
    get(name: string): { name: string; value: string } | undefined;
    getAll(): Array<{ name: string; value: string }>;
    set(name: string, value: string, options?: any): void;
    set(options: { name: string; value: string; [key: string]: any }): void;
  };
}
