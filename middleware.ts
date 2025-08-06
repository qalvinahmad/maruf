import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    const { data: { session } } = await supabase.auth.getSession();

    const isAdminPath = req.nextUrl.pathname.startsWith('/dashboard/DashboardProjects');
    const isAdminLoginPath = req.nextUrl.pathname.startsWith('/authentication/admin/loginAdmin');

    // Admin-only logic (keep existing)
    if (isAdminPath) {
      if (!session) {
        return NextResponse.redirect(new URL('/authentication/admin/loginAdmin', req.url));
      }

      // Verify admin status
      const { data: adminData } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('email', session.user.email)
        .eq('is_active', true)
        .eq('role', 'admin')
        .single();

      if (!adminData) {
        return NextResponse.redirect(new URL('/authentication/admin/loginAdmin', req.url));
      }
    }

    if (isAdminLoginPath && session) {
      const { data: adminData } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('email', session.user.email)
        .eq('is_active', true)
        .eq('role', 'admin')
        .single();

      if (adminData) {
        return NextResponse.redirect(new URL('/dashboard/DashboardProjects', req.url));
      }
    }

    // Teacher authentication is handled by client-side code only
    // No middleware intervention for teacher routes to prevent conflicts
    // with localStorage-based authentication

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // Only redirect to admin login for admin-related errors
    if (req.nextUrl.pathname.startsWith('/dashboard/DashboardProjects') || 
        req.nextUrl.pathname.startsWith('/authentication/admin')) {
      return NextResponse.redirect(new URL('/authentication/admin/loginAdmin', req.url));
    }
    return res;
  }
}

export const config = {
  matcher: [
    '/authentication/admin/:path*',
    // Temporarily disable teacher middleware to fix redirect loop
    // '/authentication/teacher/loginTeacher', 
    '/dashboard/DashboardProjects',
    '/dashboard/DashboardBelajar', 
    // '/dashboard/teacher/:path*', // Disabled teacher dashboard middleware
    '/dashboard/:path*'
  ],
};
