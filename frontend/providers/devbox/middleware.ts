import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  localeDetection: false
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.match(/^\/zh-[a-zA-Z0-9-]+/)) {
    const newUrl = request.nextUrl.clone();
    newUrl.pathname = pathname.replace(/^\/zh-[a-zA-Z0-9-]+/, '/zh');
    return NextResponse.redirect(newUrl, { status: 301 });
  }

  if (pathname.match(/^\/en-[a-zA-Z0-9-]+/)) {
    const newUrl = request.nextUrl.clone();
    newUrl.pathname = pathname.replace(/^\/en-[a-zA-Z0-9-]+/, '/en');
    return NextResponse.redirect(newUrl, { status: 301 });
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
