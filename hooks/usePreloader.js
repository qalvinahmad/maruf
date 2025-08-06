import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const usePreloader = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [shouldShowPreloader, setShouldShowPreloader] = useState(false);

  useEffect(() => {
    // Check apakah sedang di halaman landing (index)
    const isLandingPage = router.pathname === '/';
    
    if (isLandingPage) {
      // Tampilkan preloader setiap kali halaman landing dimuat
      setShouldShowPreloader(true);
      setIsLoading(true);
    } else {
      // Jika bukan halaman landing, jangan tampilkan preloader
      setShouldShowPreloader(false);
      setIsLoading(false);
    }
  }, [router.pathname]);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // Function untuk reset preloader (untuk testing atau keperluan khusus)
  const resetPreloader = () => {
    setIsLoading(true);
    setShouldShowPreloader(true);
  };

  return {
    isLoading,
    shouldShowPreloader,
    setLoading: handleLoadingComplete,
    resetPreloader
  };
};

export default usePreloader;
