import { Box, Flex } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

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

  return (
    <>
      {ShowLayoutRoute[router.pathname] ? (
        <Flex bg={'#f8f9fc'} h="100vh" overflow={'scroll'} flexDirection={'column'}>
          <AppMenu />
          <>{children}</>
        </Flex>
      ) : (
        <Box h="100vh">{children}</Box>
      )}
    </>
  );
}
