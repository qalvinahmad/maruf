import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import AdminDropdown from '../../widget/AdminDropdown';

const ChallengesTable = ({ 
  challenges, 
  challengeFilter, 
  setChallengeFilter, 
  challengeSearch, 
  setShowAddChallengeModal, 
  handleEditChallenge, 
  handleDeleteChallenge 
}) => {
  return (
    <div className="mt-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Tantangan Harian</h2>
          <button
            onClick={() => setShowAddChallengeModal(true)}
            className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <IconPlus size={18} />
            <span>Tambah Tantangan</span>
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <AdminDropdown
            label="Level"
            value={challengeFilter}
            options={[
              { value: 'all', label: 'Semua Level' },
              { value: 'beginner', label: 'Pemula' },
              { value: 'intermediate', label: 'Menengah' },
              { value: 'advanced', label: 'Lanjutan' }
            ]}
            onChange={(value) => setChallengeFilter(value)}
            className="min-w-[180px]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-50 text-gray-700 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Judul</th>
                <th className="px-4 py-3 text-left font-semibold">Level</th>
                <th className="px-4 py-3 text-left font-semibold">Poin</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Periode</th>
                <th className="px-4 py-3 text-left font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {challenges
                .filter(challenge => 
                  (challengeFilter === 'all' || challenge.difficulty === challengeFilter) &&
                  (challenge.title.toLowerCase().includes(challengeSearch.toLowerCase()) ||
                   challenge.description?.toLowerCase().includes(challengeSearch.toLowerCase()))
                )
                .map((challenge) => (
                  <tr key={challenge.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-800">{challenge.title}</div>
                        <div className="text-sm text-gray-500">{challenge.description}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        challenge.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        challenge.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {challenge.difficulty === 'beginner' ? 'Pemula' :
                         challenge.difficulty === 'intermediate' ? 'Menengah' : 'Lanjutan'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{challenge.points} poin</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        challenge.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {challenge.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div>{new Date(challenge.start_date).toLocaleDateString('id-ID')}</div>
                        <div className="text-gray-500">hingga</div>
                        <div>{new Date(challenge.end_date).toLocaleDateString('id-ID')}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditChallenge(challenge)}
                          className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
                        >
                          <IconEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteChallenge(challenge.id)}
                          className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                        >
                          <IconTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ChallengesTable;
