// This file has been disabled because middleware cannot be used with "output: export"
// The functionality has been moved to client-side components:
// - src/components/client-auth-protection.tsx
// - src/components/client-subscription-check.tsx

/*
import React from "react";
import { updateSession } from "./supabase/middleware";
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: []
};
*/
