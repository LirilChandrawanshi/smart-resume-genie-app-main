import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const userRaw = request.cookies.get('user')?.value;

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

  if (isAdminRoute) {
    if (!token || !userRaw) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    let parsedUser: { roles?: string[] } | null = null;
    try {
      parsedUser = JSON.parse(decodeURIComponent(userRaw));
    } catch {
      try {
        parsedUser = JSON.parse(userRaw);
      } catch {
        parsedUser = null;
      }
    }
    if (!parsedUser?.roles?.includes('ROLE_ADMIN')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
