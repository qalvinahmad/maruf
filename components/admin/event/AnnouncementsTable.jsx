import { IconActivity, IconBell, IconEdit, IconPlus, IconSettings, IconTrash } from '@tabler/icons-react';
import { motion } from 'framer-motion';

const AnnouncementsTable = ({ 
  events, 
  handleAddEvent, 
  handleEditEvent, 
  handleDeleteEvent 
}) => {
  return (
    <>
      {/* Pengumuman Content */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Kelola Pengumuman</h2>
          <button
            onClick={handleAddEvent}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <IconPlus size={18} />
            <span>Tambah Pengumuman</span>
          </button>
        </div>
        
        {/* Quick Stats for Announcements */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <IconBell className="text-green-600" size={16} />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Total Pengumuman</p>
                <p className="text-lg font-bold text-green-800">{events.filter(e => e.type === 'Pengumuman').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <IconSettings className="text-blue-600" size={16} />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Sistem & Update</p>
                <p className="text-lg font-bold text-blue-800">{events.filter(e => e.type === 'Sistem').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <IconActivity className="text-yellow-600" size={16} />
              </div>
              <div>
                <p className="text-sm text-yellow-600 font-medium">Aktif</p>
                <p className="text-lg font-bold text-yellow-800">{events.filter(e => (e.type === 'Pengumuman' || e.type === 'Sistem') && e.status === 'Aktif').length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-50 text-gray-700 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Judul</th>
                <th className="px-4 py-3 text-left font-semibold">Tipe</th>
                <th className="px-4 py-3 text-left font-semibold">Deskripsi</th>
                <th className="px-4 py-3 text-left font-semibold">Tanggal</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {events.length > 0 ? (
                events.map((event, index) => (
                  <motion.tr
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50 transition-all duration-200"
                  >
                    <td className="px-4 py-3 font-semibold text-gray-800">{event.title}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.type === 'Pengumuman' ? 'bg-green-100 text-green-700' :
                        event.type === 'Sistem' ? 'bg-blue-100 text-blue-700' :
                        event.type === 'Kegiatan' ? 'bg-purple-100 text-purple-700' :
                        event.type === 'Maintenance' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {event.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{event.description}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(event.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.status === 'Aktif' ? 'bg-green-100 text-green-700' :
                        event.status === 'Dijadwalkan' ? 'bg-yellow-100 text-yellow-700' :
                        event.status === 'Selesai' ? 'bg-gray-100 text-gray-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                          title="Edit"
                        >
                          <IconEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-800 transition-colors p-1"
                          title="Hapus"
                        >
                          <IconTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    Tidak ada pengumuman yang ditemukan. Silakan tambahkan pengumuman baru atau ubah filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </>
  );
};

export default AnnouncementsTable;
