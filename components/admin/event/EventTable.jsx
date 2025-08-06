import { IconCheck, IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import AdminDropdown from '../../widget/AdminDropdown';

const EventTable = ({ 
  events, 
  handleAddEvent, 
  handleEditEvent, 
  handleDeleteEvent 
}) => {
  return (
    <>
      {/* Header Tabel dengan Button Tambah Event */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Event Tahunan</h2>
        <motion.button
          onClick={handleAddEvent}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          <IconPlus size={18} />
          <span>Tambah Event</span>
        </motion.button>
      </div>
      
      {/* Tabel Event */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Judul</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Tipe</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Tanggal</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {events.length > 0 ? (
                events.map((event) => (
                  <tr key={event.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">{event.title}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        event.type === 'Acara' ? 'bg-purple-100 text-purple-800' : 
                        event.type === 'Sistem' ? 'bg-blue-100 text-blue-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {event.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">{new Date(event.date).toLocaleDateString('id-ID')}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        event.status === 'Aktif' ? 'bg-green-100 text-green-800' : 
                        event.status === 'Dijadwalkan' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <AdminDropdown
                          variant="menu"
                          buttonText="Actions"
                          buttonColor="bg-gray-600 hover:bg-gray-700"
                          options={[
                            ...(event.status === 'Dijadwalkan' ? [
                              {
                                value: 'activate',
                                label: 'Aktifkan Event',
                                icon: <IconCheck size={16} />,
                                action: () => handleEditEvent(event),
                                color: 'hover:bg-green-50 hover:text-green-700'
                              },
                              {
                                value: 'edit',
                                label: 'Edit Event',
                                icon: <IconEdit size={16} />,
                                action: () => handleEditEvent(event),
                                color: 'hover:bg-blue-50 hover:text-blue-700'
                              },
                              {
                                value: 'delete',
                                label: 'Hapus Event',
                                icon: <IconTrash size={16} />,
                                action: () => handleDeleteEvent(event.id),
                                color: 'hover:bg-red-50 hover:text-red-700'
                              }
                            ] : []),
                            ...(event.status === 'Aktif' ? [
                              {
                                value: 'edit',
                                label: 'Edit Event',
                                icon: <IconEdit size={16} />,
                                action: () => handleEditEvent(event),
                                color: 'hover:bg-blue-50 hover:text-blue-700'
                              },
                              {
                                value: 'complete',
                                label: 'Tandai Selesai',
                                icon: <IconCheck size={16} />,
                                action: () => {
                                  const updatedEvent = { ...event, status: 'Selesai' };
                                  handleEditEvent(updatedEvent);
                                },
                                color: 'hover:bg-green-50 hover:text-green-700'
                              },
                              {
                                value: 'delete',
                                label: 'Hapus Event',
                                icon: <IconTrash size={16} />,
                                action: () => handleDeleteEvent(event.id),
                                color: 'hover:bg-red-50 hover:text-red-700'
                              }
                            ] : []),
                            ...(event.status === 'Selesai' ? [
                              {
                                value: 'view',
                                label: 'Lihat Detail',
                                icon: <IconEdit size={16} />,
                                action: () => handleEditEvent(event),
                                color: 'hover:bg-blue-50 hover:text-blue-700'
                              },
                              {
                                value: 'reactivate',
                                label: 'Aktifkan Lagi',
                                icon: <IconCheck size={16} />,
                                action: () => {
                                  const updatedEvent = { ...event, status: 'Aktif' };
                                  handleEditEvent(updatedEvent);
                                },
                                color: 'hover:bg-green-50 hover:text-green-700'
                              }
                            ] : [])
                          ]}
                          className="w-auto"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    Tidak ada event yang ditemukan. Silakan tambahkan event baru atau ubah filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="mt-4 mb-4 px-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Menampilkan {events.length > 0 ? '1' : '0'}-{events.length} dari {events.length} event
          </div>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">Sebelumnya</button>
            <button className="px-3 py-1 border rounded bg-blue-600 text-white">1</button>
            <button className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-100 transition-colors">Selanjutnya</button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default EventTable;
