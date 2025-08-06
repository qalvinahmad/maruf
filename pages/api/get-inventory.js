import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create service role client (bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // Get inventory using service role (bypasses RLS)
    const { data: inventoryData, error: inventoryError } = await supabaseAdmin
      .from('user_inventory')
      .select('*')
      .eq('user_id', userId);

    if (inventoryError) {

      return res.status(500).json({ error: inventoryError.message });
    }


    if (!inventoryData || inventoryData.length === 0) {
      return res.status(200).json({ 
        success: true, 
        data: [],
        message: 'No inventory items found' 
      });
    }

    // Get all unique item IDs
    const itemIds = [...new Set(inventoryData.map(item => item.item_id))];

    // Fetch shop items
    const { data: shopItemsData, error: shopError } = await supabaseAdmin
      .from('shop_items')
      .select('*')
      .in('id', itemIds);

    if (shopError) {
      console.error('Error fetching shop items:', shopError);
      // Continue without shop items data
    }

    // Combine data
    const combinedData = inventoryData.map(invItem => {
      const shopItem = shopItemsData?.find(shop => shop.id === invItem.item_id);
      return {
        ...invItem,
        shop_items: shopItem || {
          id: invItem.item_id,
          name: `Item ${invItem.item_id}`,
          description: 'Item description not available',
          type: invItem.item_type,
          image: null
        }
      };
    });


    return res.status(200).json({ 
      success: true, 
      data: combinedData 
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
}
