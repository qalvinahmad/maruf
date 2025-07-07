import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';

const getStars = (count) => '★'.repeat(count) + '☆'.repeat(5 - count);

const ProjectRating = () => {
  const [ratings, setRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    average: 0,
    total: 0,
    distribution: [0, 0, 0, 0, 0], // index 0: 1-star, ..., index 4: 5-star
  });

  useEffect(() => {
    const fetchRatings = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('rating')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setRatings(data);

        // Calculate stats
        const total = data.length;
        const sum = data.reduce((acc, r) => acc + (r.rating || 0), 0);
        const average = total ? (sum / total) : 0;
        const distribution = [0, 0, 0, 0, 0];
        data.forEach(r => {
          if (r.rating >= 1 && r.rating <= 5) distribution[r.rating - 1]++;
        });
        setStats({
          average,
          total,
          distribution,
        });
      }
      setIsLoading(false);
    };
    fetchRatings();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Penilaian Pengguna</h2>
      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Memuat data penilaian...</div>
      ) : (
        <>
          {/* Statistik Rating */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow border flex flex-col items-center">
              <div className="text-4xl font-bold text-yellow-500 mb-2">
                {stats.average.toFixed(2)}
              </div>
              <div className="text-lg text-gray-700 mb-1">Rata-rata Rating</div>
              <div className="flex gap-1 text-yellow-400 text-xl">
                {getStars(Math.round(stats.average))}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow border flex flex-col items-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {stats.total}
              </div>
              <div className="text-lg text-gray-700 mb-1">Total Penilaian</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow border">
              <div className="font-semibold text-gray-700 mb-2">Distribusi Rating</div>
              <div className="space-y-1">
                {[5,4,3,2,1].map((star, idx) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="w-10 text-yellow-500">{star}★</span>
                    <div className="flex-1 bg-gray-100 rounded h-3">
                      <div
                        className="bg-yellow-400 h-3 rounded"
                        style={{
                          width: stats.total ? `${(stats.distribution[star-1] / stats.total) * 100}%` : '0%',
                          minWidth: stats.distribution[star-1] > 0 ? '8px' : 0
                        }}
                      />
                    </div>
                    <span className="w-8 text-gray-600 text-sm text-right">{stats.distribution[star-1]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daftar Rating */}
          <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50 text-gray-700 border-b">
                  <th className="px-4 py-3 text-left font-semibold">User ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Rating</th>
                  <th className="px-4 py-3 text-left font-semibold">Komentar</th>
                  <th className="px-4 py-3 text-left font-semibold">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {ratings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      Tidak ada penilaian ditemukan.
                    </td>
                  </tr>
                ) : (
                  ratings.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-xs">{r.user_id}</td>
                      <td className="px-4 py-3 text-yellow-500 font-bold">
                        {getStars(r.rating)}
                        <span className="ml-2 text-gray-700">{r.rating}</span>
                      </td>
                      <td className="px-4 py-3">{r.comment || '-'}</td>
                      <td className="px-4 py-3 text-xs">
                        {r.created_at ? new Date(r.created_at).toLocaleString('id-ID') : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectRating;
