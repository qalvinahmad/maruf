import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import FaqSection from '../components/FaqSection';
import FeatureInteractive from '../components/FeatureInteractive';
import Footer from '../components/Footer';
import RegistrationSection from '../components/RegistrationSection';
import TestimonialSection from '../components/TestimonialSection';
import { MobileNav, MobileNavHeader, MobileNavMenu, MobileNavToggle, Navbar, NavbarButton, NavbarLogo, NavBody, NavItems } from '../components/ui/resizable-navbar';
import { SmoothScrollHero } from '../components/ui/smooth';
import LevelCarousel from '../components/widget/carousel';
import Features from '../components/widget/features';
import { ScrollProgress } from '../src/components/magicui/scroll-progress';


export default function Home() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Beranda", link: "#" },
    { name: "Fitur", link: "#features" },
    { name: "Tingkatan", link: "#levels" },
    { name: "Testimoni", link: "#testimonials" },
    { name: "FAQ", link: "#faq" },
  ];

  return (
    
    <div className="bg-background font-poppins">
    
      <Head>
        <title> Ma'ruf - Platform Belajar Al-Qur'an & Makhrajul Huruf</title>
        <meta name="description" content="Platform interaktif untuk belajar Al-Qur'an dan Makhrajul Huruf dengan metode yang menyenangkan" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      <main>
                {/* Scroll progress bar pas di bawah navbar */}
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
        <LevelCarousel />
        <TestimonialSection />
        <FaqSection />
        <RegistrationSection />
        <Footer />
   
      </main>
    </div>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      public: true
    }
  };
}
