import { IconArrowLeft, IconClock, IconCoin, IconDeviceGamepad, IconStar, IconTrophy, IconUsers } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';

const MiniGames = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Complete mini games data
  const miniGames = [
    {
      id: 1,
      title: 'Wag Tag - Game Ular',
      description: 'Kendalikan ular lucu dengan karakter emoji yang menggemaskan',
      category: 'arcade',
      difficulty: 'easy',
      duration: '10 menit',
      points: 150,
      players: 1,
      image: '🐍',
      color: 'from-amber-500 to-orange-600',
      isNew: true
    },
    {
      id: 2,
      title: 'Monkey Swing',
      description: 'Bantu monyet berayun melewati sungai dengan capit mekanik',
      category: 'arcade',
      difficulty: 'medium',
      duration: '8 menit',
      points: 120,
      players: 1,
      image: '🐒',
      color: 'from-green-500 to-emerald-600',
      isNew: true
    }
  ];
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data untuk mini games - hanya Wag Tag game
  const miniGames = [
    {
      id: 1,
      title: 'Wag Tag - Game Ular',
      description: 'Kendalikan ular lucu dengan karakter emoji yang menggemaskan',
      category: 'arcade',
      difficulty: 'easy',
      duration: '10 menit',
      points: 150,
      players: 1,
      image: '�',
      color: 'from-amber-500 to-orange-600',
      isNew: true
    }
  ];

  const categories = [
    { id: 'all', name: 'Semua', icon: '🎮' },
    { id: 'arcade', name: 'Arcade', icon: '🐍' }
  ];

  const getDifficultyStyle = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Mudah';
      case 'medium': return 'Sedang';
      case 'hard': return 'Sulit';
      default: return 'Normal';
    }
  };

  const filteredGames = selectedCategory === 'all' 
    ? miniGames 
    : miniGames.filter(game => game.category === selectedCategory);

  const handlePlayGame = (gameId) => {
    router.push(`/dashboard/mini-games/play/${gameId}`);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <Head>
        <title>Mini Games - Ma'ruf</title>
        <meta name="description" content="Koleksi mini games edukatif untuk pembelajaran Al-Qur'an" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.back()}
                className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <IconArrowLeft size={20} className="text-slate-600" />
              </motion.button>
              
              <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <IconDeviceGamepad className="text-blue-600" />
                  Mini Games
                </h1>
                <p className="text-slate-600 text-sm">Belajar sambil bermain dengan game edukatif</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-slate-600">Total Games</div>
                <div className="text-lg font-bold text-slate-800">{miniGames.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Kategori Games</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Games Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredGames.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden group"
            >
              {/* Game Header */}
              <div className={`bg-gradient-to-r ${game.color} p-6 relative overflow-hidden`}>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{game.image}</div>
                    {game.isNew && (
                      <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                        NEW
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{game.title}</h3>
                  <p className="text-white/90 text-sm">{game.description}</p>
                </div>
                
                {/* Background decoration */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/10 rounded-full"></div>
              </div>

              {/* Game Info */}
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyStyle(game.difficulty)}`}>
                    {getDifficultyText(game.difficulty)}
                  </span>
                  
                  <div className="flex items-center gap-1 text-slate-600 text-sm">
                    <IconClock size={16} />
                    <span>{game.duration}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-yellow-600">
                      <IconCoin size={16} />
                      <span className="font-semibold">{game.points}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-slate-600">
                      <IconUsers size={16} />
                      <span className="text-sm">{game.players} Pemain</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-orange-500">
                    <IconStar size={16} />
                    <span className="text-sm font-medium">4.8</span>
                  </div>
                </div>

                {/* Play Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePlayGame(game.id)}
                  className={`w-full bg-gradient-to-r ${game.color} text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-xl`}
                >
                  <IconDeviceGamepad size={20} />
                  <span>Mainkan Sekarang</span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredGames.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Belum Ada Game</h3>
            <p className="text-slate-600">Game untuk kategori ini sedang dalam pengembangan</p>
          </motion.div>
        )}

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
        >
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <IconTrophy className="text-yellow-500" />
            Statistik Games
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{miniGames.length}</div>
              <div className="text-sm text-slate-600">Total Games</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{miniGames.length}</div>
              <div className="text-sm text-slate-600">Games Baru</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">270</div>
              <div className="text-sm text-slate-600">Total Poin</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">18</div>
              <div className="text-sm text-slate-600">Menit Bermain</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MiniGames;
