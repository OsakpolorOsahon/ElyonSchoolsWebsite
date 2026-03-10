import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Skip Supabase auth checks if credentials are not configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Allow public pages to work without Supabase
    const publicPaths = ['/', '/about', '/academics', '/admissions', '/contact', '/gallery', '/news', '/events', '/payments']
    const isPublicPath = publicPaths.some(path => 
      request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith('/_next')
    )
    
    // Redirect portal routes to login with a message that auth is not configured
    if (request.nextUrl.pathname.startsWith('/admin') ||
        request.nextUrl.pathname.startsWith('/teacher') ||
        request.nextUrl.pathname.startsWith('/parent') ||
        request.nextUrl.pathname.startsWith('/student')) {
      return NextResponse.redirect(new URL('/login?error=auth_not_configured', request.url))
    }
    
    return response
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get user profile with role if session exists
  let userRole: string | null = null
  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    userRole = profile?.role || null
  }

  // Protect portal routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session || userRole !== 'admin') {
      return NextResponse.redirect(new URL('/auth/login?redirect=/admin', request.url))
    }
  }

  if (request.nextUrl.pathname.startsWith('/teacher')) {
    if (!session || userRole !== 'teacher') {
      return NextResponse.redirect(new URL('/auth/login?redirect=/teacher', request.url))
    }
  }

  if (request.nextUrl.pathname.startsWith('/parent')) {
    if (!session || userRole !== 'parent') {
      return NextResponse.redirect(new URL('/auth/login?redirect=/parent', request.url))
    }
  }

  if (request.nextUrl.pathname.startsWith('/student')) {
    if (!session || userRole !== 'student') {
      return NextResponse.redirect(new URL('/auth/login?redirect=/student', request.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname.startsWith('/auth') && session) {
    // Redirect to appropriate dashboard based on role
    const dashboards: Record<string, string> = {
      admin: '/admin',
      teacher: '/teacher',
      parent: '/parent',
      student: '/student',
    }
    const redirectUrl = userRole ? dashboards[userRole] || '/' : '/'
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
