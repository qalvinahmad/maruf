import { sendCustomOTPEmail } from '../../lib/emailService';
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, otpCode, purpose, websiteUrl = 'https://almakruf.com' } = req.body;

  if (!email || !otpCode) {
    return res.status(400).json({ error: 'Email and OTP code are required' });
  }

  try {
    console.log('🔄 Attempting to send OTP email to:', email);
    console.log('🔑 OTP Code:', otpCode);
    console.log('📝 Purpose:', purpose);

    // METHOD 1: Try Zoho email service first
    console.log('1️⃣ Trying Zoho Email Service');
    try {
      const emailResult = await sendCustomOTPEmail(email, otpCode, purpose);
      
      if (emailResult.success) {
        console.log('✅ Zoho email sent successfully:', emailResult.messageId);
        
        // Save OTP to database for verification
        const { error: dbError } = await supabase
          .from('otp_codes')
          .insert({
            email: email,
            otp_code: otpCode,
            purpose: purpose,
            expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString()
          });

        if (dbError) {
          console.warn('⚠️ Failed to save OTP to database:', dbError);
        } else {
          console.log('💾 OTP saved to database successfully');
        }
        
        return res.status(200).json({
          success: true,
          message: 'OTP email berhasil dikirim via Zoho',
          method_used: 'zoho_email_service',
          email_sent: true,
          masked_email: email.replace(/(.{2})(.*)(@.*)/, "$1***$3")
        });
      }
    } catch (emailError) {
      console.log('❌ Zoho email failed:', emailError.message);
    }

    // METHOD 2: Database storage with OTP display (fallback)
    console.log('2️⃣ Using database storage with OTP display');
    
    const { error: dbError } = await supabase
      .from('otp_codes')
      .insert({
        email: email,
        otp_code: otpCode,
        purpose: purpose,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      });

    if (dbError) {
      console.warn('⚠️ Database save failed:', dbError);
      // Still return success with OTP for testing
    } else {
      console.log('💾 OTP saved to database for verification');
    }
    
    return res.status(200).json({
      success: true,
      message: 'OTP berhasil dibuat (email service dalam perbaikan)',
      method_used: 'database_with_display',
      email_sent: false,
      otp_code: otpCode, // Show OTP for testing
      masked_email: email.replace(/(.{2})(.*)(@.*)/, "$1***$3"),
      note: 'Gunakan kode OTP di atas untuk testing sementara email service diperbaiki'
    });

  } catch (error) {
    console.error('❌ Error in OTP generation:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate OTP',
      email_sent: false,
      details: error.message
    });
  }
}
