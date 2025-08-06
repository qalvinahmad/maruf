import Head from 'next/head';

const SEOHead = ({
  title = "Al-Makruf - Platform Belajar Al-Qur'an & Makhrajul Huruf Online Terbaik",
  description = "Belajar Al-Qur'an dan Makhrajul Huruf dengan mudah dan menyenangkan. Platform pembelajaran interaktif dengan metode modern dan guru berpengalaman.",
  keywords = "belajar quran online, makhrajul huruf, tajwid, tilawah, kursus quran, ngaji online, pembelajaran islam",
  ogImage = "https://almakruf.com/images/og-image.jpg",
  ogType = "website",
  canonicalUrl = "https://almakruf.com",
  noIndex = false,
  noFollow = false,
  structuredData = null,
  additionalMeta = []
}) => {
  const robotsContent = `${noIndex ? 'noindex' : 'index'},${noFollow ? 'nofollow' : 'follow'}`;
  
  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />
      <meta name="language" content="Indonesian" />
      <meta name="author" content="Al-Makruf Education" />
      <meta name="publisher" content="Al-Makruf" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="id_ID" />
      <meta property="og:site_name" content="Al-Makruf" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
      <meta property="twitter:creator" content="@almakruf" />
      
      {/* Additional Meta Tags */}
      {additionalMeta.map((meta, index) => (
        <meta key={index} {...meta} />
      ))}
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      )}
    </Head>
  );
};

// Predefined SEO configs for different pages
export const seoConfigs = {
  homepage: {
    title: "Al-Makruf - Platform Belajar Al-Qur'an & Makhrajul Huruf Online Terbaik",
    description: "Belajar Al-Qur'an dan Makhrajul Huruf dengan mudah dan menyenangkan. Platform pembelajaran interaktif dengan metode modern dan guru berpengalaman.",
    keywords: "belajar quran online, makhrajul huruf, tajwid, tilawah, kursus quran, ngaji online, pembelajaran islam",
    canonicalUrl: "https://almakruf.com"
  },
  
  dashboard: {
    title: "Dashboard - Al-Makruf",
    description: "Dashboard pembelajaran Al-Qur'an Anda. Pantau progress belajar dan akses materi pembelajaran.",
    keywords: "dashboard quran, progress belajar, materi pembelajaran",
    canonicalUrl: "https://almakruf.com/dashboard",
    noIndex: true // Private area
  },
  
  learning: {
    title: "Belajar Al-Qur'an - Modul Pembelajaran | Al-Makruf",
    description: "Modul pembelajaran Al-Qur'an interaktif dengan sistem tracking progress dan feedback real-time.",
    keywords: "modul quran, pembelajaran interaktif, tracking progress",
    canonicalUrl: "https://almakruf.com/learning"
  },
  
  shop: {
    title: "Toko - Beli Item Pembelajaran | Al-Makruf",
    description: "Belanja item pembelajaran Al-Qur'an dan upgrade pengalaman belajar Anda.",
    keywords: "toko quran, item pembelajaran, upgrade belajar",
    canonicalUrl: "https://almakruf.com/shop"
  },
  
  admin: {
    title: "Admin Panel - Al-Makruf",
    description: "Panel administrasi untuk mengelola platform pembelajaran Al-Qur'an.",
    canonicalUrl: "https://almakruf.com/admin",
    noIndex: true,
    noFollow: true
  }
};

// Generate structured data for different content types
export const generateStructuredData = (type, data) => {
  const baseUrl = "https://almakruf.com";
  
  switch (type) {
    case 'organization':
      return {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": "Al-Makruf",
        "url": baseUrl,
        "logo": `${baseUrl}/logo.png`,
        "description": "Platform pembelajaran Al-Qur'an dan Makhrajul Huruf online dengan metode interaktif",
        "foundingDate": "2024",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "ID"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer support",
          "availableLanguage": "Indonesian"
        }
      };
      
    case 'course':
      return {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": data.name || "Kursus Al-Qur'an dan Makhrajul Huruf",
        "description": data.description || "Pembelajaran Al-Qur'an komprehensif dengan metode modern",
        "provider": {
          "@type": "EducationalOrganization",
          "name": "Al-Makruf",
          "url": baseUrl
        },
        "courseMode": "online",
        "inLanguage": "id",
        "isAccessibleForFree": data.isFree || true
      };
      
    case 'article':
      return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": data.title,
        "description": data.description,
        "author": {
          "@type": "Organization",
          "name": "Al-Makruf"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Al-Makruf",
          "logo": {
            "@type": "ImageObject",
            "url": `${baseUrl}/logo.png`
          }
        },
        "datePublished": data.publishDate,
        "dateModified": data.modifiedDate || data.publishDate
      };
      
    default:
      return null;
  }
};

export default SEOHead;
