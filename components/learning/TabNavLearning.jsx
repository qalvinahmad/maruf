import { IconHistory, IconUsers } from '@tabler/icons-react';

const TabNavLearning = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'roadmap', label: 'Roadmap Pembelajaran' },
    { id: 'kelas', label: 'Kelas Tersedia' },
    { 
      id: 'riwayat', 
      label: 'Riwayat Belajar',
      icon: <IconHistory size={16} />
    },
    { 
      id: 'leaderboard', 
      label: 'Papan Peringkat',
      icon: <IconUsers size={16} />
    },
    { 
      id: 'event', 
      label: 'Event'
    }
  ];

  return (
    <div className="flex overflow-x-auto pb-2 mb-6 gap-2 scrollbar-hide">
      {tabs.map(tab => (
        <button 
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === tab.id 
              ? 'bg-secondary text-white shadow-md' 
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {tab.icon && tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default TabNavLearning;