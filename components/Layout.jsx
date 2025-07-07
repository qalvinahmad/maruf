import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Layout({ children }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      // Save scroll position before route change
      sessionStorage.setItem(
        `scrollPos-${window.location.pathname}`,
        window.scrollY.toString()
      );
    };

    const handleRouteComplete = () => {
      // Restore scroll position after route change
      const savedScrollPos = sessionStorage.getItem(
        `scrollPos-${window.location.pathname}`
      );
      if (savedScrollPos) {
        window.scrollTo(0, parseInt(savedScrollPos));
      } else {
        window.scrollTo(0, 0);
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);
    router.events.on('routeChangeComplete', handleRouteComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
      router.events.off('routeChangeComplete', handleRouteComplete);
    };
  }, [router]);

  return <>{children}</>;
}
