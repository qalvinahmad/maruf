import { IconAward, IconBattery1, IconBell, IconCalendar, IconLogout, IconTrophy } from '@tabler/icons-react';

const LearningHeader = ({ userName, profileData, handleLogout }) => {
  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold transition-transform hover:scale-110">
                {userName.charAt(0).toUpperCase()}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-lg">{profileData.full_name}</h2>
                <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                  {profileData.level_description}
                </span>
              </div>
              <div className="flex flex-wrap items-center text-xs gap-3">
                <span className="flex items-center gap-1 bg-indigo-800/50 px-2 py-1 rounded-full">
                  <span>Level {profileData.level}</span>
                </span>
                <span className="flex items-center gap-1 text-purple-200">
                  <IconCalendar size={12} />
                  <span>{profileData.streak} Hari Streak</span>
                </span>
                <span className="flex items-center gap-1 text-yellow-300">
                  <IconTrophy size={12} />
                  <span>{profileData.xp} XP</span>
                </span>
                <span className="flex items-center gap-1 text-green-300">
                  <IconAward size={12} />
                  <span>{profileData.points} Point</span>
                </span>
                <span className="flex items-center gap-1 text-cyan-300">
                  <IconBattery1 size={12} />
                  <span>{profileData.energy} Energi</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300">
              <IconBell size={20} className="text-white" />
              <span className="absolute top-1 right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></span>
              <span className="absolute top-1 right-1 w-3 h-3 bg-red-400 rounded-full"></span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-white hover:text-gray-200 transition-colors duration-300"
            >
              <IconLogout size={16} />
              <span className="hidden md:inline">Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LearningHeader;