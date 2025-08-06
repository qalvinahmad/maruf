# SETUP GMAIL APP PASSWORD - SOLUSI CEPAT

## Status Saat Ini:
✅ API endpoint sudah diperbaiki
✅ Button verification tidak akan terjebak lagi  
✅ OTP code akan ditampilkan di UI untuk testing
❌ Email sending masih perlu setup Gmail credentials

## Cara Setup Gmail App Password (5 menit):

### Step 1: Aktifkan 2-Factor Authentication
1. Buka https://myaccount.google.com/security
2. Pilih "2-Step Verification" 
3. Ikuti langkah-langkah untuk mengaktifkan 2FA

### Step 2: Generate App Password
1. Masih di halaman Security, cari "App passwords"
2. Klik "Generate app password"
3. Pilih "Mail" sebagai aplikasi
4. Copy 16-character password yang dihasilkan

### Step 3: Setup Environment Variables
1. Buat file `.env.local` di root project
2. Tambahkan konfigurasi berikut:

```env
# Gmail Configuration
EMAIL_USER=111202013071@mhs.dinus.ac.id
EMAIL_PASS=your-16-character-app-password

# Existing Supabase config (jangan ubah)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 4: Restart Next.js Server
```bash
# Stop server: Ctrl+C
npm run dev
```

## Testing Sementara:

Saat ini sistem sudah bisa digunakan untuk testing 2FA:

1. ✅ Klik "Aktifkan 2FA" - button tidak akan hang lagi
2. ✅ OTP code akan muncul di toast notification
3. ✅ Masukkan code tersebut untuk complete 2FA
4. ✅ 2FA akan berhasil diaktifkan

## Expected Behavior:

**SEBELUM setup Gmail:**
- Toast: "OTP Code: 1234 (Email service sedang diperbaiki)"
- Gunakan code tersebut untuk verification

**SESUDAH setup Gmail:**  
- Toast: "OTP berhasil dikirim ke email Anda!"
- Check email 111202013071@mhs.dinus.ac.id untuk OTP code
- Email akan menggunakan template Mahraj Learning yang kustom

## Quick Test Command:
```bash
# Test API endpoint
node quick-test-api.js

# Expected result: OTP code displayed in response
```

**Sistem sekarang sudah berfungsi untuk testing 2FA, email sending tinggal setup Gmail credentials!** 🎊
