import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import FaqSection from '../components/FaqSection';
import FeatureInteractive from '../components/FeatureInteractive';
import Footer from '../components/Footer';
import RegistrationSection from '../components/RegistrationSection';
import TestimonialSection from '../components/TestimonialSection';
import { MobileNav, MobileNavHeader, MobileNavMenu, MobileNavToggle, Navbar, NavbarButton, NavbarLogo, NavBody, NavItems } from '../components/ui/resizable-navbar';
import { SmoothScrollHero } from '../components/ui/smooth';
import LevelCarousel from '../components/widget/carousel';
import Features from '../components/widget/features';
import { pageCache, rateLimiter } from '../lib/redis';
import { supabase } from '../lib/supabaseClient';
import { ScrollProgress } from '../src/components/magicui/scroll-progress';

export default function Home({ 
  testimonials, 
  faqData, 
  courseLevels, 
  cached = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const navItems = [
    { name: "Beranda", link: "#" },
    { name: "Fitur", link: "#features" },
    { name: "Tingkatan", link: "#levels" },
    { name: "Testimoni", link: "#testimonials" },
    { name: "FAQ", link: "#faq" },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-background font-poppins min-h-screen">
      <Head>
        {/* Primary Meta Tags */}
        <title>Al-Makruf - Platform Belajar Al-Qur'an & Makhrajul Huruf Online Terbaik</title>
        <meta name="title" content="Al-Makruf - Platform Belajar Al-Qur'an & Makhrajul Huruf Online Terbaik" />
        <meta name="description" content="Belajar Al-Qur'an dan Makhrajul Huruf dengan mudah dan menyenangkan di almakruf.com. Platform pembelajaran interaktif dengan metode modern, guru berpengalaman, dan sertifikat resmi." />
        <meta name="keywords" content="belajar quran online, makhrajul huruf, tajwid, mengaji online, les quran, kursus quran, belajar mengaji, tahfidz quran, tilawah quran, ilmu tajwid" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="Indonesian" />
        <meta name="author" content="Al-Makruf Education" />
        <meta name="copyright" content="Al-Makruf Education 2025" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://almakruf.com" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://almakruf.com" />
        <meta property="og:title" content="Al-Makruf - Platform Belajar Al-Qur'an & Makhrajul Huruf Online Terbaik" />
        <meta property="og:description" content="Belajar Al-Qur'an dan Makhrajul Huruf dengan mudah dan menyenangkan. Platform pembelajaran interaktif dengan metode modern dan guru berpengalaman." />
        <meta property="og:image" content="https://almakruf.com/images/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="id_ID" />
        <meta property="og:site_name" content="Al-Makruf" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://almakruf.com" />
        <meta property="twitter:title" content="Al-Makruf - Platform Belajar Al-Qur'an & Makhrajul Huruf Online Terbaik" />
        <meta property="twitter:description" content="Belajar Al-Qur'an dan Makhrajul Huruf dengan mudah dan menyenangkan. Platform pembelajaran interaktif dengan metode modern dan guru berpengalaman." />
        <meta property="twitter:image" content="https://almakruf.com/images/twitter-card.jpg" />
        <meta property="twitter:creator" content="@almakruf" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#2563eb" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="geo.region" content="ID" />
        <meta name="geo.country" content="Indonesia" />
        <meta name="geo.placename" content="Indonesia" />
        
        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        
        {/* Font optimization */}
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" rel="stylesheet" />
        
        {/* Structured Data for SEO - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "Al-Makruf",
              "alternateName": "Platform Belajar Al-Qur'an Al-Makruf",
              "url": "https://almakruf.com",
              "logo": "https://almakruf.com/logo.png",
              "description": "Platform pembelajaran Al-Qur'an dan Makhrajul Huruf online dengan metode interaktif dan guru berpengalaman",
              "foundingDate": "2024",
              "sameAs": [
                "https://www.instagram.com/almakruf",
                "https://www.facebook.com/almakruf",
                "https://www.youtube.com/@almakruf"
              ],
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "ID",
                "addressRegion": "Indonesia"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer support",
                "availableLanguage": "Indonesian"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+62-XXX-XXXX-XXXX",
                "contactType": "customer service",
                "availableLanguage": "Indonesian"
              },
              "sameAs": [
                "https://facebook.com/almakruf",
                "https://instagram.com/almakruf",
                "https://youtube.com/almakruf"
              ],
              "offers": {
                "@type": "Offer",
                "name": "Kursus Al-Qur'an Online",
                "description": "Pembelajaran Al-Qur'an dan Makhrajul Huruf dengan metode interaktif",
                "category": "Education"
              }
            })
          }}
        />
        
        {/* Course/Product Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Course",
              "name": "Kursus Al-Qur'an dan Makhrajul Huruf",
              "description": "Belajar Al-Qur'an dan Makhrajul Huruf dengan metode interaktif dan guru berpengalaman",
              "provider": {
                "@type": "Organization",
                "name": "Al-Makruf",
                "url": "https://almakruf.com"
              },
              "courseMode": "online",
              "educationalLevel": "beginner",
              "teaches": [
                "Makhrajul Huruf",
                "Tajwid Al-Qur'an",
                "Tilawah Al-Qur'an",
                "Ilmu Qiraat"
              ],
              "availableLanguage": "id",
              "isAccessibleForFree": true,
              "hasCourseInstance": {
                "@type": "CourseInstance",
                "courseMode": "online",
                "courseWorkload": "PT2H"
              }
            })
          }}
        />
        
        {/* Website Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Al-Makruf",
              "url": "https://almakruf.com",
              "description": "Platform pembelajaran Al-Qur'an dan Makhrajul Huruf online terbaik di Indonesia",
              "inLanguage": "id-ID",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://almakruf.com/search?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Al-Makruf Education"
              }
            })
          }}
        />
        
        {/* Google Analytics 4 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXXXX', {
                page_title: 'Al-Makruf - Homepage',
                page_location: 'https://almakruf.com',
                custom_map: {'custom_parameter': 'quran_learning'}
              });
            `
          }}
        />
        
        {/* Google Search Console Verification */}
        <meta name="google-site-verification" content="your-google-search-console-verification-code" />
        
        {/* Add cache indicator for development */}
        {process.env.NODE_ENV === 'development' && (
          <meta name="cache-status" content={cached ? 'hit' : 'miss'} />
        )}
      </Head>

      <main>
        {/* Cache status indicator for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className={`fixed top-0 right-0 z-50 px-3 py-1 text-xs font-mono ${
            cached ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            Redis Cache: {cached ? 'HIT' : 'MISS'}
          </div>
        )}

        <ScrollProgress className="z-9990" />

        <Navbar>
          <NavBody>
            <NavbarLogo />
            <NavItems items={navItems} />
            <NavbarButton href="/authentication/register">Daftar Gratis</NavbarButton>
          </NavBody>

          <MobileNav>
            <MobileNavHeader>
              <NavbarLogo />
              <MobileNavToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
            </MobileNavHeader>
            <MobileNavMenu isOpen={isOpen}>
              {navItems.map((item, idx) => (
                <Link 
                  key={idx} 
                  href={item.link}
                  className="w-full px-4 py-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 font-poppins"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <NavbarButton href="/authentication/login">Login</NavbarButton>
            </MobileNavMenu>
          </MobileNav>
        </Navbar>

        <SmoothScrollHero />
        <Features />
        <FeatureInteractive />
        <LevelCarousel levels={courseLevels} />
        <TestimonialSection testimonials={testimonials} />
        <FaqSection faqData={faqData} />
        <RegistrationSection />
        <Footer />

     
      </main>
    </div>
  );
}

export async function getServerSideProps({ req }) {
  // Get client IP for rate limiting
  const clientIP = req.headers['x-forwarded-for'] || 
                   req.headers['x-real-ip'] || 
                   req.connection.remoteAddress || 
                   'unknown';

  try {
    // Check rate limit (100 requests per hour per IP)
    const rateLimit = await rateLimiter.checkRateLimit(`homepage:${clientIP}`, 100, 3600);
    
    if (!rateLimit.allowed) {
      return {
        props: {
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        }
      };
    }

    let testimonials = null;
    let faqData = null;
    let courseLevels = null;
    let cached = false;

    // Try to get data from Redis cache first
    console.log('Checking Redis cache for homepage data...');
    
    const [cachedTestimonials, cachedFAQ, cachedLevels] = await Promise.all([
      pageCache.getTestimonials(),
      pageCache.getFAQ(),
      pageCache.getCourseLevels()
    ]);

    if (cachedTestimonials && cachedFAQ && cachedLevels) {
      console.log('Using cached homepage data from Redis');
      testimonials = cachedTestimonials;
      faqData = cachedFAQ;
      courseLevels = cachedLevels;
      cached = true;
    } else {
      console.log('Cache miss, fetching fresh data from database...');
      
      // Fetch fresh data from Supabase
      const [testimonialsResult, faqResult, levelsResult] = await Promise.all([
        // Fetch testimonials
        supabase
          .from('testimonials')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(6),
        
        // Fetch FAQ
        supabase
          .from('faq')
          .select('*')
          .eq('is_active', true)
          .order('order_sequence', { ascending: true }),
        
        // Fetch course levels
        supabase
          .from('roadmap_levels')
          .select('*')
          .order('order_sequence', { ascending: true })
      ]);

      // Handle testimonials
      if (testimonialsResult.error) {
        console.error('Error fetching testimonials:', testimonialsResult.error);
        testimonials = [];
      } else {
        testimonials = testimonialsResult.data || [];
        await pageCache.setTestimonials(testimonials, 3600); // Cache for 1 hour
      }

      // Handle FAQ
      if (faqResult.error) {
        console.error('Error fetching FAQ:', faqResult.error);
        faqData = [];
      } else {
        faqData = faqResult.data || [];
        await pageCache.setFAQ(faqData, 7200); // Cache for 2 hours
      }

      // Handle course levels
      if (levelsResult.error) {
        console.error('Error fetching course levels:', levelsResult.error);
        courseLevels = [];
      } else {
        courseLevels = levelsResult.data || [];
        await pageCache.setCourseLevels(courseLevels, 3600); // Cache for 1 hour
      }

      console.log('Fresh data fetched and cached');
    }

    return {
      props: {
        testimonials,
        faqData,
        courseLevels,
        cached,
        public: true
      }
    };

  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    
    // Return fallback data if Redis/DB fails
    return {
      props: {
        testimonials: [],
        faqData: [],
        courseLevels: [],
        cached: false,
        error: 'Failed to load data',
        public: true
      }
    };
  }
}
