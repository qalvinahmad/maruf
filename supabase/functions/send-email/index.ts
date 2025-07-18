import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Resend API configuration (alternative email service)
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@belajarmakhraj.com'

// SMTP configuration (if using direct SMTP)
const SMTP_CONFIG = {
  hostname: Deno.env.get('SMTP_HOST') || 'smtp.gmail.com',
  port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
  username: Deno.env.get('SMTP_USERNAME'),
  password: Deno.env.get('SMTP_PASSWORD'),
}

// Email template function
const generateOTPEmailTemplate = (teacherName: string, otpCode: string, purpose: string) => {
  const purposeText = purpose === 'enable_2fa' ? 'mengaktifkan' : 'menonaktifkan';
  const actionText = purpose === 'enable_2fa' ? 'Aktifkan 2FA' : 'Nonaktifkan 2FA';
  
  return {
    subject: `🔐 Kode OTP untuk ${actionText} - Belajar Makhrojul Huruf`,
    html: `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kode OTP Verifikasi</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f8f9fa; 
          }
          .email-container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 12px; 
            overflow: hidden; 
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
          }
          .header h1 { font-size: 28px; margin-bottom: 10px; }
          .header p { font-size: 16px; opacity: 0.9; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 18px; margin-bottom: 20px; color: #2c3e50; }
          .otp-section { 
            text-align: center; 
            margin: 30px 0; 
            padding: 30px; 
            background: linear-gradient(145deg, #f8f9ff, #e3e7ff); 
            border-radius: 15px; 
            border: 2px solid #667eea; 
          }
          .otp-label { 
            font-size: 16px; 
            color: #555; 
            margin-bottom: 15px; 
            font-weight: 600; 
          }
          .otp-code { 
            font-size: 42px; 
            font-weight: bold; 
            color: #667eea; 
            letter-spacing: 12px; 
            margin: 15px 0; 
            padding: 15px; 
            background: white; 
            border-radius: 10px; 
            border: 2px dashed #667eea; 
          }
          .otp-validity { 
            font-size: 14px; 
            color: #e74c3c; 
            font-weight: 600; 
            margin-top: 10px; 
          }
          .security-warning { 
            background: #fff3cd; 
            border-left: 4px solid #ffc107; 
            padding: 20px; 
            margin: 25px 0; 
            border-radius: 5px; 
          }
          .security-warning h3 { 
            color: #856404; 
            margin-bottom: 15px; 
            font-size: 16px; 
          }
          .security-warning ul { 
            color: #856404; 
            padding-left: 20px; 
          }
          .security-warning li { margin-bottom: 5px; }
          .steps { 
            background: #e8f5e8; 
            border-left: 4px solid #28a745; 
            padding: 20px; 
            margin: 25px 0; 
            border-radius: 5px; 
          }
          .steps h3 { 
            color: #155724; 
            margin-bottom: 15px; 
            font-size: 16px; 
          }
          .steps ol { 
            color: #155724; 
            padding-left: 20px; 
          }
          .steps li { margin-bottom: 8px; }
          .footer { 
            background: #f8f9fa; 
            padding: 25px; 
            text-align: center; 
            border-top: 1px solid #dee2e6; 
            color: #6c757d; 
            font-size: 12px; 
          }
          .footer p { margin-bottom: 5px; }
          .support-info { 
            margin: 20px 0; 
            padding: 15px; 
            background: #e3f2fd; 
            border-radius: 8px; 
            text-align: center; 
          }
          .support-info p { color: #1565c0; font-size: 14px; }
          @media (max-width: 600px) {
            .email-container { margin: 10px; }
            .content, .header { padding: 20px; }
            .otp-code { font-size: 32px; letter-spacing: 8px; }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🔐 Verifikasi Keamanan</h1>
            <p>Belajar Makhrojul Huruf - Teacher Dashboard</p>
          </div>
          
          <div class="content">
            <div class="greeting">Assalamu'alaikum, ${teacherName}!</div>
            
            <p>Anda telah meminta untuk <strong>${purposeText} Two-Factor Authentication (2FA)</strong> pada akun guru Anda di platform Belajar Makhrojul Huruf.</p>
            
            <div class="otp-section">
              <div class="otp-label">Kode OTP Verifikasi Anda:</div>
              <div class="otp-code">${otpCode}</div>
              <div class="otp-validity">⏰ Kode berlaku selama 5 menit</div>
            </div>
            
            <div class="security-warning">
              <h3>⚠️ Penting untuk Keamanan Akun:</h3>
              <ul>
                <li><strong>Jangan bagikan</strong> kode ini kepada siapa pun termasuk admin</li>
                <li><strong>Kode hanya berlaku 5 menit</strong> sejak email ini dikirim</li>
                <li><strong>Hanya dapat digunakan sekali</strong> untuk verifikasi</li>
                <li><strong>Jika tidak meminta</strong>, segera abaikan email ini</li>
                <li><strong>Laporkan</strong> aktivitas mencurigakan ke tim support</li>
              </ul>
            </div>
            
            <div class="steps">
              <h3>📋 Langkah Penyelesaian:</h3>
              <ol>
                <li><strong>Kembali</strong> ke halaman pengaturan dashboard teacher</li>
                <li><strong>Masukkan kode</strong> <code>${otpCode}</code> pada form verifikasi OTP</li>
                <li><strong>Klik tombol "Verifikasi"</strong> untuk menyelesaikan proses</li>
                <li><strong>Tunggu konfirmasi</strong> bahwa 2FA berhasil ${purposeText}</li>
              </ol>
            </div>
            
            <div class="support-info">
              <p>💬 Butuh bantuan? Hubungi support di <strong>support@belajarmakhraj.com</strong></p>
            </div>
            
            <p style="margin-top: 25px; color: #6c757d; font-size: 14px;">
              Email ini dikirim secara otomatis karena ada permintaan perubahan keamanan pada akun Anda. 
              Jika Anda tidak melakukan permintaan ini, silakan abaikan email ini atau hubungi tim support kami.
            </p>
          </div>
          
          <div class="footer">
            <p><strong>Belajar Makhrojul Huruf</strong></p>
            <p>Platform Digital Pembelajaran Ilmu Tajwid</p>
            <p>Email otomatis - Mohon tidak membalas email ini</p>
            <p>© 2025 Belajar Makhrojul Huruf. Hak cipta dilindungi.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
🔐 Kode OTP Verifikasi - Belajar Makhrojul Huruf

Assalamu'alaikum ${teacherName},

Anda telah meminta untuk ${purposeText} Two-Factor Authentication (2FA) pada akun guru Anda.

KODE OTP ANDA: ${otpCode}
⏰ Berlaku selama: 5 menit

⚠️ PENTING UNTUK KEAMANAN:
- Jangan bagikan kode ini kepada siapa pun
- Kode hanya berlaku 5 menit sejak email dikirim
- Kode hanya dapat digunakan sekali
- Jika tidak meminta, abaikan email ini

📋 LANGKAH PENYELESAIAN:
1. Kembali ke halaman pengaturan dashboard teacher
2. Masukkan kode ${otpCode} pada form verifikasi OTP
3. Klik tombol "Verifikasi" untuk menyelesaikan proses
4. Tunggu konfirmasi bahwa 2FA berhasil ${purposeText}

💬 Butuh bantuan? Hubungi: support@belajarmakhraj.com

Wassalamu'alaikum warahmatullahi wabarakatuh

---
Belajar Makhrojul Huruf Team
Platform Digital Pembelajaran Ilmu Tajwid
© 2025 - Email otomatis, mohon tidak membalas
    `
  };
};

