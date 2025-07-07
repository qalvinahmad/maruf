import { IconArrowRight, IconCoin } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatNumber } from '../../utils/formatNumber';

const PurchaseDialog = ({ 
  showPurchaseDialog, 
  setShowPurchaseDialog, 
  selectedItem, 
  userProfile, 
  confirmPurchase 
}) => {
  if (!selectedItem) return null;

  const canAfford = userProfile.points >= selectedItem.price;

  return (
    <AnimatePresence>
      {showPurchaseDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowPurchaseDialog(false)}
          className="bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl cursor-default"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Konfirmasi Pembelian</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Item:</p>
                <p className="font-semibold">{selectedItem.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Harga:</p>
                <p className="font-semibold flex items-center gap-1">
                  <IconCoin size={16} className="text-yellow-500" />
                  {formatNumber(selectedItem.price)} Point
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Point Anda Saat Ini:</p>
                <p className="font-semibold flex items-center gap-1">
                  <IconCoin size={16} className="text-green-500" />
                  {formatNumber(userProfile.points)} Point
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Sisa Point Setelah Pembelian:</p>
                <p className={`font-semibold flex items-center gap-1 ${
                  canAfford ? 'text-green-600' : 'text-red-600'
                }`}>
                  <IconCoin size={16} />
                  {formatNumber(userProfile.points - selectedItem.price)} Point
                </p>
              </div>

              {!canAfford && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">
                    Anda membutuhkan {formatNumber(selectedItem.price - userProfile.points)} point lagi untuk membeli item ini.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowPurchaseDialog(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmPurchase}
                disabled={!canAfford}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 flex items-center justify-center gap-2"
              >
                <span>{canAfford ? 'Beli' : 'Point Tidak Cukup'}</span>
                {canAfford && <IconArrowRight size={16} />}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PurchaseDialog;
