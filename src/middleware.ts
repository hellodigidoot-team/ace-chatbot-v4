// src/middleware.ts
import { NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
]);

const isAuthPage = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();
  const url = req.nextUrl;

  // If already signed in and visiting root or auth pages -> /chat
  if (userId && (url.pathname === '/' || isAuthPage(req))) {
    url.pathname = '/chat';
    return NextResponse.redirect(url);
  }

  // If route is NOT public and NOT signed in -> sign in
  if (!isPublicRoute(req) && !userId) {
    return redirectToSignIn
      ? redirectToSignIn({ returnBackUrl: req.url })
      : NextResponse.redirect(new URL('/sign-in', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
