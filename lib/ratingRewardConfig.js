import { supabase } from './supabaseClient';

/**
 * Get rating reward configuration from database
 * @returns {Promise<Object>} Reward configuration object
 */
export const getRatingRewardConfig = async () => {
  try {
    const { data, error } = await supabase
      .from('rating_reward_config')
      .select('rating_value, reward_points, description')
      .eq('is_active', true)
      .order('rating_value', { ascending: true });

    if (error) {
      console.error('Error fetching rating reward config:', error);
      // Return default config if database fails
      return getDefaultRewardConfig();
    }

    // Convert array to object for easy lookup
    const config = {};
    data.forEach(item => {
      config[item.rating_value] = {
        points: item.reward_points,
        description: item.description
      };
    });

    return config;
  } catch (error) {
    console.error('Error in getRatingRewardConfig:', error);
    return getDefaultRewardConfig();
  }
};

/**
 * Get default reward configuration (fallback)
 * @returns {Object} Default reward configuration
 */
export const getDefaultRewardConfig = () => {
  return {
    1: { points: 5, description: 'Sangat Buruk - Terima kasih atas feedback Anda' },
    2: { points: 10, description: 'Buruk - Kami akan terus berusaha lebih baik' },
    3: { points: 15, description: 'Cukup - Feedback Anda sangat berharga' },
    4: { points: 20, description: 'Baik - Terima kasih atas dukungan Anda' },
    5: { points: 25, description: 'Sangat Baik - Terima kasih atas kepercayaan Anda' }
  };
};

/**
 * Get reward points for specific rating value
 * @param {number} ratingValue - Rating value (1-5)
 * @param {Object} config - Reward configuration object
 * @returns {number} Reward points
 */
export const getRewardPoints = (ratingValue, config = null) => {
  if (!config) {
    config = getDefaultRewardConfig();
  }
  
  return config[ratingValue]?.points || 0;
};

/**
 * Submit rating with reward points
 * @param {Object} ratingData - Rating data object
 * @returns {Promise<Object>} Result object
 */
export const submitRatingWithReward = async (ratingData) => {
  try {
    const { user_id, rating, comment, reward_points } = ratingData;

    // Start transaction-like operation
    const { data: ratingInsert, error: ratingError } = await supabase
      .from('rating')
      .insert([{
        user_id,
        rating,
        comment: comment?.trim() || null,
        reward_points
      }])
      .select();

    if (ratingError) {
      throw ratingError;
    }

    // Update user points
    const { error: pointsError } = await supabase.rpc('increment_user_points', {
      user_id_param: user_id,
      points_to_add: reward_points
    });

    if (pointsError) {
      console.error('Error updating user points:', pointsError);
      // Don't throw error, rating was already saved
    }

    return {
      success: true,
      data: ratingInsert,
      reward_points
    };

  } catch (error) {
    console.error('Error in submitRatingWithReward:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update rating reward configuration (Admin only)
 * @param {Array} configUpdates - Array of config updates
 * @returns {Promise<Object>} Result object
 */
export const updateRatingRewardConfig = async (configUpdates) => {
  try {
    const { data, error } = await supabase
      .from('rating_reward_config')
      .upsert(configUpdates, { 
        onConflict: 'rating_value',
        returning: 'minimal'
      });

    if (error) {
      throw error;
    }

    return {
      success: true,
      data
    };

  } catch (error) {
    console.error('Error updating rating reward config:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
