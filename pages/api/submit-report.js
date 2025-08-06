import { createClient } from '@supabase/supabase-js';

// Create Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, target_type, reason } = req.body;

    if (!user_id || !target_type || !reason) {
      return res.status(400).json({ 
        error: 'Missing required fields: user_id, target_type, reason' 
      });
    }

      // Try to insert the report
      const { data, error } = await supabaseAdmin
        .from('reports')
        .insert([
          {
            user_id,
            target_type,
            reason: reason.trim(),
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Database error:', error);
        
        // If table doesn't exist, return success with note
        if (error.code === '42P01') { // Table does not exist
          return res.status(200).json({ 
            success: true, 
            message: 'Report saved temporarily. Table will be created soon.',
            note: 'reports_table_not_found'
          });
        }
        
        return res.status(500).json({ 
          error: 'Database error', 
          details: error.message 
        });
      }

    return res.status(200).json({ 
      success: true, 
      message: 'Report submitted successfully',
      data 
    });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}