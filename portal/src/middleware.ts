import { NextRequest, NextResponse } from 'next/server';

// Auth protection strategy:
// - /account/* pages do their own client-side auth check via useAuth()
//   and redirect to /login if user is null. No server cookie needed.
// - /admin/* pages additionally verify admin role on the server.
//
// We only block here if we have a definitive "not logged in" signal —
// i.e. no __session cookie AND the request is for admin routes.
// For /account/* we pass through and let the page handle it,
// because the Firebase client SDK auth state is always the source of truth.

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get('__session')?.value;

  // Admin routes: require session cookie (hard block)
  if (pathname.startsWith('/admin') && !session) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Account routes: pass through — pages handle auth themselves via useAuth()
  // This avoids issues where the session cookie hasn't been set yet
  // even though Firebase client auth is active.

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/admin/:path*'],
};
