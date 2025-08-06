# Preloader Implementation Guide

## 🎯 Preloader Al-Makruf - Tampil Hanya Sekali

Implementasi preloader yang elegan dan modern untuk platform Al-Makruf yang **hanya tampil sekali** saat pertama kali user mengunjungi website.

## ✨ Features Implementasi

### 🎨 Visual Design
- **Gradient Background**: Blue to purple gradient yang matching dengan brand
- **Animated Logo**: Logo Arabic dengan animasi spring yang smooth
- **Staggered Text Animation**: Teks "Belajar Makhrojul Huruf Menyenangkan" dengan delay animation
- **Progress Bar**: Animated progress bar dengan gradient colors
- **Floating Elements**: Decorative floating particles untuk visual appeal
- **Background Patterns**: Subtle animated circles untuk depth

### 🔧 Technical Features
- **Single Display**: Preloader hanya tampil sekali menggunakan localStorage
- **Tailwind CSS**: 100% menggunakan Tailwind, tanpa CSS terpisah
- **Framer Motion**: Smooth animations dan transitions
- **Responsive Design**: Optimal di semua device sizes
- **Performance Optimized**: Minimal bundle size dan fast loading

### 📱 Responsive Behavior
- **Mobile**: Stack layout dengan smaller text size
- **Tablet**: Balanced layout dengan medium spacing
- **Desktop**: Full horizontal layout dengan large text

## 📁 File Structure

### Core Files
- `/components/widget/Preloader.jsx` - Main preloader component
- `/hooks/usePreloader.js` - Custom hook untuk preloader logic
- `/pages/_app.jsx` - Integration dengan app lifecycle
- `/components/admin/PreloaderControls.jsx` - Admin controls untuk testing

## 🎬 Animation Sequence

### Timeline (3 seconds total)
1. **0s**: Background dan patterns fade in
2. **0.3s**: Logo appears dengan spring animation
3. **0.7s**: Text words stagger in dengan 0.4s delay each
4. **1s**: Progress bar starts animating
5. **1.5s**: Subtitle fades in
6. **1.8s**: Loading text appears
7. **3s**: Exit animation (slide up)

### Animation Details
```javascript
// Logo Animation
logoVariants: {
  hidden: { scale: 0, opacity: 0, rotate: -180 },
  visible: { 
    scale: 1, 
    opacity: 1, 
    rotate: 0,
    transition: { duration: 0.8, type: "spring" }
  }
}

// Text Stagger
containerVariants: {
  visible: {
    transition: {
      staggerChildren: 0.4,
      delayChildren: 0.3
    }
  }
}

// Exit Animation
preloaderVariants: {
  exit: {
    y: "-100%",
    transition: { duration: 0.8, ease: "easeInOut" }
  }
}
```

## 🔧 Implementation Code

### 1. Preloader Component
```jsx
// /components/widget/Preloader.jsx
import { motion } from 'framer-motion';
import React, { useEffect } from 'react';

const PreLoader = ({ setLoading }) => {
  // Auto-hide after 3 seconds and set localStorage flag
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
      localStorage.setItem('preloader_shown', 'true');
    }, 3000);
    return () => clearTimeout(timeout);
  }, [setLoading]);

  // Animation variants and JSX...
};
```

### 2. Custom Hook
```javascript
// /hooks/usePreloader.js
import { useEffect, useState } from 'react';

const usePreloader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [shouldShowPreloader, setShouldShowPreloader] = useState(false);

  useEffect(() => {
    const preloaderShown = localStorage.getItem('preloader_shown');
    if (!preloaderShown) {
      setShouldShowPreloader(true);
    } else {
      setIsLoading(false);
      setShouldShowPreloader(false);
    }
  }, []);

  // Return state and handlers...
};
```

### 3. App Integration
```jsx
// /pages/_app.jsx
import { AnimatePresence } from 'framer-motion';
import PreLoader from '../components/widget/Preloader';
import usePreloader from '../hooks/usePreloader';

function MyApp({ Component, pageProps }) {
  const { isLoading, shouldShowPreloader, setLoading } = usePreloader();

  return (
    <>
      <AnimatePresence mode="wait">
        {shouldShowPreloader && isLoading && (
          <PreLoader key="preloader" setLoading={setLoading} />
        )}
      </AnimatePresence>

      {(!shouldShowPreloader || !isLoading) && (
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      )}
    </>
  );
}
```

## 🎨 Tailwind Classes Used

