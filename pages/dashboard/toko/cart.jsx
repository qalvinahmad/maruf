import { IconArrowRight, IconBorderAll, IconPalette, IconShoppingCart, IconUser } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatNumber } from '../../../utils/formatNumber';

const CartModal = ({ 
  showCartModal, 
  setShowCartModal, 
  cart, 
  removeFromCart, 
  calculateTotal, 
  checkout, 
  userProfile 
}) => {
  return (
    <AnimatePresence>
      {showCartModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowCartModal(false)}
          className="bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-xl cursor-default relative overflow-hidden"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Keranjang Belanja</h3>
            
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconShoppingCart size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-500">Keranjang belanja Anda kosong</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                          {item.type === 'item' && <IconShoppingCart size={18} />}
                          {item.type === 'border' && <IconBorderAll size={18} />}
                          {item.type === 'avatar' && <IconUser size={18} />}
                          {item.type === 'theme' && <IconPalette size={18} />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500">{formatNumber(item.price)} Point</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold text-lg">{formatNumber(calculateTotal())} Point</span>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowCartModal(false)}
                      className="bg-gray-100 hover:bg-gray-200 transition-colors text-gray-800 font-semibold w-full py-3 px-4 rounded-xl"
                    >
                      Batal
                    </button>
                    <button
                      onClick={checkout}
                      className="bg-secondary hover:bg-blue-700 transition-colors text-white font-semibold w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2"
                      disabled={userProfile.points < calculateTotal()}
                    >
                      <span>Checkout</span>
                      <IconArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartModal;
