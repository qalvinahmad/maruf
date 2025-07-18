import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Avatar from '../widget/avatar';

const AvatarSection = ({ profileData }) => {
  const router = useRouter();

  return (
    <motion.section 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center justify-center py-8"
    >
      <div 
        className="relative group cursor-pointer"
        onClick={() => {
          localStorage.setItem('settingsTab', 'inventory');
          router.push('/dashboard/setting/DashboardSettings');
        }}
      >
        {/* Enhanced glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/30 via-purple-400/30 to-blue-400/30 rounded-full blur-2xl group-hover:blur-3xl opacity-60 group-hover:opacity-80 transition-all duration-700"></div>
        
        {/* Avatar container with better scaling */}
        <div className="relative transform scale-150 group-hover:scale-[1.65] transition-all duration-500 ease-out">
          <Avatar 
            imageUrl="/img/avatar_default.png"
            alt="Karakter Pembelajaran"
            size="lg"
            borderColor="indigo"
            badge="award"
          />
        </div>
        
        {/* Enhanced tooltip */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <div className="bg-gray-900 text-white text-sm px-4 py-2 rounded-xl whitespace-nowrap shadow-lg">
            <span className="font-medium">Kustomisasi Avatar</span>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default AvatarSection;
