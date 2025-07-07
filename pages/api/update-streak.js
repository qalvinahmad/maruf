import { supabase } from '../../lib/supabaseClient';

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
    // Ambil profil pengguna saat ini
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('streak, updated_at')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      throw new Error(`Failed to fetch user profile: ${fetchError.message}`);
    }

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

    // Perbarui profil dengan streak baru
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({
        streak: newStreak,
        updated_at: now.toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    return res.status(200).json({
      success: true,
      data: {
        streak: data.streak,
        streakBroken,
        lastLoginDate: data.updated_at
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