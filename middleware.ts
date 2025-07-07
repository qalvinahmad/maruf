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

    // Add teacher path check
    const isTeacherPath = req.nextUrl.pathname.startsWith('/authentication/teacher');
    const isTeacherLoginPath = req.nextUrl.pathname === '/authentication/teacher/loginTeacher';

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

    // Teacher middleware logic
    if (isTeacherPath && !isTeacherLoginPath) {
      if (!session) {
        return NextResponse.redirect(new URL('/authentication/teacher/loginTeacher', req.url));
      }

      // Verify teacher status
      const { data: teacherData } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('email', session.user.email)
        .eq('is_verified', true)
        .single();

      if (!teacherData) {
        return NextResponse.redirect(new URL('/authentication/teacher/loginTeacher', req.url));
      }
    }

    if (isTeacherLoginPath && session) {
      const { data: teacherData } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('email', session.user.email)
        .eq('is_verified', true)
        .single();

      if (teacherData) {
        return NextResponse.redirect(new URL('/dashboard/DashboardProjects', req.url));
      }
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/authentication/admin/loginAdmin', req.url));
  }
}

export const config = {
  matcher: [
    '/authentication/admin/:path*',
    '/authentication/teacher/:path*', // Add teacher paths
    '/dashboard/DashboardProjects',
    '/dashboard/DashboardBelajar',
    '/dashboard/:path*'
  ],
};
