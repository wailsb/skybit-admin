import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyRefreshToken } from '@/lib/jwt';

// Define public routes that don't require authentication
const publicRoutes = ['/login'];

// Define routes that indicate the user is already authenticated but shouldn't be here
const authRoutes = ['/login', '/'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get refresh token from cookie
  const refreshToken = request.cookies.get('refresh_token')?.value;
  
  // Verify if it's a valid session token (Edge compatible)
  const isValidSession = refreshToken ? await verifyRefreshToken(refreshToken) : null;

  // 1. If user is authenticated and tries to access /login or /, redirect to dashboard
  if (isValidSession && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. If user is NOT authenticated and tries to access a protected route
  // A simple way to check protected routes: if it's not in publicRoutes and not exactly / 
  // Wait, if it's just / we might want them to go to /login or a public landing page. 
  // Let's protect everything except /login and /.
  if (!isValidSession && !publicRoutes.includes(pathname) && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - protected via their own logic if needed, or we can include them)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo.png, logo.svg, etc.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
