import { motion } from 'framer-motion';
import AdminDropdown from '../../widget/AdminDropdown';

const EventModal = ({ 
  showModal, 
  setShowModal, 
  isEditing, 
  currentEvent, 
  handleInputChange, 
  handleSaveEvent, 
  filterOptions 
}) => {
  if (!showModal) return null;

  const renderEventTypeSelect = () => (
    <AdminDropdown
      label="Tipe"
      name="type"
      value={currentEvent.type}
      options={filterOptions.type.filter(opt => opt.value !== 'all')}
      onChange={(value) => handleInputChange({ target: { name: 'type', value }})}
      className="w-full"
    />
  );

  const renderEventStatusSelect = () => (
    <AdminDropdown
      label="Status"
      name="status" 
      value={currentEvent.status}
      options={filterOptions.status.filter(opt => opt.value !== 'all')}
      onChange={(value) => handleInputChange({ target: { name: 'status', value }})}
      className="w-full"
    />
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl p-6 w-full max-w-md"
      >
        <h3 className="text-lg font-bold mb-4">{isEditing ? 'Edit Event' : 'Tambah Event Baru'}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Judul</label>
            <input 
              type="text" 
              name="title"
              value={currentEvent.title}
              onChange={handleInputChange}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="Masukkan judul event"
            />
          </div>
          {renderEventTypeSelect()}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Deskripsi</label>
            <textarea 
              name="description"
              value={currentEvent.description}
              onChange={handleInputChange}
              className="w-full border rounded-lg p-2 h-24 focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="Masukkan deskripsi event"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Tanggal</label>
            <input 
              type="date" 
              name="date"
              value={currentEvent.date}
              onChange={handleInputChange}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
          {renderEventStatusSelect()}
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <button 
            className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setShowModal(false)}
          >
            Batal
          </button>
          <button 
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={handleSaveEvent}
          >
            Simpan
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default EventModal;
