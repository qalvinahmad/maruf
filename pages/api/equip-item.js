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
    const { userId, inventoryId, itemType } = req.body;

    console.log('Equipping item:', { userId, inventoryId, itemType });

    if (!userId || !inventoryId || !itemType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // First, unequip all items of the same type using service role
    const { error: unequipError } = await supabaseAdmin
      .from('user_inventory')
      .update({ 
        is_equipped: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('item_type', itemType);

    if (unequipError) {
      console.error('Error unequipping items:', unequipError);
      return res.status(500).json({ error: unequipError.message });
    }

    console.log('Successfully unequipped all items of type:', itemType);

    // Then equip the selected item
    const { data: equipData, error: equipError } = await supabaseAdmin
      .from('user_inventory')
      .update({ 
        is_equipped: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', inventoryId)
      .eq('user_id', userId) // Additional security check
      .select();

    if (equipError) {
      console.error('Error equipping item:', equipError);
      return res.status(500).json({ error: equipError.message });
    }

    if (!equipData || equipData.length === 0) {
      return res.status(404).json({ error: 'Item not found or not owned by user' });
    }

    console.log('Successfully equipped item:', equipData[0]);

    // If it's an avatar, also update the avatars table
    if (itemType === 'avatar') {
      try {
        // Get the item details first
        const { data: itemData } = await supabaseAdmin
          .from('shop_items')
          .select('*')
          .eq('id', equipData[0].item_id)
          .single();

        if (itemData) {
          // Check if user already has an avatar record
          const { data: existingAvatar } = await supabaseAdmin
            .from('avatars')
            .select('id')
            .eq('user_id', userId)
            .single();

          if (existingAvatar) {
            // Update existing avatar
            await supabaseAdmin
              .from('avatars')
              .update({
                avatar: itemData.image || itemData.name,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', userId);
          } else {
            // Create new avatar record
            await supabaseAdmin
              .from('avatars')
              .insert({
                user_id: userId,
                avatar: itemData.image || itemData.name,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
          }
        }
      } catch (avatarError) {
        console.error('Error updating avatars table:', avatarError);
        // Don't fail the whole operation if avatar table update fails
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Item equipped successfully',
      data: equipData[0]
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
}
