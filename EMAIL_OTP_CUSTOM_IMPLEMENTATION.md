# EMAIL OTP CUSTOM TEMPLATE IMPLEMENTATION

## Permasalahan yang Dipecahkan

Sebelumnya, sistem OTP menggunakan template email bawaan Supabase yang menampilkan template "reset password" alih-alih template OTP kustom yang diinginkan. Implementasi ini menyelesaikan masalah tersebut dengan:

1. **Template Email Kustom**: Menggunakan HTML template yang sesuai dengan desain Mahraj Learning
2. **Multiple Delivery Methods**: 3 metode pengiriman email dengan fallback system
3. **Integrasi Email Service**: Menggunakan Nodemailer untuk pengiriman email yang sesungguhnya

## Komponen yang Diimplementasikan

### 1. Email Service (`lib/emailService.js`)
- Service utama untuk mengirim email menggunakan Nodemailer
- Support untuk Gmail SMTP dan konfigurasi SMTP lainnya
- Template HTML lengkap dengan styling yang sesuai brand Mahraj Learning
- Fungsi test koneksi email

### 2. API Endpoint (`pages/api/send-otp-email.js`)
- Endpoint untuk mengirim OTP email dengan 3 metode fallback:
  1. **Custom Email Service** (Primary) - menggunakan Nodemailer
  2. **Database Trigger** (Fallback) - menyimpan ke email_queue table
  3. **Local Storage** (Emergency) - fallback terakhir untuk development

### 3. OTP Utilities (`lib/otpUtils.js`)
- Sudah terintegrasi dengan API endpoint yang baru
- Menggunakan parameter yang sesuai: `otpCode`, `purpose`, `websiteUrl`

### 4. Webhook Endpoint (`pages/api/webhook/send-custom-otp.js`)
- Alternative endpoint untuk webhook integration
- Dapat digunakan untuk integrasi dengan external services

## Konfigurasi Email Service

### Setup Gmail SMTP (Recommended untuk Development)

1. **Enable 2-Factor Authentication** di akun Gmail Anda
2. **Generate App Password**:
   - Buka Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password untuk "Mail"
3. **Setup Environment Variables** di `.env.local`:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
```

### Alternative SMTP Configuration

```env
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-password
```

## Template Email Features

### Design Elements
- **Brand Consistency**: Logo Mahraj Learning dengan karakter ح
- **Gradient Background**: Linear gradient biru (#00acee) ke ungu (#9146ff)
- **Responsive Design**: Mobile-friendly dengan media queries
- **Modern UI**: Rounded corners, shadows, dan animasi CSS

### Content Elements
- **4-Digit OTP Code**: Ditampilkan dengan font monospace dan letter-spacing
- **Expiry Information**: Notifikasi bahwa kode kedaluwarsa dalam 10 menit
- **Security Warning**: Peringatan untuk tidak membagikan kode
- **Action Buttons**: Link kembali ke dashboard dan support
- **Footer**: Copyright dan website URL

### Security Features
- **Code Validation**: OTP disimpan di database dengan expiry time
- **Purpose Tracking**: Setiap OTP memiliki purpose yang jelas
- **Email Verification**: Validasi format email sebelum pengiriman

## Testing dan Troubleshooting

### Test Email Connection
```javascript
import { testEmailConnection } from '../lib/emailService';

const result = await testEmailConnection();
console.log(result);
```

### Debug Email Sending
1. **Check Console Logs**: API endpoint memberikan log detail untuk setiap metode
2. **Verify Environment Variables**: Pastikan EMAIL_USER dan EMAIL_PASS sudah set
3. **Test Gmail App Password**: Pastikan app password valid dan aktif

### Common Issues & Solutions

#### 1. "Authentication Failed" Error
- **Cause**: Invalid Gmail app password atau 2FA tidak aktif
- **Solution**: Generate ulang app password dan pastikan 2FA aktif

#### 2. "Connection Timeout" Error
- **Cause**: Firewall atau network blocking SMTP port
- **Solution**: Coba gunakan port 465 (secure) atau hubungi network admin

#### 3. Email Not Received
- **Cause**: Email masuk ke spam folder atau rate limiting
- **Solution**: Check spam folder, wait beberapa menit, coba dengan email provider lain

## Integration dengan UI Components

### DashboardSettingsTeacher.jsx
Komponen sudah terintegrasi dengan sistem OTP yang baru:

```javascript
const generateOTPCode = async () => {
  try {
    const result = await generateOTP(user.email, 'teacher_2fa_activation');
    
    if (result.success) {
      if (result.email_sent) {
        toast.success('Kode OTP telah dikirim ke email Anda!');
      } else {
        toast.warning('Email tidak dapat dikirim, gunakan kode: ' + result.otp_code);
      }
    }
  } catch (error) {
    toast.error('Gagal generate OTP: ' + error.message);
  }
};
```

## Production Deployment

### Untuk Production Environment
1. **Gunakan SendGrid atau AWS SES** alih-alih Gmail SMTP
2. **Setup Custom Domain** untuk email sender
3. **Implement Email Queue Processing** dengan cron job atau serverless function
4. **Add Email Analytics** untuk tracking delivery rates
5. **Setup SPF/DKIM Records** untuk email authentication

### Environment Variables Production
```env
# Production Email Service
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@almakruf.com

# Database Configuration
NEXT_PUBLIC_SUPABASE_URL=your-prod-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-key
```

## File Structure Terbaru

```
lib/
├── emailService.js          # Email service utama
├── otpUtils.js             # OTP utilities (updated)
└── supabaseClient.js       # Supabase client

pages/api/
├── send-otp-email.js       # Main OTP email endpoint
└── webhook/
    └── send-custom-otp.js  # Webhook endpoint

.env.email.example          # Email configuration template
EMAIL_OTP_CUSTOM_IMPLEMENTATION.md  # Dokumentasi ini
```

## Status Implementasi

✅ **COMPLETED:**
- Custom HTML email template dengan brand Mahraj Learning
- Nodemailer integration untuk email sending
- 3-tier fallback system (Custom → Database → LocalStorage)
- API endpoint dengan error handling lengkap
- Integration dengan existing OTP flow

🔄 **IN PROGRESS:**
- Email service configuration (perlu setup Gmail app password)
- Production deployment dengan SendGrid/AWS SES

📋 **NEXT STEPS:**
1. Setup Gmail app password untuk development testing
2. Test email delivery dengan berbagai email providers
3. Implement production email service (SendGrid recommended)
4. Add email analytics dan monitoring
5. Setup email queue processing untuk high volume

## Cara Penggunaan

1. **Setup Email Credentials** di `.env.local`
2. **Test Email Connection** menggunakan test function
3. **Activate 2FA** di DashboardSettingsTeacher
4. **Verify Email Template** diterima dengan format yang benar
5. **Enter OTP Code** untuk complete 2FA activation

Email template sekarang akan menampilkan:
- ✅ Design kustom Mahraj Learning
- ✅ Kode OTP 4 digit yang jelas
- ✅ Informasi keamanan dan expiry
- ✅ Brand consistency dengan website
- ❌ Bukan lagi template "reset password" dari Supabase
