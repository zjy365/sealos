import { useGlobalStore } from '@/store/global';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const RedirectPage = () => {
  const router = useRouter();
  const { setLastRoute } = useGlobalStore();

  useEffect(() => {
    const handleRedirect = (name?: string) => {};

    if (router.isReady) {
      const { name } = router.query as { name?: string };
      handleRedirect(name);
    }
  }, [router, router.isReady, router.query]);

  return null;
};

export default RedirectPage;
