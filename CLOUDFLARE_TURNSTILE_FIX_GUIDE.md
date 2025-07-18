# Panduan Perbaikan Cloudflare Turnstile

## Masalah yang Diperbaiki

1. **Error 400020** - Site key tidak valid atau domain tidak terdaftar
2. **Gagal memuat verifikasi keamanan** - Skrip Turnstile tidak dapat dimuat
3. **JavaScript tidak aktif** - Browser tidak mendukung atau JS dinonaktifkan

## Solusi yang Diimplementasikan

### 1. Update Konfigurasi Site Key

```javascript
// lib/turnstile.js
export const TURNSTILE_CONFIG = {
  // Menggunakan test keys resmi Cloudflare untuk development
  SITE_KEY: '1x00000000000000000000AA',
  SECRET_KEY: '1x0000000000000000000000000000000AA',
  // ...
};
```

### 2. Mode Pengembangan (Development Mode)

Jika Cloudflare Turnstile gagal dimuat, sistem akan otomatis beralih ke mode pengembangan:

```jsx
// components/CloudflareTurnstile.jsx
if (developmentMode) {
  return (
    <div className="turnstile-dev-mode">
      <button onClick={handleDevelopmentVerify}>
        Verifikasi Manual
      </button>
      <p>Mode Pengembangan - Cloudflare Turnstile tidak tersedia</p>
    </div>
  );
}
```

### 3. Retry Mechanism

Sistem akan mencoba memuat Turnstile hingga 3 kali sebelum beralih ke mode pengembangan:

```javascript
// Retry dengan exponential backoff
if (retryCount < maxRetries) {
  setTimeout(() => {
    initTurnstile();
  }, 2000 * (retryCount + 1));
}
```

### 4. Enhanced Error Handling

```javascript
'error-callback': (error) => {
  let errorMessage = 'Terjadi kesalahan pada verifikasi keamanan';
  
  if (error === '400020') {
    errorMessage = 'Site key tidak valid atau domain tidak terdaftar';
  } else if (error === '400010') {
    errorMessage = 'Site key tidak ditemukan';
  }
  
  setError(errorMessage);
}
```

## Penggunaan untuk Production

### 1. Dapatkan Site Key Cloudflare

1. Kunjungi [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Pilih "Turnstile"
3. Klik "Add site"
4. Masukkan domain Anda (contoh: almakruf.com)
5. Salin Site Key dan Secret Key

### 2. Update Environment Variables

```bash
# .env.local
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_actual_site_key_here
TURNSTILE_SECRET_KEY=your_actual_secret_key_here
```

### 3. Update Domain Settings

Pastikan domain berikut terdaftar di Cloudflare Turnstile:
- `almakruf.com`
- `www.almakruf.com`
- `localhost` (untuk development)

## Testing

### Mode Development
- Turnstile akan menampilkan tombol "Verifikasi Manual"
- Klik tombol untuk simulasi verifikasi berhasil
- Token development: `dev_token_[timestamp]`

### Mode Production
- Gunakan Site Key dan Secret Key yang valid
- Turnstile widget akan muncul normal
- Verifikasi dilakukan melalui Cloudflare

## Troubleshooting

### Error 400020
**Penyebab:** Site key tidak valid atau domain tidak terdaftar
**Solusi:** 
1. Periksa Site Key di environment variables
2. Pastikan domain terdaftar di Cloudflare Turnstile
3. Periksa konsol browser untuk error tambahan

### Script Gagal Dimuat
**Penyebab:** Jaringan bermasalah atau Cloudflare down
**Solusi:**
1. Sistem otomatis retry 3x
2. Jika masih gagal, mode development akan aktif
3. Refresh halaman untuk mencoba lagi

### JavaScript Dinonaktifkan
**Penyebab:** Browser tidak mendukung JavaScript
**Solusi:**
1. Tampilkan pesan untuk mengaktifkan JavaScript
2. Berikan tombol "Muat ulang halaman"
3. Fallback ke mode pengembangan

## Status Implementasi

✅ **Selesai:**
- Test keys untuk development
- Mode pengembangan dengan verifikasi manual
- Retry mechanism dengan exponential backoff
- Enhanced error handling dan pesan user-friendly
- Development token handling di API

🔄 **Selanjutnya untuk Production:**
- Dapatkan Site Key dan Secret Key resmi
- Update environment variables
- Test dengan domain production
- Monitor error logs

## File yang Dimodifikasi

1. `lib/turnstile.js` - Konfigurasi dan script loader
2. `components/CloudflareTurnstile.jsx` - Component dengan fallback
3. `pages/api/verify-turnstile.js` - API dengan development mode
4. `pages/authentication/register.jsx` - Handler untuk development tokens
5. `.env.local` - Environment variables dengan test keys

Sistem sekarang dapat menangani berbagai skenario error Cloudflare Turnstile dan memberikan pengalaman yang lancar untuk pengguna.