### Layout & Positioning
```css
fixed inset-0 w-full h-screen z-[9999]
flex flex-col justify-center items-center
```

### Background & Colors
```css
bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600
text-white
```

### Responsive Typography
```css
text-2xl md:text-3xl lg:text-4xl font-extrabold
text-lg md:text-xl text-blue-100 font-medium
```

### Animations
```css
animate-pulse animate-bounce animate-ping
delay-500 delay-1000 delay-2000
```

### Custom Styling
```css
style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.3)' }}
```

## 🔄 Lifecycle Management

### First Visit Flow
1. User visits website for first time
2. `localStorage.getItem('preloader_shown')` returns `null`
3. `shouldShowPreloader` set to `true`
4. Preloader displays for 3 seconds
5. After completion: `localStorage.setItem('preloader_shown', 'true')`
6. Main app loads

### Subsequent Visits
1. User returns to website
2. `localStorage.getItem('preloader_shown')` returns `'true'`
3. `shouldShowPreloader` set to `false`
4. Main app loads immediately (no preloader)

### Testing & Reset
```javascript
// Reset preloader untuk testing
const resetPreloader = () => {
  localStorage.removeItem('preloader_shown');
  setIsLoading(true);
  setShouldShowPreloader(true);
};
```

## 🎛️ Admin Controls

### PreloaderControls Component
- Located di `/components/admin/PreloaderControls.jsx`
- Dapat digunakan di admin dashboard untuk testing
- Provides reset functionality dengan confirmation
- Shows current preloader status

### Usage in Admin Panel
```jsx
import PreloaderControls from '../../components/admin/PreloaderControls';

// In admin dashboard
<PreloaderControls />
```

## 📊 Performance Considerations

### Bundle Size Impact
- **Framer Motion**: ~30KB (already used di project)
- **Component**: ~2KB additional
- **Hook**: ~1KB additional
- **Total Addition**: ~3KB

### Loading Performance
- Preloader renders immediately (no async loading)
- Uses system fonts until custom fonts load
- Optimized animations untuk 60fps
- No external dependencies

### Memory Usage
- Single localStorage item
- Cleanup semua timeouts
- No memory leaks dengan proper useEffect cleanup

## 🔧 Customization Options

### Duration Adjustment
```javascript
// Change duration di useEffect
setTimeout(() => {
  setLoading(false);
  localStorage.setItem('preloader_shown', 'true');
}, 5000); // 5 seconds instead of 3
```

### Brand Customization
```jsx
// Logo/Icon customization
<div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
  <img src="/logo.png" alt="Logo" className="w-16 h-16" />
</div>

// Text customization
<motion.span>Your Custom Text</motion.span>

// Color scheme
className="bg-gradient-to-br from-purple-500 to-pink-600"
```

### Animation Speed
```javascript
// Faster animations
transition: { duration: 0.4, ease: "easeOut" }

// Slower animations  
transition: { duration: 1.2, ease: "easeOut" }
```

## 🐛 Troubleshooting

### Common Issues

1. **Preloader not showing**
   - Check `localStorage.getItem('preloader_shown')`
   - Reset dengan `localStorage.removeItem('preloader_shown')`

2. **Animation choppy**
   - Check for conflicting CSS animations
   - Verify hardware acceleration enabled

3. **Not responsive**
   - Verify Tailwind responsive classes
   - Check viewport meta tag

### Debug Tools
```javascript
// Debug localStorage
console.log('Preloader shown:', localStorage.getItem('preloader_shown'));

// Debug component state
console.log('Should show:', shouldShowPreloader, 'Is loading:', isLoading);
```

## 🚀 Future Enhancements

### Planned Features
1. **Custom Duration**: User-configurable preloader duration
2. **Theme Support**: Dark/light theme variants
3. **Multi-language**: Support untuk berbagai bahasa
4. **Analytics**: Track preloader completion rates
5. **A/B Testing**: Different preloader variants

### Advanced Customization
1. **Dynamic Content**: Load content based on user preferences
2. **Progressive Loading**: Show app progress during preloader
3. **Interactive Elements**: Clickable elements in preloader
4. **Sound Effects**: Optional audio feedback

---

**Status**: ✅ **Fully Implemented & Production Ready**
**Performance**: Optimized untuk fast loading dan smooth animations
**Compatibility**: Works di semua modern browsers dan devices
**Maintenance**: Minimal maintenance required, self-contained system
