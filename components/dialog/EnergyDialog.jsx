import { IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from '../../context/AuthContext';
import BlurText from '../ui/blur-text'; // sesuaikan path sesuai struktur foldermu

const EnergyDialog = ({ isOpen, setIsOpen, currentEnergy, addedEnergy = 2, onClaim }) => {
  const [currentCount, setCurrentCount] = useState(currentEnergy);
  const [particles, setParticles] = useState([]);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const { user } = useAuth(); // Get user from context

  // Fungsi untuk memanggil API Supabase
  const updateEnergyInSupabase = async () => {
    try {
      setClaiming(true);

      // Get userId from AuthContext first, fallback to localStorage
      const userId = user?.id || localStorage.getItem('userId');
      if (!userId) {
        alert('User ID tidak ditemukan. Silakan login ulang.');
        setClaiming(false);
        return;
      }

      const response = await fetch("/api/update-energy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          addedEnergy,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal memperbarui energi di Supabase");
      }

      // Update local storage to prevent claiming again today
      localStorage.setItem(`lastEnergy_${userId}`, new Date().toDateString());

      // Set claimed state for animation
      setClaimed(true);

      // Trigger parent update if provided
      if (onClaim) {
        onClaim(result.data.energy);
      }

      // Close dialog after delay
      setTimeout(() => {
        setIsOpen(false);
        setClaimed(false);
      }, 2000);
    } catch (error) {
      console.error("Error claiming energy:", error);
      alert(error.message || "Gagal mengklaim energi. Silakan coba lagi.");
    } finally {
      setClaiming(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Generate particles for animation
      const newParticles = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random(),
        color: ['#4ADE80', '#34D399', '#10B981'][Math.floor(Math.random() * 3)]
      }));
      setParticles(newParticles);

      // Animate energy count
      setCurrentCount(currentEnergy);
      const timer = setTimeout(() => {
        setCurrentCount(currentEnergy + addedEnergy);
        // Panggil API untuk memperbarui energi di Supabase
        updateEnergyInSupabase();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, currentEnergy, addedEnergy]);

  const dropIn = {
    hidden: {
      y: "-100vh",
      opacity: 0,
      scale: 0.5,
    },
    visible: {
      y: "0",
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300,
      },
    },
    exit: {
      y: "100vh",
      opacity: 0,
      scale: 0.5,
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !claiming && setIsOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          {/* Energy particles animation */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: particle.color,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                y: [0, -30],
              }}
              transition={{
                duration: 2,
                delay: particle.delay,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ))}

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-md shadow-xl relative overflow-hidden"
          >
            {/* Close button */}
            {!claiming && !claimed && (
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 z-10"
              >
                <IconX size={20} />
              </button>
            )}

            {/* Content */}
            <div className="p-6 text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center"
              >
                <span className="text-3xl">⚡</span>
              </motion.div>

              {/* Judul dengan efek BlurText */}
              <BlurText
                className="text-xl font-bold mb-2"
                text={claimed ? "Energi Diklaim!" : "Energi Harian"}
                delay={150}
                animateBy="words"
                direction="top"
              />

              {/* Paragraf dengan efek BlurText */}
              <BlurText
                className="text-gray-600 mb-6"
                text={
                  claimed
                    ? "Energi telah ditambahkan ke akun Anda"
                    : `Klaim ${addedEnergy} energi untuk hari ini!`
                }
                delay={300}
                animateBy="words"
                direction="top"
              />

              {/* Energy counter */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-blue-50 rounded-xl p-4 mb-6"
              >
                <div className="flex justify-center items-center gap-2">
                  <span className="text-lg">⚡</span>
                  <span className="text-xl font-bold text-blue-600">
                    {currentEnergy} + {addedEnergy}
                  </span>
                </div>
              </motion.div>

              {/* Action button */}
              {!claimed && (
                <button
                  onClick={updateEnergyInSupabase}
                  disabled={claiming}
                  className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                    claiming
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {claiming ? "Mengklaim..." : "Klaim Sekarang"}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EnergyDialog;