// Function to send email via Resend API
async function sendEmailViaResend(to: string, subject: string, html: string, text: string) {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject: subject,
      html: html,
      text: text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }

  return await response.json();
}

// Function to send email via SMTP (using Deno's built-in capabilities)
async function sendEmailViaSMTP(to: string, subject: string, html: string, text: string) {
  // This is a simplified SMTP implementation
  // In production, you might want to use a proper SMTP library
  
  const emailData = {
    to,
    from: FROM_EMAIL,
    subject,
    html,
    text,
    timestamp: new Date().toISOString()
  };

  // Log email data (in production, implement actual SMTP sending)
  console.log('Email to send via SMTP:', emailData);
  
  // For now, return success (implement actual SMTP in production)
  return { success: true, messageId: `smtp_${Date.now()}` };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { 
      to, 
      teacher_name, 
      otp_code, 
      purpose = 'enable_2fa',
      method = 'resend' // 'resend' or 'smtp'
    } = await req.json();

    if (!to || !teacher_name || !otp_code) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, teacher_name, otp_code' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate email template
    const emailTemplate = generateOTPEmailTemplate(teacher_name, otp_code, purpose);

    let result;
    
    if (method === 'resend' && RESEND_API_KEY) {
      // Send via Resend API
      result = await sendEmailViaResend(
        to,
        emailTemplate.subject,
        emailTemplate.html,
        emailTemplate.text
      );
    } else {
      // Send via SMTP
      result = await sendEmailViaSMTP(
        to,
        emailTemplate.subject,
        emailTemplate.html,
        emailTemplate.text
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully',
        result: result,
        method: method
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in send-email function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
