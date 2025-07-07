import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Ambil energy_amount dari tabel daily_energy_config berdasarkan tanggal hari ini
    const today = new Date().toISOString().split("T")[0];
    const { data: config, error: configError } = await supabase
      .from('daily_energy_config')
      .select('energy_amount')
      .eq('for_date', today)
      .single();

    const addedEnergy = config?.energy_amount ?? 2; // fallback default jika tidak ada config

    // Ambil profil pengguna
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('energy')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    const newEnergy = Math.min((profile.energy || 0) + addedEnergy, 10);

    // Update energy user
    const { data, error } = await supabase
      .from('profiles')
      .update({
        energy: newEnergy,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Error updating energy:', error);
    return res.status(500).json({
      error: 'Failed to update energy',
      details: error.message
    });
  }
}
