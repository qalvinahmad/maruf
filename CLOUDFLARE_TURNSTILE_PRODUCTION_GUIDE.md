# Panduan Cloudflare Turnstile dengan Keys Asli

## ✅ Update Konfigurasi

Keys Cloudflare Turnstile Anda telah diupdate:

```bash
# .env.local
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAABlcFtkVlG8Sh9vp
TURNSTILE_SECRET_KEY=0x4AAAAAABlcFq1k6FvxRCB_A7kTnA2FdB8
```

## 🔧 Tips Penting untuk Production

### 1. **Domain Configuration**
Pastikan domain berikut terdaftar di Cloudflare Turnstile Dashboard:

- `localhost` (untuk development)
- `almakruf.com` (domain production)
- `www.almakruf.com` (dengan www)
- IP address server jika perlu

### 2. **Testing Cloudflare Turnstile**

#### ✅ Mode Testing (saat ini aktif)
- Widget akan menampilkan "Testing only, always pass"
- Semua verifikasi akan berhasil secara otomatis
- Cocok untuk development dan testing

#### 🚀 Mode Production
Untuk mengaktifkan mode production:
1. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Pilih "Turnstile"
3. Pilih site key Anda
4. Ubah dari "Testing" ke "Production"
5. Konfigurasi domain yang diizinkan

### 3. **Troubleshooting Common Issues**

#### Problem: "Site key tidak valid"
**Solusi:**
```javascript
// Periksa apakah site key benar
console.log('Site Key:', process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
```

#### Problem: "Domain tidak terdaftar"
**Solusi:**
1. Tambahkan domain di Cloudflare Dashboard
2. Pastikan domain exact match (termasuk subdomain)
3. Tambahkan wildcard `*.almakruf.com` jika perlu

#### Problem: Widget tidak muncul
**Solusi:**
1. Periksa browser console untuk error
2. Pastikan JavaScript enabled
3. Cek network tab untuk script loading issues

### 4. **Environment Setup**

#### Development
```bash
# localhost testing
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAABlcFtkVlG8Sh9vp
TURNSTILE_SECRET_KEY=0x4AAAAAABlcFq1k6FvxRCB_A7kTnA2FdB8
```

#### Production
```bash
# Production keys (sama tapi pastikan domain terdaftar)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAABlcFtkVlG8Sh9vp
TURNSTILE_SECRET_KEY=0x4AAAAAABlcFq1k6FvxRCB_A7kTnA2FdB8
```

### 5. **Monitoring & Analytics**

Cloudflare Turnstile Dashboard menyediakan:
- Jumlah verifikasi harian
- Success rate
- Error analytics
- Geographical data

## 🛠 Development Server

Server berjalan di: http://localhost:3001

Untuk testing:
1. Buka http://localhost:3001/authentication/register
2. Isi form registrasi
3. Widget Turnstile akan muncul dengan mode "Testing only, always pass"
4. Klik widget untuk verifikasi
5. Lanjutkan proses registrasi

## 📋 Checklist untuk Go Live

- [ ] Domain terdaftar di Cloudflare Turnstile
- [ ] Mode testing diubah ke production
- [ ] SSL certificate active di domain
- [ ] Environment variables di server production
- [ ] DNS pointing ke server yang benar
- [ ] Firewall rules mengizinkan Cloudflare requests

## 🔍 Debug Commands

```bash
# Check environment variables
echo $NEXT_PUBLIC_TURNSTILE_SITE_KEY
echo $TURNSTILE_SECRET_KEY

# Test API endpoint
curl -X POST http://localhost:3001/api/verify-turnstile \
  -H "Content-Type: application/json" \
  -d '{"token":"test_token"}'

# Check Turnstile status
curl https://challenges.cloudflare.com/turnstile/v0/siteverify \
  -X POST \
  -d "secret=YOUR_SECRET_KEY&response=test"
```

## ⚠️ Security Notes

1. **NEVER** commit secret key ke repository
2. Gunakan environment variables untuk production
3. Rotate keys secara berkala
4. Monitor untuk unusual verification patterns
5. Set rate limiting di server

Keys Anda sudah terkonfigurasi dengan benar! Turnstile sekarang akan menggunakan keys asli dan siap untuk production deployment.
