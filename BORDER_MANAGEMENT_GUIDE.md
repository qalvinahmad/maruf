# Panduan Pengelolaan Border

## Overview
Sistem border hybrid mendukung dua jenis border:
1. **Component Borders** - Border React JSX (Metro, Classic, Neon, dll.)
2. **Database Borders** - Border dari Supabase (gambar atau referensi komponen)

## Component Borders (Otomatis Tersedia)

Border komponen JSX sudah terdaftar otomatis:

```javascript
const BORDER_REGISTRY = {
  simple: { name: 'Simple Border', component: 'Simple', premium: false },
  metro: { name: 'Metro Border', component: 'Metro', premium: false },
  classic: { name: 'Classic Border', component: 'Classic', premium: true },
  neon: { name: 'Neon Border', component: 'Neon', premium: true },
  galaxy: { name: 'Galaxy Border', component: 'Galaxy', premium: true }
};
```

## Database Borders

### Opsi 1: Referensi ke Komponen JSX
```sql
INSERT INTO shop_items (name, description, price, item_type, image, is_premium) VALUES 
('Metro Border Pack', 'Border dengan efek glitch', 100, 'border', 'component:metro', false),
('Galaxy Border Pack', 'Border bertema galaksi', 200, 'border', 'component:galaxy', true);
```

### Opsi 2: URL Gambar Custom
```sql
INSERT INTO shop_items (name, description, price, item_type, image, is_premium) VALUES 
('Custom Border 1', 'Border kustom unik', 150, 'border', 'https://your-bucket.supabase.co/storage/v1/object/public/borders/custom1.png', false);
```

### Opsi 3: Path Lokal (Development)
```sql
INSERT INTO shop_items (name, description, price, item_type, image, is_premium) VALUES 
('Local Border', 'Border dari file lokal', 50, 'border', '/images/borders/local-border.png', false);
```

## Cara Menggunakan

### 1. Border Komponen (Tidak Perlu Database)
Border komponen JSX akan otomatis muncul di pengaturan dan bisa langsung digunakan.

### 2. Border Database (Perlu Inventory)
```sql
-- Tambahkan ke shop_items
INSERT INTO shop_items (id, name, description, price, item_type, image) VALUES 
(215, 'Special Border', 'Border khusus', 300, 'border', 'component:metro');

-- Berikan ke user (tambahkan ke inventory)
INSERT INTO user_inventory (user_id, item_id, item_type, quantity, is_equipped) VALUES 
('user-uuid', 215, 'border', 1, false);
```

## Contoh Data JSON untuk Database

```json
[
  {
    "id": 215,
    "name": "Metro Glitch Border",
    "description": "Border dengan efek glitch cyberpunk",
    "price": 150,
    "item_type": "border",
    "image": "component:metro",
    "is_premium": false
  },
  {
    "id": 216,
    "name": "Galaxy Space Border", 
    "description": "Border bertema luar angkasa",
    "price": 250,
    "item_type": "border",
    "image": "component:galaxy",
    "is_premium": true
  },
  {
    "id": 218,
    "name": "Custom Image Border",
    "description": "Border dengan gambar kustom",
    "price": 200,
    "item_type": "border",
    "image": "https://your-supabase.co/storage/v1/object/public/borders/custom.png",
    "is_premium": false
  }
]
```

## Keuntungan Sistem Hybrid

1. **Performa**: Komponen JSX lebih cepat (tidak perlu load gambar)
2. **Animasi**: Komponen JSX mendukung animasi kompleks
3. **Fleksibilitas**: Bisa mix komponen dan gambar
4. **Konsistensi**: Semua border dirender dengan cara yang sama

## Tips Penggunaan

1. **Untuk border animasi**: Gunakan komponen JSX
2. **Untuk border statis**: Bisa gunakan gambar
3. **Untuk border premium**: Set `is_premium: true` di database
4. **Untuk referensi komponen**: Gunakan format `component:nama_border`

## Testing

Jalankan aplikasi untuk test:
```bash
cd /Users/alvinahmad/Downloads/nextjs-tailwindcss-navbar-main
npm run dev
```

Buka Settings → Inventori → Border Customization untuk melihat semua border.
