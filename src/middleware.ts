// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // Redirect root path "/" to "/chat"
  if (url.pathname === '/') {
    url.pathname = '/chat';
    return NextResponse.redirect(url);
  }

  // Allow all other requests to continue normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply middleware to all routes except static assets
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
