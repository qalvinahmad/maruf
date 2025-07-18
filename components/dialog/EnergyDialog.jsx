import { IconBattery1, IconCoin, IconFlame, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { formatNumber } from '../../utils/formatNumber';

const EnergyDialog = ({ 
  isOpen, 
  setIsOpen, 
  userProfile, 
  onProfileUpdate 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Energy packages
  const energyPackages = [
    { id: 1, energy: 5, cost: 100, popular: false },
    { id: 2, energy: 15, cost: 250, popular: true },
    { id: 3, energy: 30, cost: 450, popular: false },
    { id: 4, energy: 50, cost: 700, popular: false }
  ];

  // FIXED: Enhanced energy purchase function with proper database update
  const handleEnergyPurchase = async (energyPackage) => {
    if (!user?.id) {
      alert('User tidak terautentikasi. Silakan login ulang.');
      return;
    }

    if (userProfile.points < energyPackage.cost) {
      alert('Point tidak mencukupi untuk membeli paket energi ini.');
      return;
    }

    try {
      setLoading(true);
      console.log('=== ENERGY PURCHASE START ===');
      console.log('User ID:', user.id);
      console.log('Current energy:', userProfile.energy);
      console.log('Current points:', userProfile.points);
      console.log('Package:', energyPackage);

      // Calculate new values
      const newEnergy = (userProfile.energy || 0) + energyPackage.energy;
      const newPoints = userProfile.points - energyPackage.cost;

      console.log('New energy:', newEnergy);
      console.log('New points:', newPoints);

      // FIXED: Update database with explicit column updates
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update({ 
          energy: newEnergy,
          points: newPoints,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select('*') // Get the updated data back
        .single();

      if (error) {
        console.error('Database update error:', error);
        throw new Error(`Database update failed: ${error.message}`);
      }

      console.log('Database updated successfully:', updatedProfile);

      // FIXED: Update local state immediately with fresh database data
      if (updatedProfile && onProfileUpdate) {
        console.log('Updating local profile state...');
        onProfileUpdate(updatedProfile);
      }

      // FIXED: Also call the API endpoint for additional processing
      try {
        const response = await fetch('/api/update-energy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            energyToAdd: energyPackage.energy,
            pointsToDeduct: energyPackage.cost
          }),
        });

        const result = await response.json();
        console.log('API response:', result);

        if (result.success && result.updatedProfile) {
          // Use API result as the final source of truth
          console.log('Using API result for final update:', result.updatedProfile);
          if (onProfileUpdate) {
            onProfileUpdate(result.updatedProfile);
          }
        }
      } catch (apiError) {
        console.error('API call failed but database was updated:', apiError);
        // Continue with database result since that's the primary update
      }

      // FIXED: Trigger events for other components to refresh
      localStorage.setItem('energyUpdated', Date.now().toString());
      localStorage.setItem('pointsUpdated', newPoints.toString());
      
      window.dispatchEvent(new CustomEvent('energyUpdated', { 
        detail: { 
          userId: user.id, 
          newEnergy, 
          newPoints,
          timestamp: Date.now() 
        } 
      }));

      window.dispatchEvent(new CustomEvent('pointsUpdated', { 
        detail: { 
          userId: user.id, 
          newPoints,
          timestamp: Date.now() 
        } 
      }));

      alert(`Berhasil membeli ${energyPackage.energy} energi!`);
      setIsOpen(false);

    } catch (error) {
      console.error('Error purchasing energy:', error);
      alert(`Terjadi kesalahan: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl cursor-default relative overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <IconBattery1 size={24} className="text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Beli Energi</h3>
                  <p className="text-sm text-gray-600">Energi saat ini: {userProfile?.energy || 0}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IconX size={20} />
              </button>
            </div>

            {/* Current Status */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl mb-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <IconCoin size={20} className="text-yellow-500" />
                  <span className="font-medium">Point Anda:</span>
                </div>
                <span className="font-bold text-lg">{formatNumber(userProfile?.points || 0)}</span>
              </div>
            </div>

            {/* Energy Packages */}
            <div className="space-y-3 mb-6">
              {energyPackages.map((pkg) => (
                <motion.div
                  key={pkg.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPackage?.id === pkg.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${pkg.popular ? 'ring-2 ring-purple-200 bg-purple-50' : ''}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <IconFlame size={20} className="text-orange-500" />
                      <div>
                        <p className="font-semibold">+{pkg.energy} Energi</p>
                        {pkg.popular && (
                          <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                            Populer
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatNumber(pkg.cost)}</p>
                      <p className="text-xs text-gray-500">Point</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-3 border rounded-xl hover:bg-gray-50 transition-colors font-medium"
                disabled={loading}
              >
                Batal
              </button>
              <button
                onClick={() => selectedPackage && handleEnergyPurchase(selectedPackage)}
                disabled={!selectedPackage || loading || (userProfile?.points || 0) < (selectedPackage?.cost || 0)}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Memproses...' : 'Beli Sekarang'}
              </button>
            </div>

            {/* Insufficient funds warning */}
            {selectedPackage && (userProfile?.points || 0) < selectedPackage.cost && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 text-center">
                  Point tidak mencukupi. Anda membutuhkan {formatNumber(selectedPackage.cost - (userProfile?.points || 0))} point lagi.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EnergyDialog;
