import { supabase } from './supabaseClient';

export const announcementQueries = {
  getAll: async () => {
    return await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
  },

  create: async (data) => {
    return await supabase
      .from('announcements')
      .insert([{
        ...data,
        created_by: supabase.auth.user()?.id
      }]);
  },

  update: async (id, data) => {
    return await supabase
      .from('announcements')
      .update(data)
      .eq('id', id);
  },

  delete: async (id) => {
    return await supabase
      .from('announcements')
      .update({ is_active: false })
      .eq('id', id);
  }
};

export const notificationQueries = {
  getUserNotifications: async (userId) => {
    return await supabase
      .from('personal_notifications')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
  },

  markAsRead: async (id) => {
    return await supabase
      .from('personal_notifications')
      .update({ is_read: true })
      .eq('id', id);
  },

  markAllAsRead: async (userId) => {
    return await supabase
      .from('personal_notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .is('deleted_at', null);
  },

  delete: async (id) => {
    const now = new Date().toISOString();
    return await supabase
      .from('personal_notifications')
      .update({ deleted_at: now })
      .eq('id', id);
  }
};
