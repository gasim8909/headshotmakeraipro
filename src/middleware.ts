import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Add the pathname to the headers so it can be accessed in server components
  res.headers.set('x-pathname', req.nextUrl.pathname)

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll().map(({ name, value }) => ({
              name,
              value,
            }))
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              req.cookies.set({
                name, 
                value,
                ...options
              })
              res.cookies.set({
                name, 
                value,
                ...options
              })
            })
          },
        },
      }
    )

    // Refresh session if expired - required for Server Components
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Auth session error:', error)
    } else if (session) {
      // Log successful session retrieval for debugging
      console.log('Session found for user:', session.user.id)
      
      // Handle path-specific authentication checks
      const path = req.nextUrl.pathname
      
      // Protect dashboard routes that aren't guest routes
      if (path.startsWith('/dashboard') && 
          !path.startsWith('/dashboard/guest') && 
          !session) {
        console.log('Protected route access attempt without session, redirecting to /sign-in')
        return NextResponse.redirect(new URL('/sign-in', req.url))
      }
    } else {
      console.log('No active session found in middleware')
      
      // Check if we're trying to access a protected route
      const path = req.nextUrl.pathname
      if (path.startsWith('/dashboard') && !path.startsWith('/dashboard/guest')) {
        console.log('Protected route access attempt, redirecting to /sign-in')
        return NextResponse.redirect(new URL('/sign-in', req.url))
      }
    }
  } catch (e) {
    console.error('Middleware error:', e)
  }

  return res
}

// Ensure the middleware is only called for relevant paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api/polar/webhook (webhook endpoints)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/polar/webhook).*)',
  ],
}
