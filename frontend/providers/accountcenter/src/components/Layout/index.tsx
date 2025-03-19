import Sidebar from '@/components/Sidebar';
import { Flex, Box, Text, Center } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import MyIcon from '@/components/Icon';
import { useTranslation } from 'next-i18next';
import { GeistSans } from '@/fonts';

function Layout({ children }: { children?: ReactNode }) {
  const { t } = useTranslation();
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
        <Box w={'886px'}>{children}</Box>
      </Flex>
    </div>
  );
}

export default Layout;
