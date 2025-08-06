import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useAdminAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.replace('/authentication/admin/loginAdmin');
          return;
        }

        // Verify admin status
        const { data: admin, error } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error || !admin) {
          await supabase.auth.signOut();
          router.replace('/authentication/admin/loginAdmin');
          return;
        }

        setIsAdmin(true);
        setAdminData(admin);
      } catch (error) {
        console.error('Admin auth check error:', error);
        router.replace('/authentication/admin/loginAdmin');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [router]);

  return { isLoading, isAdmin, adminData };
}
