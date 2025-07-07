import { createClient } from '@supabase/supabase-js';

// Use service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('API: Fetching flash sale directly from database...');
    
    // First, ensure we have a flash sale for today
    await ensureTodayFlashSale();
    
    // Then fetch the active flash sale
    const { data: flashSale, error } = await supabase
      .from('flash_sales')
      .select(`
        id,
        discount_percent,
        start_date,
        end_date,
        shop_items (
          id,
          name,
          description,
          price,
          type,
          image,
          thumbnail
        )
      `)
      .eq('is_active', true)
      .gte('end_date', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('API: Database error:', error);
      return res.status(500).json({ error: 'Database error', details: error.message });
    }

    if (!flashSale) {
      console.log('API: No active flash sale found');
      return res.status(404).json({ error: 'No active flash sale' });
    }

    console.log('API: Found flash sale:', {
      id: flashSale.id,
      discount: flashSale.discount_percent,
      item: flashSale.shop_items?.name
    });

    return res.status(200).json({
      success: true,
      data: flashSale
    });

  } catch (error) {
    console.error('API: Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}

// Function to ensure there's a flash sale for today
async function ensureTodayFlashSale() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Check if there's already a flash sale for today
    const { data: existingSale, error: checkError } = await supabase
      .from('flash_sales')
      .select('id')
      .gte('start_date', today.toISOString())
      .lt('start_date', tomorrow.toISOString())
      .eq('is_active', true)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing flash sale:', checkError);
      return;
    }
    
    if (existingSale) {
      console.log('Flash sale already exists for today');
      return;
    }
    
    // No flash sale for today, create one
    console.log('Creating new flash sale for today...');
    
    // Deactivate old flash sales
    await supabase
      .from('flash_sales')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .lt('end_date', today.toISOString());
    
    // Get random item
    const { data: items, error: itemsError } = await supabase
      .from('shop_items')
      .select('id, name, price')
      .order('id', { ascending: true });
    
    if (itemsError || !items || items.length === 0) {
      console.error('No items available for flash sale');
      return;
    }
    
    // Use date-based seeded random for consistency
    const dateString = today.toISOString().split('T')[0];
    const seed = dateString.split('-').reduce((acc, val) => acc + parseInt(val), 0);
    
    function seededRandom(seed) {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    }
    
    const randomIndex = Math.floor(seededRandom(seed) * items.length);
    const selectedItem = items[randomIndex];
    
    const discountSeed = seed + selectedItem.id;
    const discount = Math.floor(seededRandom(discountSeed) * 51) + 30; // 30-80%
    
    const endDate = new Date(tomorrow);
    endDate.setHours(23, 59, 59, 999);
    
    // Create new flash sale
    const { error: insertError } = await supabase
      .from('flash_sales')
      .insert({
        item_id: selectedItem.id,
        discount_percent: discount,
        start_date: today.toISOString(),
        end_date: endDate.toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (insertError) {
      console.error('Error creating flash sale:', insertError);
    } else {
      console.log('Flash sale created successfully:', {
        item: selectedItem.name,
        discount: discount,
        date: dateString
      });
    }
    
  } catch (error) {
    console.error('Error in ensureTodayFlashSale:', error);
  }
}
