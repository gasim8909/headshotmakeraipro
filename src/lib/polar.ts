// src/lib/polar.ts
import { Polar } from "@polar-sh/sdk";

// Initialize the Polar SDK with the access token from environment variables
export const api = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: "sandbox", // Using sandbox environment for testing
});

// Export a function to create a new Polar instance (useful for client-side code)
export const createPolarClient = (accessToken: string) => {
  return new Polar({
    accessToken,
    server: "sandbox",
  });
};
