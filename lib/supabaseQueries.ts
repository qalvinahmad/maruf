import { supabase } from './supabaseClient'; // Fix import path

// Fungsi untuk pengumuman
export const announcementQueries = {
  // Mengambil semua pengumuman
  getAll: async (type: string = 'all') => {
    let query = supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (type !== 'all') {
      query = query.eq('type', type);
    }
    
    return await query;
  },

  // Menambah pengumuman baru
  create: async (data: {
    title: string;
    message: string;
    type: string;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    return await supabase
      .from('announcements')
      .insert([{
        ...data,
        created_by: user?.id
      }])
      .select();
  },

  // Update pengumuman
  update: async (id: string, data: {
    title?: string;
    message?: string;
    type?: string;
    is_active?: boolean;
  }) => {
    return await supabase
      .from('announcements')
      .update(data)
      .eq('id', id)
      .select();
  },

  // Hapus pengumuman (soft delete)
  delete: async (id: string) => {
    return await supabase
      .from('announcements')
      .update({ is_active: false })
      .eq('id', id);
  }
};

// Fungsi untuk notifikasi personal
export const notificationQueries = {
  // Mengambil notifikasi user
  getUserNotifications: async (userId: string) => {
    return await supabase
      .from('personal_notifications')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
  },

  // Menambah notifikasi baru
  create: async (data: {
    user_id: string;
    title: string;
    message: string;
    type: string;
  }) => {
    return await supabase
      .from('personal_notifications')
      .insert([data])
      .select();
  },

  // Tandai notifikasi sudah dibaca
  markAsRead: async (id: string) => {
    return await supabase
      .from('personal_notifications')
      .update({ is_read: true })
      .eq('id', id);
  },

  // Tandai semua notifikasi sudah dibaca
  markAllAsRead: async (userId: string) => {
    return await supabase
      .from('personal_notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .is('deleted_at', null);
  },

  // Hapus notifikasi (soft delete)
  delete: async (id: string) => {
    return await supabase
      .from('personal_notifications')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
  }
};
