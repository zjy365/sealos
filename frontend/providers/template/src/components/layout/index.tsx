import { Box, Flex } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import { useSearchStore } from '@/store/search';

const ShowLayoutRoute: Record<string, boolean> = {
  '/': true,
  '/app': true,
  '/deploy': true
};

const AppMenu = dynamic(() => import('./appmenu'), {
  ssr: false,
  loading: () => <div></div>
});

export default function Layout({ children }: { children: JSX.Element }) {
  const router = useRouter();
  const scroll = useRef<HTMLDivElement>(null);
  const { appType } = useSearchStore();

  useEffect(() => {
    if (scroll.current) {
      scroll.current.scrollTo({
        top: 0,
        left: 0
      });
    }
  }, [appType, router.pathname]);

  return (
    <>
      {ShowLayoutRoute[router.pathname] ? (
        <Flex bg={'#f8f9fc'} h="100vh" ref={scroll} overflow={'scroll'} flexDirection={'column'}>
          <AppMenu />
          <>{children}</>
        </Flex>
      ) : (
        <Box h="100vh">{children}</Box>
      )}
    </>
  );
}
