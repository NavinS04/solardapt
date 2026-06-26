import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/*
 * Auth gate placeholder. In production, replace this with Clerk's
 * `clerkMiddleware` and protect `/admin/*` + `/api/admin/*` with RBAC
 * (admin / staff / viewer). Until Clerk keys are configured this is a no-op so
 * the app runs end-to-end (BUILD_SPEC §8).
 *
 * Example (after `npm i @clerk/nextjs`):
 *   import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
 *   const isAdmin = createRouteMatcher(['/admin(.*)']);
 *   export default clerkMiddleware((auth, req) => { if (isAdmin(req)) auth().protect(); });
 */
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
