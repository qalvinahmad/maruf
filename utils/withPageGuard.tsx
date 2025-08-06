import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export function withPageGuard(WrappedComponent: any) {
  return function GuardedPage(props: any) {
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
      setMounted(true);
    }, []);

    // Only render component client-side
    if (!mounted) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

export const getServerSideProps = async () => {
  return {
    props: {}
  };
};
