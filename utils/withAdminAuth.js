import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const withAdminAuth = async (context) => {
  const supabase = createServerSupabaseClient(context);

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return {
        redirect: {
          destination: '/authentication/admin/loginAdmin',
          permanent: false,
        },
      };
    }

    // Check admin status using email from session
    const { data: adminData, error: adminError } = await supabase
      .from('admin_profiles')
      .select('*')
      .eq('email', session.user.email)
      .eq('is_active', true)
      .single();

    if (adminError || !adminData || !['admin', 'superadmin'].includes(adminData.role)) {
      await supabase.auth.signOut();
      return {
        redirect: {
          destination: '/authentication/admin/loginAdmin',
          permanent: false,
        },
      };
    }

    return {
      props: {
        initialSession: session,
        admin: adminData,
      },
    };
  } catch (error) {
    console.error('Admin auth error:', error);
    return {
      redirect: {
        destination: '/authentication/admin/loginAdmin',
        permanent: false,
      },
    };
  }
};

export default withAdminAuth;
