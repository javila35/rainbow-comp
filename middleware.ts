// Middleware disabled because auth.ts now uses Prisma which cannot run in Edge Runtime
// Authentication is handled in the layout component instead

export const config = {
  matcher: [],
};