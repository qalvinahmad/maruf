import { supabase } from './supabaseClient';

// Function to get today's flash sale
export const getTodayFlashSaleData = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data, error } = await supabase
      .from('daily_flash_sales')
      .select('*, shop_items(*)')
      .eq('date', today.toISOString().split('T')[0])
      .single();
      
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching flash sale:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getTodayFlashSaleData:', error);
    return null;
  }
};

// Function to create new flash sale
export const createFlashSale = async () => {
  try {
    // Get all available shop items
    const { data: shopItems, error: itemsError } = await supabase
      .from('shop_items')
      .select('*')
      .eq('is_active', true);
      
    if (itemsError || !shopItems || shopItems.length === 0) {
      console.error('No shop items available for flash sale');
      return null;
    }
    
    // Select random item
    const randomIndex = Math.floor(Math.random() * shopItems.length);
    const selectedItem = shopItems[randomIndex];
    
    // Generate random discount (30-80%)
    const discountPercent = Math.floor(Math.random() * 51) + 30;
    
    // Create flash sale record
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const flashSaleData = {
      date: today.toISOString().split('T')[0],
      item_id: selectedItem.id,
      discount_percent: discountPercent,
      is_active: true,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('daily_flash_sales')
      .insert([flashSaleData])
      .select('*, shop_items(*)')
      .single();
      
    if (error) {
      console.error('Error creating flash sale:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createFlashSale:', error);
    return null;
  }
};

// Main function to run daily flash sale update
export const runDailyFlashSaleUpdate = async () => {
  try {
    console.log('Running daily flash sale update...');
    
    // Check if today's flash sale already exists
    const existingFlashSale = await getTodayFlashSaleData();
    
    if (existingFlashSale) {
      console.log('Flash sale already exists for today');
      return existingFlashSale;
    }
    
    // Create new flash sale
    const newFlashSale = await createFlashSale();
    
    if (newFlashSale) {
      console.log('New flash sale created:', newFlashSale);
      return newFlashSale;
    } else {
      console.error('Failed to create flash sale');
      return null;
    }
  } catch (error) {
    console.error('Error in runDailyFlashSaleUpdate:', error);
    return null;
  }
};
