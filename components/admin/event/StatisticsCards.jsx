import { IconActivity, IconBell, IconCalendarEvent, IconUsers } from '@tabler/icons-react';
import { motion } from 'framer-motion';

const StatisticsCards = ({ statistics }) => {
  const cards = [
    {
      icon: <IconCalendarEvent size={20} />,
      title: 'Total Events',
      value: statistics.totalEvents,
      description: 'Event aktif',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      delay: 0.1
    },
    {
      icon: <IconBell size={20} />,
      title: 'Pengumuman',
      value: statistics.totalAnnouncements,
      description: 'Pengumuman aktif',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      delay: 0.2
    },
    {
      icon: <IconActivity size={20} />,
      title: 'Tantangan',
      value: statistics.totalChallenges,
      description: 'Tantangan harian',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      delay: 0.3
    },
    {
      icon: <IconUsers size={20} />,
      title: 'Registrasi',
      value: statistics.totalRegistrations,
      description: 'Peserta terdaftar',
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      delay: 0.4
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => (
        <motion.div 
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: card.delay }}
          className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-full ${card.bgColor} flex items-center justify-center ${card.iconColor}`}>
              {card.icon}
            </div>
            <h3 className="font-semibold text-gray-800">{card.title}</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
          <p className="text-sm text-gray-600">{card.description}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default StatisticsCards;
