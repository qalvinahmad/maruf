# Streak Dialog Implementation - DashboardHuruf

## Fitur yang Diimplementasikan

### 1. Streak Dialog Otomatis
- Dialog streak muncul otomatis ketika user login di hari itu
- Hanya muncul sekali per 24 jam
- Menggunakan localStorage untuk tracking

### 2. Streak Management
- Streak direset menjadi 0 jika user tidak login lebih dari 24 jam
- Streak bertambah 1 jika user login berturut-turut setiap hari
- Login logs dicatat di tabel `login_logs`

### 3. localStorage Keys
- `streakDialogShown`: Tanggal terakhir dialog ditampilkan (format: Date.toDateString())
- `streakDialogShownTimestamp`: Timestamp terakhir dialog ditampilkan (format: milliseconds)
- `lastLoginDate`: Tanggal terakhir user login (format: ISO string)

## Cara Kerja

### 1. Saat User Login/Load Dashboard:
1. Check apakah user sudah login hari ini di tabel `login_logs`
2. Jika belum, insert login log baru dan update streak
3. Jika sudah, tidak melakukan apa-apa
4. Check apakah dialog sudah ditampilkan hari ini
5. Jika belum dan user memiliki streak > 0, tampilkan dialog

### 2. Reset Streak:
- Jika selisih waktu login terakhir > 24 jam, streak direset ke 0
- Dialog tidak ditampilkan jika streak = 0

### 3. Dialog Tracking:
- Dialog hanya muncul sekali per 24 jam
- Menggunakan kombinasi tanggal string dan timestamp untuk akurasi

## Cara Testing

### 1. Testing Dialog Manual:
```javascript
// Buka browser console di halaman DashboardHuruf
// Jalankan command berikut untuk memaksa tampilkan dialog:
testStreakDialog()
```

### 2. Testing Reset Cache:
```javascript
// Hapus semua data localStorage streak
localStorage.removeItem('streakDialogShown');
localStorage.removeItem('streakDialogShownTimestamp');
localStorage.removeItem('lastLoginDate');

// Refresh halaman untuk melihat dialog muncul lagi
location.reload();
```

### 3. Testing Streak Reset:
```javascript
// Set login terakhir ke lebih dari 24 jam yang lalu
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 2); // 2 hari lalu
localStorage.setItem('lastLoginDate', yesterday.toISOString());

// Refresh halaman, streak akan direset ke 0
location.reload();
```

## Database Tables

### login_logs
```sql
CREATE TABLE login_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### profiles (streak field)
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
```

## Components

### StreakDialogHuruf.jsx
- Dialog component dengan animasi Framer Motion
- Menggunakan BlurText untuk animasi teks
- Font Poppins untuk konsistensi
- Design gradient orange-red untuk tema streak

### DashboardHuruf.jsx
- Logic utama untuk streak management
- Integration dengan Supabase database
- localStorage tracking system
- Error handling dan fallbacks

## Tips Development

1. **Testing**: Gunakan `testStreakDialog()` di console untuk testing cepat
2. **Reset**: Hapus localStorage keys untuk reset testing state
3. **Database**: Pastikan tabel `login_logs` sudah dibuat
4. **Performance**: Dialog hanya dimuat secara dynamic untuk optimize loading
5. **UX**: Dialog muncul dengan delay 1-2 detik untuk memberikan waktu loading data

## Error Handling

- Semua database operations memiliki try-catch
- Error tidak mengganggu user experience
- Fallback graceful jika data tidak tersedia
- Console logging untuk debugging

## Security

- Hanya user yang login yang bisa akses
- User ID validation dari context
- SQL injection protection via Supabase
- localStorage hanya menyimpan metadata, bukan data sensitif
