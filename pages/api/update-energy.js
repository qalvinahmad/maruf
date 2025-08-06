import { createClient } from '@supabase/supabase-js';

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Service role key for admin operations
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, energyToAdd, pointsToDeduct, energyToDeduct, operation } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: { userId, energyToAdd, pointsToDeduct, energyToDeduct, operation }
      });
    }

    console.log('=== API UPDATE ENERGY START ===');
    console.log('User ID:', userId);
    console.log('Operation:', operation);
    console.log('Energy to add:', energyToAdd);
    console.log('Energy to deduct:', energyToDeduct);
    console.log('Points to deduct:', pointsToDeduct);
    
    // Debug environment variables (without exposing keys)
    console.log('Environment check:');
    console.log('- SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('- SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log('- URL starts with https:', process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https:'));

    // Test Supabase connection first
    const { data: testConnection, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
      
    if (connectionError) {
      console.error('Supabase connection error:', connectionError);
      return res.status(500).json({ 
        error: 'Database connection failed',
        details: connectionError.message 
      });
    }
    
    console.log('✅ Supabase connection successful');

    // Get current profile
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('energy, points')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching current profile:', fetchError);
      return res.status(500).json({ 
        error: 'Failed to fetch current profile',
        details: fetchError.message,
        hint: fetchError.hint || 'Check if user exists and API keys are valid'
      });
    }

    console.log('Current profile:', currentProfile);

    let newEnergy = currentProfile.energy || 0;
    let newPoints = currentProfile.points || 0;

    // Handle different operations
    if (operation === 'deduct' && energyToDeduct) {
      // Deduct energy (for starting lessons)
      if (newEnergy < energyToDeduct) {
        return res.status(400).json({ 
          error: 'Insufficient energy',
          currentEnergy: newEnergy,
          requiredEnergy: energyToDeduct
        });
      }
      newEnergy -= energyToDeduct;
    } else if (operation === 'add' || (energyToAdd && pointsToDeduct)) {
      // Add energy (for purchasing)
      if (newPoints < pointsToDeduct) {
        return res.status(400).json({ 
          error: 'Insufficient points',
          currentPoints: newPoints,
          requiredPoints: pointsToDeduct
        });
      }
      newEnergy += energyToAdd;
      newPoints -= pointsToDeduct;
    } else {
      return res.status(400).json({ error: 'Invalid operation or missing parameters' });
    }

    console.log('Calculated new energy:', newEnergy);
    console.log('Calculated new points:', newPoints);

    // Update profile with new energy and points
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        energy: newEnergy,
        points: newPoints,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    console.log('Profile updated successfully:', updatedProfile);

    return res.status(200).json({
      success: true,
      message: 'Energy updated successfully',
      updatedProfile,
      changes: {
        energyAdded: energyToAdd,
        energyDeducted: energyToDeduct,
        pointsDeducted: pointsToDeduct,
        newEnergy,
        newPoints
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
