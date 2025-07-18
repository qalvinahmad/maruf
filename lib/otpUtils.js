import { supabase } from './supabaseClient';

// Generate and send OTP
export const generateOTP = async (userId, purpose = 'enable_2fa') => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        user_id: userId,
        purpose: purpose
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate OTP');
    }

    return data;
  } catch (error) {
    console.error('Error generating OTP:', error);
    throw error;
  }
};

// Verify OTP
export const verifyOTP = async (userId, otpCode, action = 'enable') => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        user_id: userId,
        otp_code: otpCode,
        action: action
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to verify OTP');
    }

    return data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

// Fallback: Generate OTP locally (for demo purposes)
export const generateOTPLocal = async (userId, purpose = 'enable_2fa') => {
  try {
    // Generate 4-digit OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Set expiration time (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Clean expired OTPs for this user
    await supabase
      .from('teacher_otp')
      .delete()
      .eq('user_id', userId)
      .or(`expires_at.lt.${new Date().toISOString()},is_used.eq.true`);

    // Insert new OTP
    const { data, error } = await supabase
      .from('teacher_otp')
      .insert({
        user_id: userId,
        otp_code: otpCode,
        purpose: purpose,
        expires_at: expiresAt
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating OTP:', error);
      throw new Error('Failed to generate OTP');
    }

    // In production, send OTP via email/SMS
    console.log(`OTP for user ${userId}: ${otpCode}`);

    return {
      success: true,
      message: 'OTP generated successfully',
      otp_code: otpCode, // Remove this in production
      expires_at: expiresAt
    };

  } catch (error) {
    console.error('Error in generateOTPLocal:', error);
    throw error;
  }
};

// Fallback: Verify OTP locally
export const verifyOTPLocal = async (userId, otpCode, action = 'enable') => {
  try {
    // Verify OTP
    const { data: otpData, error: otpError } = await supabase
      .from('teacher_otp')
      .select('*')
      .eq('user_id', userId)
      .eq('otp_code', otpCode)
      .eq('is_used', false)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (otpError || !otpData) {
      throw new Error('Invalid or expired OTP code');
    }

    // Mark OTP as used
    await supabase
      .from('teacher_otp')
      .update({ is_used: true })
      .eq('id', otpData.id);

    // Update teacher profile based on action
    if (action === 'enable') {
      const { error: updateError } = await supabase
        .from('teacher_profiles')
        .update({ two_factor_enabled: true })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating teacher profile:', updateError);
        throw new Error('Failed to enable 2FA');
      }
    } else if (action === 'disable') {
      const { error: updateError } = await supabase
        .from('teacher_profiles')
        .update({ two_factor_enabled: false })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating teacher profile:', updateError);
        throw new Error('Failed to disable 2FA');
      }
    }

    return {
      success: true,
      valid: true,
      message: `2FA ${action === 'enable' ? 'enabled' : 'disabled'} successfully`
    };

  } catch (error) {
    console.error('Error in verifyOTPLocal:', error);
    throw error;
  }
};

// Check if teacher has 2FA enabled
export const check2FAStatus = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('teacher_profiles')
      .select('two_factor_enabled')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error checking 2FA status:', error);
      return false;
    }

    return data?.two_factor_enabled || false;
  } catch (error) {
    console.error('Error in check2FAStatus:', error);
    return false;
  }
};
