import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminDialog({ isOpen, onClose, mode = 'add', adminData = null, onSuccess }) {
  const [formData, setFormData] = useState({
    email: adminData?.email || '',
    full_name: adminData?.full_name || '',
    password: '',
    admin_level: adminData?.admin_level || 'basic',
    role: adminData?.role || 'admin',
    is_active: adminData?.is_active ?? true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'add') {
        // Create auth user first
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              role: 'admin'
            }
          }
        });

        if (authError) throw authError;

        // Create admin profile
        const { error: profileError } = await supabase
          .from('admin_profiles')
          .insert([{
            email: formData.email,
            full_name: formData.full_name,
            role: formData.role,
            admin_level: formData.admin_level,
            is_active: formData.is_active,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (profileError) throw profileError;
      } else if (mode === 'edit') {
        // Update admin profile
        const { error: updateError } = await supabase
          .from('admin_profiles')
          .update({
            full_name: formData.full_name,
            role: formData.role,
            admin_level: formData.admin_level,
            is_active: formData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('email', adminData.email);

        if (updateError) throw updateError;
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {mode === 'add' ? 'Tambah Admin Baru' : 'Edit Admin'}
            </h3>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  disabled={mode === 'edit'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>

              {mode === 'add' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level Admin
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.admin_level}
                  onChange={(e) => setFormData({ ...formData, admin_level: e.target.value })}
                >
                  <option value="basic">Basic</option>
                  <option value="advanced">Advanced</option>
                  <option value="super">Super</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                  Aktif
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Memproses...' : mode === 'add' ? 'Tambah' : 'Simpan'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
