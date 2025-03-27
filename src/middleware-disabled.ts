// This file has been disabled because middleware cannot be used with "output: export"
// The functionality has been moved to client-side components:
// - src/components/client-auth-protection.tsx
// - src/components/client-subscription-check.tsx

// Keeping this file for reference, but it's not active in the current build
// If you need to switch back to server rendering, you can restore this file's original content

/*
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Middleware implementation moved to client-side
}

export const config = {
  matcher: []
}
*/
