import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

const LeaderboardManagement = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      // Since we don't have a specific leaderboard table, we'll use student_profiles
      // and calculate rankings based on their learning progress
      const { data, error } = await supabase
        .from('student_profiles')
        .select(`
          id,
          email,
          full_name,
          level,
          total_exp,
          streak_days,
          status,
          created_at
        `)
        .eq('is_active', true)
        .order('total_exp', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Add ranking and mock some additional data for display
      const rankedData = (data || []).map((student, index) => ({
        ...student,
        rank: index + 1,
        // Mock some data for better display
        letters_mastered: Math.floor(Math.random() * 28) + 1,
        weekly_exp: Math.floor(student.total_exp * 0.1) + Math.floor(Math.random() * 500)
      }));
      
      setLeaderboardData(rankedData);
      
      // Get current user info (teacher)
      const teacherId = localStorage.getItem('teacherId');
      if (teacherId) {
        setCurrentUser({
          id: teacherId,
          name: localStorage.getItem('userName') || 'Guru',
          rank: Math.floor(Math.random() * 20) + 10, // Mock teacher rank
          exp: Math.floor(Math.random() * 2000) + 1000,
          letters: Math.floor(Math.random() * 28) + 10
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, [selectedPeriod]);

  const getPeriodText = (period) => {
    switch (period) {
      case 'week': return 'Minggu Ini';
      case 'month': return 'Bulan Ini';
      case 'all': return 'Sepanjang Waktu';
      default: return 'Minggu Ini';
    }
  };

  const getLevelText = (level) => {
    if (level >= 8) return 'Mahir';
    if (level >= 6) return 'Menengah';
    if (level >= 4) return 'Pemula Lanjutan';
    return 'Pemula';
  };

  const getMedalColor = (rank) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-300 to-gray-500';
      case 3: return 'from-yellow-600 to-yellow-800';
      default: return 'from-gray-200 to-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error}</p>
        <button 
          onClick={fetchLeaderboardData}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const topThree = leaderboardData.slice(0, 3);
  const others = leaderboardData.slice(3, 8);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Filter Periode */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-wrap gap-2">
          {['week', 'month', 'all'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-secondary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getPeriodText(period)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Top 3 */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-gray-800">Top Performers</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {getPeriodText(selectedPeriod)}
            </span>
          </div>
        </div>
        
        {topThree.length >= 3 ? (
          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Second Place */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="relative pt-8 pb-4 px-4 bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl text-center border border-gray-200"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-[#C0C0C0] text-white flex items-center justify-center font-bold shadow-lg">2</div>
              <div className="w-20 h-20 rounded-full bg-white mx-auto mb-3 flex items-center justify-center text-xl font-bold text-secondary border-4 border-[#C0C0C0] shadow-md">
                {topThree[1]?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <h3 className="font-semibold text-lg mb-1">{topThree[1]?.full_name || 'User'}</h3>
              <p className="text-sm text-gray-600 mb-2">Level {topThree[1]?.level || 1} • {getLevelText(topThree[1]?.level || 1)}</p>
              <p className="text-lg font-bold text-gray-800 mb-2">{topThree[1]?.total_exp || 0} XP</p>
              <div className="flex justify-center gap-2">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {topThree[1]?.letters_mastered || 0} Huruf
                </span>
              </div>
            </motion.div>

            {/* First Place */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="relative pt-10 pb-6 px-4 bg-gradient-to-b from-yellow-50 to-yellow-100 rounded-xl text-center border-2 border-yellow-300 shadow-xl -mt-4"
            >
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white flex items-center justify-center font-bold text-xl shadow-lg">1</div>
              <div className="w-24 h-24 rounded-full bg-white mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-yellow-600 border-4 border-yellow-400 shadow-md">
                {topThree[0]?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <h3 className="font-bold text-xl mb-1">{topThree[0]?.full_name || 'User'}</h3>
              <p className="text-sm text-gray-600 mb-2">Level {topThree[0]?.level || 1} • {getLevelText(topThree[0]?.level || 1)}</p>
              <p className="text-xl font-bold text-gray-800 mb-3">{topThree[0]?.total_exp || 0} XP</p>
              <div className="flex justify-center gap-2">
                <span className="text-xs bg-yellow-200 text-yellow-700 px-2 py-0.5 rounded-full">
                  {topThree[0]?.letters_mastered || 0} Huruf
                </span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  {topThree[0]?.streak_days || 0} Hari Streak
                </span>
              </div>
            </motion.div>

            {/* Third Place */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="relative pt-8 pb-4 px-4 bg-gradient-to-b from-[#FFA07A] to-[#CD853F] bg-opacity-10 rounded-xl text-center border border-[#CD853F]"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-[#CD853F] text-white flex items-center justify-center font-bold shadow-lg">3</div>
              <div className="w-20 h-20 rounded-full bg-white mx-auto mb-3 flex items-center justify-center text-xl font-bold text-secondary border-4 border-[#CD853F] shadow-md">
                {topThree[2]?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <h3 className="font-semibold text-lg mb-1">{topThree[2]?.full_name || 'User'}</h3>
              <p className="text-sm text-gray-600 mb-2">Level {topThree[2]?.level || 1} • {getLevelText(topThree[2]?.level || 1)}</p>
              <p className="text-lg font-bold text-gray-800 mb-2">{topThree[2]?.total_exp || 0} XP</p>
              <div className="flex justify-center gap-2">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {topThree[2]?.letters_mastered || 0} Huruf
                </span>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Data leaderboard tidak tersedia</p>
          </div>
        )}

        {/* Daftar Lainnya */}
        {others.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peringkat</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pengguna</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">XP</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Huruf</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {others.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.rank}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold mr-3">
                          {student.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {student.full_name || 'User'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Level {student.level || 1} • {getLevelText(student.level || 1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.total_exp || 0} XP
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {student.letters_mastered || 0} Huruf
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Your ranking section */}
        {currentUser && (
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500 mb-2">Peringkat Anda</p>
            <div className="bg-blue-50 rounded-lg p-3 inline-block">
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-700">{currentUser.rank}</span>
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white font-bold">
                  {currentUser.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="font-medium">{currentUser.name}</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-700">{currentUser.exp} XP</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {currentUser.letters} Huruf
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LeaderboardManagement;
