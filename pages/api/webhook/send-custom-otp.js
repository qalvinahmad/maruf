// API endpoint untuk mengirim email OTP kustom
// pages/api/webhook/send-custom-otp.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, otp_code, purpose, website_url = 'https://almakruf.com' } = req.body;

  if (!to || !otp_code) {
    return res.status(400).json({ error: 'Email and OTP code are required' });
  }

  try {
    // Template email lengkap dengan styling yang Anda berikan
    const htmlTemplate = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Konfirmasi Reauthentication - Mahraj Learning</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #00acee 0%, #9146ff 100%);
            min-height: 100vh;
            padding: 20px;
            line-height: 1.6;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .container {
            max-width: 500px;
            width: 100%;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
            animation: slideIn 0.6s ease-out;
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .header {
            background: linear-gradient(135deg, #00acee 0%, #9146ff 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.05)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.05)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.03)"/><circle cx="10" cy="50" r="0.5" fill="rgba(255,255,255,0.03)"/><circle cx="90" cy="30" r="0.5" fill="rgba(255,255,255,0.03)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            animation: float 20s infinite linear;
        }
        
        @keyframes float {
            from { transform: translateX(-50px); }
            to { transform: translateX(50px); }
        }
        
        .logo {
            width: 80px;
            height: 80px;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            color: white;
            font-weight: bold;
            position: relative;
            z-index: 1;
            backdrop-filter: blur(10px);
            border: 3px solid rgba(255,255,255,0.3);
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        .header h1 {
            color: white;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
            position: relative;
            z-index: 1;
        }
        
        .header p {
            color: rgba(255,255,255,0.9);
            font-size: 14px;
            position: relative;
            z-index: 1;
        }
        
        .content {
            padding: 50px 40px;
            text-align: center;
        }
        
        .auth-icon {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #00acee 0%, #9146ff 100%);
            border-radius: 50%;
            margin: 0 auto 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: authPulse 2s infinite;
        }
        
        @keyframes authPulse {
            0%, 100% { 
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(0,172,238,0.3);
            }
            50% { 
                transform: scale(1.05);
                box-shadow: 0 0 0 20px rgba(0,172,238,0);
            }
        }
        
        .title {
            font-size: 28px;
            color: #333;
            margin-bottom: 16px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .description {
            font-size: 16px;
            color: #666;
            margin-bottom: 40px;
            line-height: 1.8;
        }
        
        .code-display {
            background: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 15px;
            padding: 30px;
            margin: 30px 0;
            text-align: center;
        }
        
        .code-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 15px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .code-value {
            font-size: 48px;
            font-weight: 800;
            color: #333;
            font-family: 'Courier New', monospace;
            letter-spacing: 8px;
            margin: 20px 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .code-instruction {
            font-size: 14px;
            color: #666;
            margin-top: 15px;
        }
        
        .expiry-info {
            background: #e3f2fd;
            border: 1px solid #90caf9;
            border-radius: 10px;
            padding: 20px;
            margin: 30px 0;
            text-align: center;
        }
        
        .expiry-info h4 {
            color: #0277bd;
            margin-bottom: 10px;
            font-size: 16px;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .expiry-info p {
            color: #0277bd;
            font-size: 14px;
            margin: 0;
        }
        
        .warning-note {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 10px;
            padding: 20px;
            margin: 30px 0;
            text-align: left;
        }
        
        .warning-note h4 {
            color: #856404;
            margin-bottom: 10px;
            font-size: 16px;
            font-weight: 600;
            display: flex;
            align-items: center;
        }
        
        .warning-note p {
            color: #856404;
            font-size: 14px;
            margin: 0;
        }
        
        .action-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 30px;
        }
        
        .btn {
            padding: 15px 30px;
            border: none;
            border-radius: 50px;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #00acee 0%, #9146ff 100%);
            color: white;
            box-shadow: 0 10px 30px rgba(0,172,238,0.3);
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 40px rgba(0,172,238,0.4);
        }
        
        .btn-secondary {
            background: white;
            color: #666;
            border: 2px solid #e9ecef;
        }
        
        .btn-secondary:hover {
            background: #f8f9fa;
            transform: translateY(-2px);
        }
        
        .footer {
            background: #f8f9fa;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        
        .footer p {
            color: #666;
            font-size: 14px;
            margin: 0;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 15px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .content {
                padding: 40px 20px;
            }
            
            .footer {
                padding: 25px 20px;
            }
            
            .code-value {
                font-size: 36px;
                letter-spacing: 4px;
            }
            
            .action-buttons {
                flex-direction: column;
                gap: 10px;
            }
            
            .btn {
                width: 100%;
                justify-content: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">ح</div>
            <h1>Mahraj Learning</h1>
            <p>Platform Pembelajaran Makhorijul Huruf</p>
        </div>
        
        <div class="content">
            <div class="auth-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 12l2 2 4-4"/>
                    <path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"/>
                    <circle cx="12" cy="12" r="10"/>
                </svg>
            </div>
            
            <h2 class="title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; vertical-align: middle;">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                    <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
                    <path d="M9 9v1h6V9"/>
                    <path d="M12 12v3"/>
                </svg>
                Konfirmasi Reauthentication
            </h2>
            
            <p class="description">
                Untuk keamanan akun Anda, silakan masukkan kode verifikasi 4 digit di bawah ini pada halaman yang meminta konfirmasi reauthentication.
            </p>
            
            <div class="code-display">
                <div class="code-label">Kode Verifikasi Anda</div>
                <div class="code-value">${otp_code}</div>
                <div class="code-instruction">Masukkan kode ini pada halaman konfirmasi</div>
            </div>
            
            <div class="expiry-info">
                <h4>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                    </svg>
                    Kode Kedaluwarsa
                </h4>
                <p>Kode ini akan kedaluwarsa dalam 10 menit untuk menjaga keamanan akun Anda.</p>
            </div>
            
            <div class="warning-note">
                <h4>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                        <path d="M12 9v4"/>
                        <path d="m12 17 .01 0"/>
                    </svg>
                    Penting untuk Keamanan
                </h4>
                <p>Jangan bagikan kode ini kepada siapa pun. Jika Anda tidak meminta kode ini, segera hubungi tim support kami.</p>
            </div>
            
            <div class="action-buttons">
                <a href="${website_url}/dashboard/teacher/DashboardSettingsTeacher" class="btn btn-primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                        <path d="M3 3v5h5"/>
                    </svg>
                    Kembali ke Halaman
                </a>
                <a href="${website_url}/support" class="btn btn-secondary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9 2-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    Butuh Bantuan?
                </a>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2025 Mahraj Learning. Kode verifikasi ini dikirim untuk keamanan akun Anda.</p>
            <p>Website: ${website_url}</p>
        </div>
    </div>
</body>
</html>`;

    // Simulate email sending (you would replace this with actual email service)
    // Examples: SendGrid, AWS SES, NodeMailer, etc.
    
    console.log('Sending OTP email to:', to);
    console.log('OTP Code:', otp_code);
    console.log('Purpose:', purpose);
    
    // For demonstration, we'll simulate successful email sending
    // In production, integrate with your email service provider
    
    return res.status(200).json({
      success: true,
      message: 'Custom OTP email sent successfully',
      email_sent: true,
      template_used: 'custom_otp_template'
    });

  } catch (error) {
    console.error('Error sending custom OTP email:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to send custom OTP email',
      email_sent: false
    });
  }
}
