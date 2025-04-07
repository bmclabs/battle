import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Safe check for environment variables
  const maintenanceValue = process.env.NEXT_PUBLIC_IS_MAINTENANCE;
  
  // For debugging during build (these logs will only appear during development)
  if (process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'development') {
    console.log('Middleware: NEXT_PUBLIC_IS_MAINTENANCE =', maintenanceValue);
    console.log('Middleware: typeof =', typeof maintenanceValue);
  }
  
  // Check if maintenance mode is enabled (with safety check for build time)
  const isMaintenanceMode = 
    typeof maintenanceValue !== 'undefined' && 
    maintenanceValue === 'true';
  
  // Get the pathname
  const { pathname } = request.nextUrl;
  
  // Allow access to the maintenance page even in maintenance mode
  if (pathname.startsWith('/maintenance')) {
    return NextResponse.next();
  }
  
  // Allow access to static files
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fighters') ||
    pathname.startsWith('/fonts') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }
  
  // If maintenance mode is on, redirect to maintenance page
  if (isMaintenanceMode) {
    const url = request.nextUrl.clone();
    url.pathname = '/maintenance';
    return NextResponse.redirect(url);
  }
  
  // Otherwise, proceed as normal
  return NextResponse.next();
}

// Match all routes except for static files, api routes and the maintenance page
export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internal files)
     * 3. /fonts, /images, /fighters (static files)
     * 4. /favicon.ico, /sitemap.xml, /robots.txt (SEO files)
     * 5. /maintenance (maintenance page)
     */
    '/((?!api|_next|fonts|images|fighters|maintenance|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}; 