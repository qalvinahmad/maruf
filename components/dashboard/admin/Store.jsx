import { IconAward, IconBorderAll, IconCoin, IconEdit, IconPhoto, IconPlus, IconTrash, IconUser } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useCallback, useEffect, useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { getCachedData, setCachedData } from '../../../lib/clientSafeCache';
import { supabase } from '../../../lib/supabaseClient';
import NumberTicker from '../../ui/number-ticker';
import AdminDropdown from '../../widget/AdminDropdown';

// Shop Item Component
const ShopItem = memo(({ item, onEdit, onDelete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 rounded-xl shadow hover:shadow-md transition-all border border-gray-100"
    >
      <div className="relative w-full pb-[100%] mb-4 bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={item.thumbnail || '/img/avatar_default.png'}
          alt={item.name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/img/avatar_default.png';
          }}
          loading="lazy"
        />
        {item.type === 'avatar' && (
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 rounded-lg">
            <IconUser size={16} className="text-white" />
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800">{item.name}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${
          item.type === 'avatar' ? 'bg-blue-100 text-blue-800' :
          item.type === 'badge' ? 'bg-purple-100 text-purple-800' :
          item.type === 'theme' ? 'bg-green-100 text-green-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {item.type}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {item.description}
      </p>

      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-blue-600 flex items-center gap-1">
          <IconCoin size={16} />
          {item.price} poin
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
          >
            <IconEdit size={16} />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 rounded bg-red-100 text-red-600 hover:bg-red-200"
          >
            <IconTrash size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
});

ShopItem.displayName = 'ShopItem';

const Store = () => {
  const [shopItems, setShopItems] = useState([]);
  const [shopStats, setShopStats] = useState({
    avatars: 0,
    borders: 0, 
    badges: 0
  });
  const [shopItemFilter, setShopItemFilter] = useState('all');
  const [shopSearchTerm, setShopSearchTerm] = useState('');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Get store functions
  const { getCachedItems, setCachedItems } = useStore();

  // Calculate shop stats
  const calculateShopStats = (items) => {
    return items.reduce((acc, item) => ({
      avatars: acc.avatars + (item.type === 'avatar' ? 1 : 0),
      borders: acc.borders + (item.type === 'border' ? 1 : 0),
      badges: acc.badges + (item.type === 'badge' ? 1 : 0),
    }), { avatars: 0, borders: 0, badges: 0 });
  };

  // Enhanced shop items fetch function with Redis caching
  const fetchShopItems = useCallback(async () => {
    try {
      const cacheKey = 'shop_items_stats';
      
      // Try to get cached data from Redis first
      let cachedData = await getCachedData(cacheKey);
      
      if (cachedData && cachedData.items && cachedData.stats) {
        setShopItems(cachedData.items);
        setShopStats(cachedData.stats);
        return;
      }
      
      // If no cache, fetch from local cache
      let items = getCachedItems('shopItems');
      
      if (!items) {
        // Fetch from database
        const { data, error } = await supabase
          .from('shop_items')
          .select('*')
          .order('id');

        if (error) throw error;
        
        items = data || [];
        setCachedItems('shopItems', items);
      }
      
      // Calculate stats
      const stats = calculateShopStats(items);
      
      // Cache in Redis for 5 minutes
      await setCachedData(cacheKey, { items, stats }, 300);
      
      setShopItems(items);
      setShopStats(stats);
    } catch (error) {
      console.error('Error fetching shop items:', error);
      setShopItems([]);
      setShopStats({ avatars: 0, borders: 0, badges: 0 });
    }
  }, [getCachedItems, setCachedItems]);

  useEffect(() => {
    fetchShopItems();
  }, [fetchShopItems]);

  // Enhanced function to handle item deletion with cache invalidation
  const handleDeleteItem = async (itemId) => {
    if (confirm('Apakah Anda yakin ingin menghapus item ini?')) {
      try {
        await supabase
          .from('shop_items')
          .delete()
          .eq('id', itemId);

        // Invalidate Redis cache
        const cacheKey = 'shop_items_stats';
        await setCachedData(cacheKey, null, 0); // Delete cache
        
        // Clear local cache too
        setCachedItems('shopItems', null);
        
        // Refresh shop items
        await fetchShopItems();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  // Filter function for shop items
  const getFilteredShopItems = () => {
    return shopItems.filter(item => {
      const matchesFilter = shopItemFilter === 'all' || item.type === shopItemFilter;
      const matchesSearch = 
        item.name.toLowerCase().includes(shopSearchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(shopSearchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  };

  // Image handling functions
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 2MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result || '');
    };
    reader.readAsDataURL(file);
  };

  // Submit handler
  const handleSubmitItem = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      let thumbnailUrl = editingItem?.thumbnail;

      // Upload new thumbnail if provided
      if (imagePreview && !imagePreview.startsWith('http')) {
        setUploadProgress(0);
        const file = e.target.querySelector('input[type="file"]').files[0];
        
        // Create unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `shop-thumbnails/${fileName}`;

        // Upload to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, file, {
            onUploadProgress: (progress) => {
              setUploadProgress((progress.loaded / progress.total) * 100);
            }
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        thumbnailUrl = publicUrl;
      }

      const itemData = {
        name: formData.get('name'),
        type: formData.get('type'),
        description: formData.get('description'),
        price: parseInt(formData.get('price')),
        thumbnail: thumbnailUrl || '/img/avatar_default.png'
      };

      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from('shop_items')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        // Add new item
        const { error } = await supabase
          .from('shop_items')
          .insert([itemData]);

        if (error) throw error;
      }

      // Reset form and refresh with cache invalidation
      setShowAddItemModal(false);
      setEditingItem(null);
      setImagePreview('');
      setSelectedItemType('');
      
      // Invalidate Redis cache
      const cacheKey = 'shop_items_stats';
      await setCachedData(cacheKey, null, 0); // Delete cache
      
      // Clear local cache too
      setCachedItems('shopItems', null);
      
      await fetchShopItems(); // Wait for refresh
    
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Gagal menyimpan item');
    } finally {
      setUploadProgress(0);
    }
  };

  // UseEffect to set form data when editing
  useEffect(() => {
    if (editingItem?.thumbnail) {
      setImagePreview(editingItem.thumbnail);
    }
    if (editingItem?.type) {
      setSelectedItemType(editingItem.type);
    } else {
      setSelectedItemType('');
    }
  }, [editingItem]);

  // UseEffect to reset form when dialog closes
  useEffect(() => {
    if (!showAddItemModal) {
      setImagePreview('');
      setEditingItem(null);
      setSelectedItemType('');
    }
  }, [showAddItemModal]);

  // Shop Item Dialog Component
  const ShopItemDialog = () => (
    <AnimatePresence>
      {(showAddItemModal || editingItem) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-lg"
          >
            <h3 className="text-xl font-semibold mb-4">
              {editingItem ? 'Edit Item' : 'Tambah Item'}
            </h3>
            
            <form onSubmit={handleSubmitItem} className="space-y-4">
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium mb-1">Gambar</label>
                <div className="flex items-start gap-4">
                  <motion.div 
                    className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                  >
                    {(imagePreview || editingItem?.image) ? (
                      <img
                        src={imagePreview || editingItem?.image}
                        alt="Preview"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <IconPhoto size={32} />
                      </div>
                    )}
                    
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                      </div>
                    )}
                  </motion.div>

                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="item-image"
                    />
                    <label
                      htmlFor="item-image"
                      className="block w-full px-4 py-2 bg-gray-50 text-gray-700 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors text-center"
                    >
                      Pilih Gambar
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Format: JPG, PNG. Maks: 2MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Item Details */}
              <div>
                <label className="block text-sm font-medium mb-1">Nama Item</label>
                <input
                  type="text"
                  required
                  name="name"
                  defaultValue={editingItem?.name}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tipe Item</label>
                <AdminDropdown
                  variant="select"
                  placeholder="Pilih Tipe Item"
                  value={selectedItemType}
                  onChange={(value) => setSelectedItemType(value)}
                  options={[
                    { value: 'avatar', label: 'Avatar', icon: <IconUser size={16} /> },
                    { value: 'border', label: 'Border', icon: <IconBorderAll size={16} /> },
                    { value: 'badge', label: 'Badge', icon: <IconAward size={16} /> }
                  ]}
                />
                <input
                  type="hidden"
                  name="type"
                  value={selectedItemType}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea
                  required
                  name="description"
                  defaultValue={editingItem?.description}
                  rows="3"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Harga (Poin)</label>
                <input
                  type="number"
                  required
                  name="price"
                  min="0"
                  defaultValue={editingItem?.price}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddItemModal(false);
                    setEditingItem(null);
                    setImagePreview('');
                    setSelectedItemType('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingItem ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Stats Cards with NumberTicker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-200 rounded-lg">
              <IconUser className="w-6 h-6 text-purple-700" />
            </div>
            <div>
              <p className="text-sm text-purple-700">Total Avatar</p>
              <h3 className="text-2xl font-bold text-purple-900">
                <NumberTicker value={shopStats.avatars} />
              </h3>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-200 rounded-lg">
              <IconBorderAll className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <p className="text-sm text-blue-700">Total Border</p>
              <h3 className="text-2xl font-bold text-blue-900">
                <NumberTicker value={shopStats.borders} />
              </h3>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-200 rounded-lg">
              <IconAward className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <p className="text-sm text-amber-700">Total Badge</p>
              <h3 className="text-2xl font-bold text-amber-900">
                <NumberTicker value={shopStats.badges} />
              </h3>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filter & Search Bar */}
      <div className="mb-6 p-4 bg-white rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <AdminDropdown
              variant="select"
              placeholder="Filter Item"
              value={shopItemFilter}
              onChange={(value) => setShopItemFilter(value)}
              options={[
                { value: 'all', label: 'Semua Item', icon: <IconBorderAll size={16} /> },
                { value: 'avatar', label: 'Avatar', icon: <IconUser size={16} /> },
                { value: 'border', label: 'Border', icon: <IconBorderAll size={16} /> },
                { value: 'badge', label: 'Badge', icon: <IconAward size={16} /> }
              ]}
              className="w-40"
            />
            
            <div className="flex-1 md:w-64">
              <input
                type="text"
                placeholder="Cari item..."
                value={shopSearchTerm}
                onChange={(e) => setShopSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <button
            onClick={() => setShowAddItemModal(true)}
            className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto"
          >
            <IconPlus size={18} className="inline mr-2" />
            Tambah Item
          </button>
        </div>
      </div>

      {/* Shop Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {getFilteredShopItems().map(item => (
          <ShopItem
            key={item.id}
            item={item}
            onEdit={() => {
              setEditingItem(item);
              setShowAddItemModal(true);
            }}
            onDelete={handleDeleteItem}
          />
        ))}
      </div>

      {/* Shop Item Dialog */}
      <ShopItemDialog />
    </motion.div>
  );
};

export default Store;
