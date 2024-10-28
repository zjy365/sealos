import useSessionStore from '@/store/session';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Index() {
  const router = useRouter();
  const { authUser, delAppSession } = useSessionStore();

  useEffect(() => {
    if (router?.query?.orderId) {
      const orderId = router?.query?.orderId;
      router.push({
        pathname: '/workorder/detail',
        query: {
          orderId: orderId
        }
      });
    } else {
      router.push('/workorders');
    }
  }, [router]);

  useEffect(() => {
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
  }, []);

  return <div></div>;
}
