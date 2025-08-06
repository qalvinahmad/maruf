# Setup Email Template untuk OTP 2FA di Supabase

## 1. Konfigurasi Template Email di Supabase Dashboard

### Langkah 1: Akses Email Templates
1. Buka Supabase Dashboard
2. Pilih project Anda
3. Navigate ke **Authentication** > **Email Templates**

### Langkah 2: Edit Template "Reauthentication"
1. Pilih template **"Reauthentication"**
2. Ganti HTML template dengan konten yang sudah Anda miliki
3. Pastikan menggunakan variabel `{{ .Token }}` untuk OTP code

### Langkah 3: Deploy Edge Function (Opsional)
```bash
# Install Supabase CLI jika belum ada
npm install -g supabase

# Login ke Supabase
supabase login

# Deploy Edge Function
supabase functions deploy send-otp-email
```

## 2. Konfigurasi Environment Variables

Tambahkan di file `.env.local`:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3001
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 3. Alternative Setup Tanpa Edge Function

Jika Edge Function tidak tersedia, sistem akan menggunakan:

### Method 1: API Route (`/api/send-otp-email`)
- Sudah dibuat di `pages/api/send-otp-email.js`
- Menggunakan Supabase Admin client

### Method 2: Password Recovery Template
- Menggunakan `supabase.auth.resetPasswordForEmail()`
- Akan menggunakan template recovery yang bisa dimodifikasi

### Method 3: Fallback localStorage
- OTP disimpan di localStorage jika database tidak tersedia
- Untuk development dan testing

## 4. Testing

1. **Dengan Email Template:**
   - OTP akan dikirim ke email menggunakan template HTML yang indah
   - User akan mendapat email dengan kode 4 digit

2. **Tanpa Email (Fallback):**
   - OTP akan ditampilkan di console browser
   - Toast akan menunjukkan "Email gagal dikirim, OTP untuk testing: 1234"

## 5. Template Email Variables

Template HTML Anda sudah menggunakan `{{ .Token }}` yang benar untuk Supabase.

Variabel yang tersedia:
- `{{ .Token }}` - Kode OTP 4 digit
- `{{ .SiteURL }}` - URL website
- `{{ .Email }}` - Email penerima

## 6. Troubleshooting

### Jika Email Tidak Terkirim:
1. Cek SMTP settings di Supabase
2. Verify domain email sender
3. Cek spam folder
4. Pastikan template sudah di-save

### Jika OTP Tidak Valid:
1. Cek expiry time (10 menit)
2. Pastikan tabel `otp_codes` exists
3. Cek localStorage fallback

## 7. Production Setup

Untuk production:
1. Setup custom SMTP di Supabase
2. Verify domain sender
3. Deploy Edge Function
4. Set proper environment variables
5. Remove OTP code dari response (security)

## 8. SQL untuk membuat tabel OTP

Jalankan di Supabase SQL Editor:
```sql
-- Sudah tersedia di file create_otp_table.sql
```

## 9. Monitoring

- Check Supabase Logs untuk email sending
- Monitor Edge Function logs
- Check browser console untuk debugging
