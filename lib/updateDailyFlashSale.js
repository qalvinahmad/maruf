import { supabase } from './supabaseClient';

// SIMPLIFIED - Just fetch from API endpoint
async function getTodayFlashSale() {
  try {
    console.log('Using API endpoint for flash sale...');
    
    const response = await fetch('/api/get-flash-sale', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.log('API returned non-OK status:', response.status);
      return null;
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      console.log('API returned flash sale:', result.data);
      return result.data;
    }

    return null;
    
  } catch (error) {
    console.error('Error fetching from API:', error);
    return null;
  }
}

// Keep other functions for backward compatibility
async function updateDailyFlashSale() {
  console.log('This function is now handled by API endpoint');
  return null;
}

async function runDailyFlashSaleUpdate() {
  console.log('This function is now handled by API endpoint');
  return null;
}

export { getTodayFlashSale, runDailyFlashSaleUpdate, updateDailyFlashSale };

export const getTodayFlashSaleData = async () => {
  try {
    console.log('=== getTodayFlashSaleData STARTING ===');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    console.log('Date range:', today.toISOString(), 'to', tomorrow.toISOString());
    
    // FORCE fresh query, no caching
    const { data: flashSale, error } = await supabase
      .from('flash_sales')
      .select('*, shop_items(*)')
      .gte('start_date', today.toISOString())
      .lt('start_date', tomorrow.toISOString())
      .eq('is_active', true)
      .maybeSingle();
    
    if (error) {
      console.error('Database error:', error);
      return null;
    }
    
    console.log('=== RAW DATABASE RESULT ===');
    console.log('Flash sale data:', JSON.stringify(flashSale, null, 2));
    
    if (flashSale) {
      console.log('Found flash sale ID:', flashSale.id);
      console.log('Item ID:', flashSale.item_id);
      console.log('RAW discount_percent from DB:', flashSale.discount_percent);
      console.log('Type of discount_percent:', typeof flashSale.discount_percent);
      console.log('Shop item name:', flashSale.shop_items?.name);
      console.log('Shop item price:', flashSale.shop_items?.price);
    } else {
      console.log('No flash sale found for today');
    }
    
    return flashSale;
    
  } catch (error) {
    console.error('Unexpected error in getTodayFlashSaleData:', error);
    return null;
  }
}

// Fungsi untuk menjalankan daily update (untuk cron job atau scheduler)
async function runDailyFlashSaleUpdate() {
  try {
    console.log('Running daily flash sale update...');
    
    // Cek apakah sudah ada flash sale hari ini
    const existingFlashSale = await getTodayFlashSale();
    
    if (existingFlashSale) {
      console.log('Flash sale already exists for today, skipping update');
      return existingFlashSale;
    }
    
    // Buat flash sale baru
    const newFlashSale = await updateDailyFlashSale();
    console.log('Daily flash sale update completed');
    
    return newFlashSale;
    
  } catch (error) {
    console.error('Error in daily flash sale update:', error);
    throw error;
  }
}

export { getTodayFlashSale, runDailyFlashSaleUpdate, updateDailyFlashSale };
