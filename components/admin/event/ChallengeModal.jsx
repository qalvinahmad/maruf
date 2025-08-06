import { AnimatePresence, motion } from 'framer-motion';
import AdminDropdown from '../../widget/AdminDropdown';

const ChallengeModal = ({ 
  showAddChallengeModal, 
  setShowAddChallengeModal, 
  editingChallenge, 
  setEditingChallenge, 
  handleSubmitChallenge 
}) => {
  return (
    <AnimatePresence>
      {showAddChallengeModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl"
          >
            <h3 className="text-xl font-semibold mb-4">
              {editingChallenge ? 'Edit Tantangan' : 'Tambah Tantangan Baru'}
            </h3>
            <form onSubmit={handleSubmitChallenge} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Judul</label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={editingChallenge?.title}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea
                  name="description"
                  required
                  defaultValue={editingChallenge?.description}
                  className="w-full p-2 border rounded h-24"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <AdminDropdown
                    label="Level"
                    name="difficulty"
                    value={editingChallenge?.difficulty || 'beginner'}
                    options={[
                      { value: 'beginner', label: 'Pemula' },
                      { value: 'intermediate', label: 'Menengah' },
                      { value: 'advanced', label: 'Lanjutan' }
                    ]}
                    onChange={(value) => {
                      // Store the selected value for form submission
                      if (editingChallenge) {
                        setEditingChallenge({ ...editingChallenge, difficulty: value });
                      }
                    }}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Poin</label>
                  <input
                    type="number"
                    name="points"
                    required
                    min="1"
                    defaultValue={editingChallenge?.points || 100}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    name="start_date"
                    required
                    defaultValue={editingChallenge?.start_date?.split('T')[0]}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    name="end_date"
                    required
                    defaultValue={editingChallenge?.end_date?.split('T')[0]}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddChallengeModal(false);
                    setEditingChallenge(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingChallenge ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChallengeModal;
