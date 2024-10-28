import useSessionStore from '@/store/session';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Index() {
  const router = useRouter();
  const { authUser, delAppSession } = useSessionStore();

  useEffect(() => {
    if (!router.isReady) return;
    const token = router.query?.token;

    if (token) {
      authUser(token as string);
    } else {
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_MOCK_USER) {
        authUser(process.env.NEXT_PUBLIC_MOCK_USER);
      } else {
        delAppSession();
      }
    }

    const path = router?.query?.orderId
      ? `/workorder/detail?orderId=${router.query.orderId}`
      : '/workorders';

    if (router.asPath !== path) {
      router.replace(path);
    }
  }, [authUser, delAppSession, router, router.isReady]);

  return <div></div>;
}
