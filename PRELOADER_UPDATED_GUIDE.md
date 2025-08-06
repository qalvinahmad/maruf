# Updated Preloader Implementation Guide

## 🎯 Preloader Al-Makruf - Landing Page Only

Preloader yang didesain khusus untuk **tampil setiap kali halaman landing (/) dimuat**, memberikan pengalaman visual yang konsisten untuk first impression yang optimal.

## ✨ New Features & Changes

### 🎨 Visual Updates
- **Background**: Solid blue (#3B82F6) tanpa gradasi ungu
- **Logo**: Menggunakan `/public/logo.png` sebagai logo utama
- **Characters**: Menambahkan karakter anak laki-laki dan perempuan
  - Male character: `/public/male.png`
  - Female character: `/public/female.png`
- **Removed**: Bubble animations dan floating elements

### 🔧 Behavioral Changes
- **Display Logic**: Tampil setiap kali halaman landing dimuat (bukan hanya sekali)
- **Route-specific**: Hanya aktif di halaman index (`/`)
- **No localStorage**: Tidak lagi menggunakan localStorage untuk tracking

## 📁 Updated File Structure

### Modified Files
- `/components/widget/Preloader.jsx` - Visual redesign dengan characters
- `/hooks/usePreloader.js` - Logic berubah untuk landing page only
- `/components/admin/PreloaderControls.jsx` - Updated controls untuk testing
- `/pages/_app.jsx` - Integration tetap sama

## 🎨 New Visual Layout

### Character Arrangement
```
[Male Character] [Logo] [Female Character]
         Belajar Makhrojul Huruf Menyenangkan
       Platform Pembelajaran Al-Qur'an Terbaik
              [Progress Bar]
       Mempersiapkan pengalaman belajar terbaik...
```

### Character Animations
- **Entry**: Scale from 0 dengan spring animation
- **Timing**: Staggered dengan delay 0.3s
- **Size**: 20x20 (mobile) / 24x24 (desktop)
- **Position**: Flanking logo di kiri dan kanan

### Logo Integration
- **Size**: 20x20 (mobile) / 24x24 (desktop) 
- **Background**: White circle dengan shadow
- **Image**: Logo.png dengan object-contain
- **Animation**: Tetap menggunakan spring animation

## 🔧 Implementation Details

### 1. Route Detection Logic
```javascript
// hooks/usePreloader.js
useEffect(() => {
  const isLandingPage = router.pathname === '/';
  
  if (isLandingPage) {
    setShouldShowPreloader(true);
    setIsLoading(true);
  } else {
    setShouldShowPreloader(false);
    setIsLoading(false);
  }
}, [router.pathname]);
```

### 2. Character Components
```jsx
// Male Character
<motion.div variants={characterVariants}>
  <div className="w-20 h-20 md:w-24 md:h-24 relative">
    <Image
      src="/male.png"
      alt="Anak Laki-laki"
      fill
      className="object-contain"
      priority
    />
  </div>
</motion.div>

// Female Character
<motion.div variants={characterVariants}>
  <div className="w-20 h-20 md:w-24 md:h-24 relative">
    <Image
      src="/female.png"
      alt="Anak Perempuan"
      fill
      className="object-contain"
      priority
    />
  </div>
</motion.div>
```

### 3. Background Styling
```jsx
className="fixed inset-0 w-full h-screen bg-blue-600 text-white z-[9999]"
```

## 🎬 Updated Animation Sequence

### Timeline (3 seconds total)
1. **0s**: Blue background appears
2. **0.2s**: Characters section container fades in
3. **0.2s**: Male character appears (spring)
4. **0.5s**: Logo appears (spring) 
5. **0.8s**: Female character appears (spring)
6. **0.3s**: Text container starts staggered animation
7. **1.5s**: Subtitle fades in
8. **1s**: Progress bar container appears
9. **1.8s**: Loading text appears
10. **3s**: Exit slide up animation

### Character Animation Details
```javascript
const characterVariants = {
  hidden: { 
    scale: 0,
    opacity: 0,
    y: 50
  },
  visible: { 
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      type: "spring",
      stiffness: 120
    }
  }
};
```

## 🔄 New Behavior Logic

### Landing Page Detection
- **Active on**: `router.pathname === '/'`
- **Inactive on**: Semua halaman lain
- **Triggers**: Setiap navigasi ke landing page
- **Duration**: 3 detik setiap kali tampil

### No localStorage Dependency
- Tidak ada tracking via localStorage
- Fresh preloader setiap visit ke landing
- Konsisten experience untuk semua user

## 📱 Responsive Layout

### Mobile (< 768px)
- Characters: 20x20 (w-20 h-20)
- Logo: 20x20 with 48x48 image
- Gap: 8 spacing (gap-8)
- Text: 2xl size

### Desktop (>= 768px)  
- Characters: 24x24 (md:w-24 md:h-24)
- Logo: 24x24 with 60x60 image
- Gap: 8 spacing maintained
- Text: 4xl size (lg:text-4xl)

## 🎯 Usage Scenarios

### When Preloader Shows
1. **Direct URL**: User types `/` di browser
2. **Navigation**: User clicks link ke homepage
3. **Refresh**: User refresh halaman landing
4. **Bookmark**: User access homepage via bookmark
5. **External Link**: User clicks link dari website lain ke landing

### When Preloader Doesn't Show
1. **Internal Navigation**: Navigate dari landing ke halaman lain
2. **Other Pages**: Akses langsung ke `/dashboard`, `/login`, etc.
3. **API Routes**: Backend requests tidak memicu preloader

## 🛠️ Admin Controls Update

### New PreloaderControls Features
- **Route Display**: Shows current pathname
- **Landing Redirect**: Button to visit landing page
- **Real-time Status**: Current route information
- **No Reset Needed**: Logic otomatis based on route

### Usage in Admin
```jsx
import PreloaderControls from '../../components/admin/PreloaderControls';

// In admin dashboard
<PreloaderControls />
```

## 🎨 Asset Requirements

### Required Image Files
- `/public/logo.png` - Main logo untuk center position
- `/public/male.png` - Male character illustration
- `/public/female.png` - Female character illustration

### Image Specifications
- **Format**: PNG dengan transparent background
- **Size**: Optimal 200x200px atau lebih
- **Style**: Consistent art style untuk semua characters
- **Colors**: Sesuai dengan brand Al-Makruf

## 📊 Performance Impact

### Bundle Size
- **Next.js Image**: Already included
- **Character Images**: ~50KB total (estimated)
- **Animation Logic**: Minimal impact
- **Route Detection**: Router already imported

### Loading Performance
- **Priority Loading**: All preloader images marked priority
- **Object-contain**: Prevents layout shift
- **Optimized Animations**: Hardware accelerated transforms
- **Clean Exit**: Proper component unmounting

## 🔧 Customization Options

### Duration Adjustment
```javascript
// Change di Preloader.jsx useEffect
setTimeout(() => {
  setLoading(false);
}, 4000); // 4 seconds instead of 3
```

### Character Size Adjustment
```jsx
// Adjust character container size
className="w-24 h-24 md:w-28 md:h-28 relative"
```

### Background Color Variants
```jsx
// Different blue shades
className="bg-blue-500"  // Lighter
className="bg-blue-700"  // Darker
className="bg-blue-800"  // Much darker
```

## 🐛 Troubleshooting

### Common Issues

1. **Images Not Loading**
   - Verify files exist di `/public/` folder
   - Check file names match exactly
   - Ensure proper file permissions

2. **Preloader Not Showing**
   - Confirm you're on landing page (`/`)
   - Check router.pathname in console
   - Verify _app.jsx integration

3. **Characters Not Animating**
   - Check Framer Motion installation
   - Verify characterVariants implementation
   - Console for animation errors

### Debug Commands
```javascript
// Check current route
console.log('Current route:', router.pathname);

// Check preloader state
console.log('Should show:', shouldShowPreloader, 'Is loading:', isLoading);
```

## 🚀 Future Enhancements

### Planned Improvements
1. **Dynamic Characters**: Different characters based on time/season
2. **Sound Effects**: Optional audio feedback
3. **Interactive Elements**: Clickable characters untuk early interaction
4. **Loading Progress**: Real content loading progress integration
5. **Accessibility**: Enhanced screen reader support

### Advanced Features
1. **A/B Testing**: Different preloader variants
2. **Analytics Integration**: Track preloader completion rates
3. **Personalization**: User-specific character preferences
4. **Micro-interactions**: Hover effects pada characters

---

**Status**: ✅ **Updated & Production Ready**
**Key Changes**: Landing page only, solid blue background, character integration, logo update
**Performance**: Optimized untuk fast loading dan smooth animations
**Compatibility**: Works di semua modern browsers dan devices
