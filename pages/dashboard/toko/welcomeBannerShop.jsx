import { IconCoin } from '@tabler/icons-react';
import GradientText from '../../../src/blocks/TextAnimations/GradientText/GradientText';

import BlurText from '../../../components/ui/blur-text';
import { formatNumber } from '../../../utils/formatNumber';

const WelcomeBannerShop = ({ userProfile }) => (
  <div className="bg-white p-6 rounded-3xl shadow-lg shadow-gray-500/20 border mb-8 relative overflow-hidden">
    {/* Hilangkan background gradient, tambahkan elemen dekorasi optional */}
    <div className="absolute -top-12 -right-12 w-40 h-40 bg-black/5 rounded-full"></div>
    <div className="absolute bottom-0 right-0 w-64 h-64 bg-black/10 rounded-full transform translate-x-1/4 translate-y-1/4"></div>
    
    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        {/* Ganti teks utama dengan GradientText */}
<GradientText
  colors={["#9645ff", "#00acee", "#9645ff", "#00acee", "#9645ff"]}
  animationSpeed={3}
  showBorder={false}
  className="text-4xl font-extrabold custom-class"
>
  Toko & Item
</GradientText>

        {/* Tetap gunakan BlurText untuk deskripsi */}
        <BlurText 
          className="text-gray-700 max-w-md"
          text="Gunakan point Anda untuk membeli berbagai item, border, avatar, dan personalisasi untuk meningkatkan pengalaman belajar."
          delay={300}
          animateBy="words"
          direction="top"
        />
      </div>
      <div className="bg-white/60 backdrop-blur-sm px-4 py-3 rounded-xl flex items-center gap-3 shadow-md">
        <IconCoin size={24} className="text-yellow-400" />
        <div>
          <p className="text-sm text-gray-600">Saldo Point</p>
          <p className="text-xl font-bold text-gray-800">{formatNumber(userProfile?.points || 0)} Point</p>
        </div>
      </div>
    </div>
  </div>
);

export default WelcomeBannerShop;
