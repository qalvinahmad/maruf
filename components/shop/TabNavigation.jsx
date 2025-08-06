import { IconBorderAll, IconCoin, IconShoppingCart, IconUser } from '@tabler/icons-react';

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'badge', label: 'Badge', icon: IconShoppingCart },
    { id: 'borders', label: 'Border', icon: IconBorderAll },
    { id: 'avatars', label: 'Avatar', icon: IconUser },
    { id: 'powerup', label: 'Power Up & Item', icon: IconCoin }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-8 p-2 bg-white rounded-xl shadow-sm">
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all font-medium ${
              activeTab === tab.id
                ? 'bg-secondary text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
          >
            <IconComponent size={18} />
            <span className="text-sm">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default TabNavigation;
