import { createClient } from '@supabase/supabase-js';

// Use service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ 
      success: false,
      error: 'User ID is required' 
    });
  }

  try {
    // Ambil profil pengguna saat ini dengan handling untuk multiple/no rows
    const { data: profiles, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('streak, updated_at, energy')
      .eq('id', userId);

    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      throw new Error(`Failed to fetch user profile: ${fetchError.message}`);
    }

    if (!profiles || profiles.length === 0) {
      throw new Error('User profile not found');
    }

    if (profiles.length > 1) {
      console.warn(`Multiple profiles found for user ${userId}, using first one`);
    }

    const profile = profiles[0];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
    let newStreak = 1; // Default ke 1 untuk streak baru
    let streakBroken = true;

    if (profile.updated_at) {
      const lastLogin = new Date(profile.updated_at);
      const lastLoginDay = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
      const diffDays = Math.floor((today - lastLoginDay) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Hari berturut-turut - tingkatkan streak
        newStreak = (profile.streak || 0) + 1;
        streakBroken = false;
      } else if (diffDays === 0) {
        // Hari yang sama - pertahankan streak saat ini
        return res.status(200).json({
          success: true,
          alreadyLoggedInToday: true,
          data: {
            streak: profile.streak || 0,
            energy: profile.energy || 0,
            streakBroken: false,
            lastLoginDate: profile.updated_at
          }
        });
      } else {
        // Selisih lebih dari 1 hari - reset streak
        newStreak = 1;
        streakBroken = true;
      }
    }

    // Perbarui profil dengan streak baru DAN energy +1 setiap hari
    const currentEnergy = profile.energy || 0;
    const newEnergy = Math.min(currentEnergy + 1, 10); // Cap at 10 energy

    const { data, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        streak: newStreak,
        energy: newEnergy,
        updated_at: now.toISOString()
      })
      .eq('id', userId)
      .select('*');

    if (updateError) {
      console.error('Error updating profile:', updateError);
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    if (!data || data.length === 0) {
      console.error('No data returned from update. User ID:', userId);
      throw new Error('No data returned from update - user might not exist');
    }

    const updatedProfile = data[0]; // Get first result
    
    console.log('Profile updated successfully:', {
      userId,
      oldStreak: profile.streak,
      newStreak: updatedProfile.streak,
      oldEnergy: profile.energy,
      newEnergy: updatedProfile.energy
    });

    return res.status(200).json({
      success: true,
      alreadyLoggedInToday: false,
      data: {
        streak: updatedProfile.streak,
        energy: updatedProfile.energy,
        energyAdded: newEnergy - (profile.energy || 0), // Tambahkan energyAdded
        streakBroken,
        lastLoginDate: updatedProfile.updated_at
      }
    });

  } catch (error) {
    console.error('Error in update-streak API:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update streak'
    });
  }
}