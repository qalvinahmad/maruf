// Google Analytics and Tag Manager utilities
export const GA_TRACKING_ID = 'G-XXXXXXXXXX'; // Replace with your GA4 ID
export const GTM_ID = 'GTM-XXXXXXX'; // Replace with your GTM ID

// Track page views
export const pageview = (url) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_location: url,
    });
  }
};

// Track events
export const event = ({ action, category, label, value }) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track custom events for Qur'an learning
export const trackQuranEvent = (eventName, data = {}) => {
  event({
    action: eventName,
    category: 'Quran Learning',
    label: data.lesson || 'general',
    value: data.progress || 0,
  });
};

// Track user interactions
export const trackUserInteraction = (type, element) => {
  event({
    action: 'user_interaction',
    category: 'UI',
    label: `${type}_${element}`,
  });
};

// Initialize Facebook Pixel
export const initFacebookPixel = () => {
  if (typeof window !== 'undefined') {
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    
    fbq('init', 'YOUR_PIXEL_ID'); // Replace with your pixel ID
    fbq('track', 'PageView');
  }
};

// Track conversions for Qur'an course sign-ups
export const trackConversion = (type, value = 0) => {
  if (typeof window !== 'undefined') {
    // Google Analytics conversion
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: 'AW-XXXXXXXXX/XXXXXXXXX', // Replace with your conversion ID
        value: value,
        currency: 'IDR',
      });
    }
    
    // Facebook Pixel conversion
    if (window.fbq) {
      window.fbq('track', 'CompleteRegistration', {
        content_name: 'Qur\'an Course Registration',
        content_category: 'Education',
        value: value,
        currency: 'IDR'
      });
    }
  }
};
