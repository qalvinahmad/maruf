import { IconPackage } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';

const FloatingInventoryButton = () => {
  const router = useRouter();
  
  return (
    <motion.button
      onClick={() => {
        localStorage.setItem('settingsTab', 'inventory');
        router.push('/dashboard/setting/DashboardSettings');
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed right-8 bottom-24 z-40 bg-secondary hover:bg-blue-700 text-white p-4 rounded-full shadow-lg flex items-center gap-2"
    >
      <IconPackage size={20} />
      <span className="font-medium">Inventori</span>
    </motion.button>
  );
};

export default FloatingInventoryButton;
