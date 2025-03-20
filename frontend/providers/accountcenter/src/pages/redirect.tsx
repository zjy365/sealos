import { useRouter } from 'next/router';
import { useEffect } from 'react';

const RedirectPage = () => {
  const router = useRouter();

  useEffect(() => {
    const handleUrlParams = () => {
      const { page, name } = router.query as { page?: string; name?: string };

      if (page) {
        router.replace(`/${page}`);
        return;
      }

      if (name) {
        // todo: handle InternalAppCall
        return;
      }

      // default redirect to setting page
      router.replace('/setting');
    };

    if (router.isReady) {
      handleUrlParams();
    }
  }, [router, router.isReady]);

  return null;
};

export default RedirectPage;
