const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'events', label: 'Event Tahunan' },
    { id: 'announcements', label: 'Pengumuman' },
    { id: 'challenges', label: 'Tantangan Harian' }
  ];

  return (
    <div className="mb-6 border-b">
      <div className="flex space-x-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`py-4 px-6 focus:outline-none transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;
