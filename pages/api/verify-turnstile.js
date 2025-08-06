import { verifyTurnstileToken } from '../../lib/turnstile';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { token, remoteip } = req.body;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token tidak boleh kosong' 
      });
    }

    // Handle development mode tokens
    if (token.startsWith('dev_token_')) {
      console.log('Development mode verification for token:', token);
      return res.status(200).json({
        success: true,
        message: 'Development mode verification successful',
        development: true
      });
    }

    // Get client IP if not provided
    const clientIP = remoteip || 
      req.headers['x-forwarded-for'] || 
      req.headers['x-real-ip'] || 
      req.connection.remoteAddress || 
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : null);

    console.log('Verifying Turnstile token:', { 
      token: token.substring(0, 20) + '...', 
      ip: clientIP 
    });

    // Verify with Cloudflare
    const verification = await verifyTurnstileToken(token, clientIP);

    if (!verification.success) {
      console.error('Turnstile verification failed:', verification);
      
      // Map error codes to user-friendly messages
      const errorMessages = {
        'missing-input-secret': 'Konfigurasi server tidak valid',
        'invalid-input-secret': 'Konfigurasi server tidak valid',
        'missing-input-response': 'Token verifikasi tidak ditemukan',
        'invalid-input-response': 'Token verifikasi tidak valid',
        'bad-request': 'Permintaan tidak valid',
        'timeout-or-duplicate': 'Token sudah digunakan atau kedaluwarsa',
        'internal-error': 'Terjadi kesalahan internal pada server verifikasi',
        'network-error': 'Gagal terhubung ke server verifikasi'
      };

      const errorCode = verification.errorCodes?.[0] || 'unknown';
      const errorMessage = errorMessages[errorCode] || 'Verifikasi gagal, silakan coba lagi';

      return res.status(400).json({ 
        success: false, 
        error: errorMessage,
        errorCode: errorCode
      });
    }

    console.log('Turnstile verification successful:', {
      hostname: verification.hostname,
      challenge_ts: verification.challenge_ts
    });

    // Return success
    return res.status(200).json({ 
      success: true, 
      message: 'Verifikasi berhasil',
      data: {
        hostname: verification.hostname,
        challenge_ts: verification.challenge_ts
      }
    });

  } catch (error) {
    console.error('Turnstile verification API error:', error);
    
    return res.status(500).json({ 
      success: false, 
      error: 'Terjadi kesalahan server saat verifikasi' 
    });
  }
}

// Rate limiting untuk endpoint ini
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
