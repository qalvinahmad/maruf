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
    const { userId, itemId, itemType, userEmail } = req.body;

    console.log('API Request body:', { userId, itemId, itemType, userEmail });

    if (!userId || !itemId || !itemType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // First try to verify user exists in auth.users table
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (authError) {
      console.log('Auth user not found, checking profiles table directly...');
      
      // Fallback: Check profiles table directly
      const { data: profileUser, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .eq('id', userId)
        .single();

      if (profileError || !profileUser) {
        console.error('User not found in profiles:', profileError);
        return res.status(404).json({ error: 'User not found in database' });
      }
      
      console.log('Found user in profiles:', profileUser);
    } else {
      console.log('Found auth user:', authUser.user?.id);
    }

    // Check if item exists in shop_items
    const { data: shopItem, error: shopError } = await supabaseAdmin
      .from('shop_items')
      .select('id, name, type')
      .eq('id', itemId)
      .single();

    if (shopError || !shopItem) {
      console.error('Shop item not found:', shopError);
      return res.status(404).json({ error: 'Shop item not found' });
    }

    console.log('Found shop item:', shopItem);

    // Check if item already exists in inventory
    const { data: existingItem, error: checkError } = await supabaseAdmin
      .from('user_inventory')
      .select('id')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .single();

    if (existingItem) {
      console.log('Item already owned');
      // Return a more clear status code and message
      return res.status(409).json({ 
        error: 'Item already owned',
        existingItem: existingItem 
      });
    }

    // Insert into inventory using service role (bypasses RLS)
    const inventoryData = {
      user_id: userId,
      item_id: itemId,
      item_type: itemType,
      quantity: 1,
      is_equipped: false,
      purchased_at: new Date().toISOString()
    };

    console.log('Inserting inventory item:', inventoryData);

    const { data: insertResult, error: insertError } = await supabaseAdmin
      .from('user_inventory')
      .insert([inventoryData])
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
      return res.status(500).json({ error: `Failed to add item to inventory: ${insertError.message}` });
    }

    console.log('Successfully inserted:', insertResult);

    return res.status(200).json({ 
      success: true, 
      message: 'Item purchased successfully',
      data: insertResult 
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
}
