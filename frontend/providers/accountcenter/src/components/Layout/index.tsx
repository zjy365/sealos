import Sidebar from '@/components/Sidebar';
import { Flex, Box, Text, Center } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { useTranslation } from 'next-i18next';
import { GeistSans } from '@/fonts';
import { useLoading } from '@/hooks/useLoading';

function Layout({ children, loading }: { children?: ReactNode; loading?: boolean }) {
  const { t } = useTranslation();
  const { Loading } = useLoading();
  return (
    <div className={GeistSans.className}>
      <Flex
        justify={'space-between'}
        px={'120px'}
        borderY={'1px solid #EFEFEF'}
        align={'center'}
        h={'96px'}
        position={'fixed'}
        w={'100%'}
        zIndex={100}
        bg={'#fff'}
        top={0}
      >
        <Flex align={'center'} gap={'12px'}>
          <Text fontSize={'24px'} fontWeight={600} lineHeight={'32px'}>
            {t('AccountCenter')}
          </Text>
        </Flex>
      </Flex>
      <Flex
        mt={'96px'}
        justify={'center'}
        mx={'auto'}
        maxW={'1440px'}
        columnGap={'24px'}
        minW={'1280px'}
        p={'24px 12px'}
        position={'relative'}
      >
        <Box w={'266px'} position={'relative'}>
          <Sidebar position={'sticky'} top={'120px'} />
        </Box>
        <Box w={'886px'} position="relative">
          {children}
          <Loading loading={loading} fixed={false} />
        </Box>
      </Flex>
    </div>
  );
}

export default Layout;
