import { supabase } from './supabaseClient';

// Generate a random 4-digit OTP
const generateRandomOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Mask email for privacy
const maskEmail = (email) => {
  const [username, domain] = email.split('@');
  const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
  return `${maskedUsername}@${domain}`;
};

// Generate and store OTP
export const generateOTP = async (email, purpose = 'enable_2fa') => {
  try {
    // Generate OTP
    const otpCode = generateRandomOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Store OTP first for verification
    try {
      const { error: insertError } = await supabase
        .from('otp_codes')
        .insert({
          email: email,
          otp_code: otpCode,
          purpose: purpose,
          expires_at: expiresAt.toISOString(),
          used: false,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        throw insertError;
      }
    } catch (dbError) {
      // Fallback to localStorage if database table doesn't exist
      console.warn('OTP table not found, using localStorage fallback');
      const otpData = {
        email,
        otp_code: otpCode,
        purpose,
        expires_at: expiresAt.getTime(),
        created_at: Date.now()
      };
      localStorage.setItem(`otp_${email}_${purpose}`, JSON.stringify(otpData));
    }

    // Try to send email using various methods
    let emailSent = false;
    
    try {
      // Method 1: Try using a custom API endpoint with proper email service
      const response = await fetch('/api/send-otp-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otpCode: otpCode,
          purpose: purpose,
          websiteUrl: 'https://almakruf.com'
        })
      });

      if (response.ok) {
        const result = await response.json();
        emailSent = result.email_sent || false;
        console.log('OTP email sent via API endpoint');
      }
    } catch (apiError) {
      console.warn('API email sending failed:', apiError);
    }

    // Method 2: Try using Supabase Edge Function (if available)
    if (!emailSent) {
      try {
        const { data, error } = await supabase.functions.invoke('send-otp-email', {
          body: {
            email: email,
            otp_code: otpCode,
            purpose: purpose,
            website_url: 'https://almakruf.com'
          }
        });

        if (!error && data?.success) {
          emailSent = true;
          console.log('OTP email sent via Edge Function');
        }
      } catch (edgeFunctionError) {
        console.warn('Edge Function email failed:', edgeFunctionError);
      }
    }

    // Method 3: Custom webhook approach (if other methods fail)
    if (!emailSent) {
      try {
        // This will call a webhook that sends the custom email
        const webhookResponse = await fetch('/api/webhook/send-custom-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: email,
            otp_code: otpCode,
            purpose: purpose === 'enable_2fa' ? 'Aktivasi 2FA' : 'Nonaktifkan 2FA',
            website_url: 'https://almakruf.com'
          })
        });

        if (webhookResponse.ok) {
          emailSent = true;
          console.log('OTP email sent via webhook');
        }
      } catch (webhookError) {
        console.warn('Webhook email failed:', webhookError);
      }
    }

    return {
      success: true,  
      otp_code: emailSent ? undefined : otpCode, // Only return OTP if email failed
      masked_email: maskEmail(email),
      email_sent: emailSent,
      message: emailSent ? 'OTP sent to email successfully' : 'OTP generated successfully'
    };
  } catch (error) {
    console.error('Error generating OTP:', error);
    throw new Error('Gagal membuat OTP. Silakan coba lagi.');
  }
};

// Verify OTP
export const verifyOTP = async (email, otpCode, action = 'enable') => {
  try {
    console.log('🔍 Verifying OTP:', { email, otpCode, action });
    
    let isValidOTP = false;
    let otpData = null;

    // First try to get OTP from database
    try {
      const { data: otpRecord, error: fetchError } = await supabase
        .from('otp_codes')
        .select('*')
        .eq('email', email)
        .eq('otp_code', otpCode)
        .eq('used', false)
        .single();

      if (!fetchError && otpRecord) {
        console.log('✅ Found OTP in database:', otpRecord.id);
        
        // Check if OTP is still valid
        const now = new Date();
        const expiresAt = new Date(otpRecord.expires_at);
        
        console.log('🕐 Time check:', { now: now.toISOString(), expiresAt: expiresAt.toISOString() });
        
        if (now < expiresAt) {
          isValidOTP = true;
          console.log('🎯 OTP is valid, marking as used');
          
          // Mark OTP as used
          const { error: updateError } = await supabase
            .from('otp_codes')
            .update({ used: true, used_at: new Date().toISOString() })
            .eq('id', otpRecord.id);
            
          if (updateError) {
            console.warn('⚠️ Failed to mark OTP as used:', updateError);
          }
        } else {
          console.log('⏰ OTP has expired');
        }
      } else {
        console.log('❌ OTP not found in database:', fetchError?.message);
      }
    } catch (dbError) {
      console.log('🔄 Database failed, trying localStorage:', dbError.message);
      
      // Fallback to localStorage
      const purposeKey = action === 'enable' ? 'enable_2fa' : 'disable_2fa';
      const storedOTP = localStorage.getItem(`otp_${email}_${purposeKey}`);
      
      if (storedOTP) {
        otpData = JSON.parse(storedOTP);
        const now = Date.now();
        
        console.log('🔍 Checking localStorage OTP:', { stored: otpData.otp_code, input: otpCode });
        
        if (otpData.otp_code === otpCode && now < otpData.expires_at) {
          isValidOTP = true;
          console.log('✅ localStorage OTP is valid');
          // Mark as used by removing from localStorage
          localStorage.removeItem(`otp_${email}_${purposeKey}`);
        }
      }
    }

    if (!isValidOTP) {
      console.log('❌ OTP validation failed');
      return {
        success: false,
        message: 'Kode OTP tidak valid atau sudah kedaluwarsa. Silakan generate OTP baru.'
      };
    }

    console.log('🎉 OTP verification successful');
    return {
      success: true,
      action: action,
      message: `2FA berhasil ${action === 'enable' ? 'diaktifkan' : 'dinonaktifkan'}`
    };
  } catch (error) {
    console.error('❌ Error verifying OTP:', error);
    return {
      success: false,
      message: error.message || 'Gagal memverifikasi OTP. Silakan coba lagi.'
    };
  }
};

// Helper function to clean expired OTPs
export const cleanExpiredOTPs = async () => {
  try {
    const now = new Date().toISOString();
    await supabase
      .from('otp_codes')
      .delete()
      .lt('expires_at', now);
  } catch (error) {
    console.warn('Failed to clean expired OTPs:', error);
  }
};

// Check if teacher has 2FA enabled
export const check2FAStatus = async (email) => {
  try {
    const { data, error } = await supabase
      .from('teacher_profiles')
      .select('two_factor_enabled')
      .eq('email', email)
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
