import { supabase } from '../lib/supabaseClient';

export const verifyAdminStatus = async (email) => {
  try {
    const { data: adminProfile, error } = await supabase
      .from('admin_profiles')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Admin verification error:', error);
      return null;
    }

    return adminProfile;
  } catch (error) {
    console.error('Admin verification error:', error);
    return null;
  }
};

export const createAdminProfile = async (userData) => {
  try {
    const { data, error } = await supabase
      .from('admin_profiles')
      .insert([
        {
          email: userData.email,
          full_name: userData.fullName,
          role: 'admin',
          admin_level: 'basic',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating admin profile:', error);
    throw error;
  }
};
